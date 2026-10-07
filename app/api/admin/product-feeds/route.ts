import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { buildFeedFromInput, getMetaFeeds, publicFeed, saveMetaFeeds, validateFeed, type MetaFeed } from "@/lib/meta-product-feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function productsAndCategories() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "active", category: { status: "active" } }, orderBy: { name: "asc" }, select: { id: true, name: true, sku: true, categoryId: true, stock: true, hasVariations: true, variants: { select: { stock: true } } } }),
    prisma.category.findMany({ where: { status: "active" }, orderBy: [{ parentId: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true, parentId: true } }),
  ]);
  return { products: products.map(product => ({ ...product, inStock: product.hasVariations ? product.variants.some(variant => variant.stock > 0) : product.stock > 0 })), categories };
}

export async function GET() {
  if (!(await requireAdminPermission("storefront", "view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const [feeds, options] = await Promise.all([getMetaFeeds(), productsAndCategories()]);
  const validated = await Promise.all(feeds.map(async feed => ({ ...publicFeed(feed), ...(await validateFeed(feed)) })));
  return NextResponse.json({ success: true, feeds: validated, ...options }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!(await requireAdminPermission("storefront", "create"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    const feeds = await getMetaFeeds();
    const created = await buildFeedFromInput(await request.json());
    if (feeds.some(feed => feed.slug === created.slug)) throw new Error("That feed URL slug is already in use.");
    const validation = await validateFeed(created);
    await saveMetaFeeds([...feeds, created]);
    return NextResponse.json({ success: true, feed: { ...publicFeed(created), ...validation } }, { status: 201 });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to create feed." }, { status: 400 }); }
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("storefront", "update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json() as { id?: string; action?: string; feed?: unknown };
    const feeds = await getMetaFeeds();
    const index = feeds.findIndex(feed => feed.id === body.id);
    if (index < 0) return NextResponse.json({ success: false, message: "Feed not found." }, { status: 404 });
    if (body.action === "generate") {
      const validation = await validateFeed(feeds[index]);
      const next: MetaFeed = { ...feeds[index], lastGeneratedAt: new Date().toISOString() };
      feeds[index] = next;
      await saveMetaFeeds(feeds);
      return NextResponse.json({ success: true, feed: { ...publicFeed(next), ...validation }, validation });
    }
    const updated = await buildFeedFromInput(body.feed, feeds[index]);
    if (feeds.some((feed, candidate) => candidate !== index && feed.slug === updated.slug)) throw new Error("That feed URL slug is already in use.");
    const validation = await validateFeed(updated);
    feeds[index] = updated;
    await saveMetaFeeds(feeds);
    return NextResponse.json({ success: true, feed: { ...publicFeed(updated), ...validation } });
  } catch (error) { return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to update feed." }, { status: 400 }); }
}

export async function DELETE(request: Request) {
  if (!(await requireAdminPermission("storefront", "delete"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  const feeds = await getMetaFeeds();
  if (!id || !feeds.some(feed => feed.id === id)) return NextResponse.json({ success: false, message: "Feed not found." }, { status: 404 });
  await saveMetaFeeds(feeds.filter(feed => feed.id !== id));
  return NextResponse.json({ success: true });
}
