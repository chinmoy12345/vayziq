import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { getBlogPosts } from "@/lib/blog";
import { getSeoEntries } from "@/lib/seo";
import { SEO_DEFAULTS, validateSeo } from "@/lib/seo-config";
export async function GET() {
  if (!await requireAdminPermission("settings", "view")) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  const [saved, products, categories, offers, posts, banners] = await Promise.all([getSeoEntries(), prisma.product.findMany({ select: { slug: true, name: true } }), prisma.category.findMany({ select: { slug: true, name: true } }), prisma.coupon.findMany({ select: { code: true } }), getBlogPosts(), prisma.banner.findMany({ where: { placement: "offer-zone" }, select: { id: true } })]);
  const pages = [ ...Object.entries(SEO_DEFAULTS).map(([path, [title, description]]) => ({ path, title, description })), ...products.map(p => ({ path: `/product/${p.slug}`, title: `${p.name} | Vayziq` })), ...categories.map(c => ({ path: `/${c.slug}`, title: `${c.name} | Vayziq` })), ...offers.map(o => ({ path: `/offer/${o.code}`, title: `${o.code} Offer | Vayziq` })), ...posts.map(p => ({ path: `/blog/${p.slug}`, title: p.seoTitle || p.title, description: p.seoDescription || p.excerpt })), ...banners.map(b => ({ path: `/offers/${b.id}`, title: "Streetwear offer | Vayziq" })) ];
  const uniquePages = pages.filter((page, index) => pages.findIndex(candidate => candidate.path === page.path) === index);
  return NextResponse.json({ saved, pages: uniquePages }, { headers: { "Cache-Control": "no-store" } });
}
export async function PUT(request: Request) {
  if (!await requireAdminPermission("settings", "update")) return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  try {
    const body = await request.json();
    const { path, entry } = validateSeo(body.path, body.entry);
    await prisma.storeSetting.upsert({ where: { key: `seo:${path}` }, create: { key: `seo:${path}`, value: entry }, update: { value: entry } });
    revalidatePath(path); revalidatePath("/sitemap.xml");
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to save SEO." }, { status: 400 }); }
}
