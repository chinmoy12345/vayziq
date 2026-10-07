import bcrypt from "bcryptjs";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import prisma from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const META_FEEDS_KEY = "meta_product_feeds_v1";
export type FeedSelection = { productIds: number[]; categoryIds: number[]; featured: boolean; badged: boolean; inStockOnly: boolean };
export type MetaFeed = { id: string; name: string; slug: string; username: string; passwordHash: string; active: boolean; selection: FeedSelection; country: string; language: string; currency: "INR"; lastGeneratedAt?: string };
export type PublicMetaFeed = Omit<MetaFeed, "passwordHash"> & { url: string; productCount?: number };
type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const ids = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id > 0))].slice(0, 2_000) : [];
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

export function parseFeeds(value: unknown): MetaFeed[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (!isRecord(item)) return [];
    const id = text(item.id, 100), name = text(item.name, 100), slug = slugify(text(item.slug, 100));
    const username = text(item.username, 100), passwordHash = text(item.passwordHash, 200), country = text(item.country, 2).toUpperCase(), language = text(item.language, 8).toLowerCase();
    if (!id || !name || !slug || !username || !passwordHash || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[A-Z]{2}$/.test(country) || !/^[a-z]{2,8}$/.test(language)) return [];
    const selectionValue = isRecord(item.selection) ? item.selection : {};
    return [{ id, name, slug, username, passwordHash, active: item.active === true,
      selection: { productIds: ids(selectionValue.productIds), categoryIds: ids(selectionValue.categoryIds), featured: selectionValue.featured === true, badged: selectionValue.badged === true, inStockOnly: selectionValue.inStockOnly !== false },
      country, language, currency: "INR", lastGeneratedAt: typeof item.lastGeneratedAt === "string" ? item.lastGeneratedAt : undefined }];
  });
}

export async function getMetaFeeds() {
  const row = await prisma.storeSetting.findUnique({ where: { key: META_FEEDS_KEY }, select: { value: true } });
  return parseFeeds(row?.value);
}

export async function saveMetaFeeds(feeds: MetaFeed[]) {
  await prisma.storeSetting.upsert({ where: { key: META_FEEDS_KEY }, update: { value: feeds as unknown as Prisma.InputJsonValue }, create: { key: META_FEEDS_KEY, value: feeds as unknown as Prisma.InputJsonValue } });
}

export function publicFeed(feed: MetaFeed): PublicMetaFeed {
  return { id: feed.id, name: feed.name, slug: feed.slug, username: feed.username, active: feed.active,
    selection: feed.selection, country: feed.country, language: feed.language, currency: feed.currency,
    lastGeneratedAt: feed.lastGeneratedAt, url: `${SITE_URL}/feeds/meta/${feed.slug}.xml` };
}

export async function buildFeedFromInput(value: unknown, existing?: MetaFeed): Promise<MetaFeed> {
  if (!isRecord(value)) throw new Error("Enter valid feed details.");
  const name = text(value.name, 100), slug = slugify(text(value.slug || value.name, 100)), username = text(value.username, 100);
  const password = typeof value.password === "string" ? value.password : "";
  const country = (text(value.country, 2) || "IN").toUpperCase(), language = (text(value.language, 8) || "en").toLowerCase();
  if (!name || !slug || !username || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Feed name, URL slug and username are required.");
  if (!/^[A-Z]{2}$/.test(country) || !/^[a-z]{2,8}$/.test(language)) throw new Error("Use a two-letter country and valid language code.");
  if (!existing && password.length < 12) throw new Error("Set a feed password with at least 12 characters.");
  if (password && password.length < 12) throw new Error("Feed passwords must be at least 12 characters.");
  const selectionValue = isRecord(value.selection) ? value.selection : {};
  return { id: existing?.id ?? crypto.randomUUID(), name, slug, username,
    passwordHash: password ? await bcrypt.hash(password, 12) : existing!.passwordHash,
    active: value.active !== false,
    selection: { productIds: ids(selectionValue.productIds), categoryIds: ids(selectionValue.categoryIds), featured: selectionValue.featured === true, badged: selectionValue.badged === true, inStockOnly: selectionValue.inStockOnly !== false },
    country, language, currency: "INR", lastGeneratedAt: existing?.lastGeneratedAt };
}

export async function getEligibleProducts(feed: MetaFeed) {
  const products = await prisma.product.findMany({
    where: { status: "active", category: { status: "active" } },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, options: { include: { values: true } }, variants: { include: { variantValues: { include: { optionValue: { include: { option: true } } } } } } },
    orderBy: { id: "asc" },
  });
  const hasExplicitSelection = feed.selection.productIds.length > 0 || feed.selection.categoryIds.length > 0;
  return products.filter(product => {
    // Selecting a parent category includes its active subcategories too, which is
    // what a merchandiser expects when choosing (for example) “Men”.
    const selected = !hasExplicitSelection
      || feed.selection.productIds.includes(product.id)
      || feed.selection.categoryIds.includes(product.categoryId)
      || (product.category.parentId !== null && feed.selection.categoryIds.includes(product.category.parentId));
    const stocked = product.hasVariations ? product.variants.some(variant => variant.stock > 0) : product.stock > 0;
    return selected && (!feed.selection.featured || product.featured) && (!feed.selection.badged || product.badgeEnabled) && (!feed.selection.inStockOnly || stocked);
  });
}

export async function validateFeed(feed: MetaFeed) {
  const products = await getEligibleProducts(feed);
  const issues: string[] = [];
  for (const product of products) {
    if (!product.images.length) issues.push(`${product.sku}: missing image`);
    if (!product.description?.trim()) issues.push(`${product.sku}: missing description`);
    if (Number(product.price) <= 0) issues.push(`${product.sku}: invalid price`);
  }
  return { productCount: products.length, issues: issues.slice(0, 100) };
}

const escapeXml = (value: string | number) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const cleanDescription = (value: string | null) => (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const absolute = (value: string) => /^https?:\/\//i.test(value) ? value : `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
const genderFor = (value: string) => /women/i.test(value) ? "female" : /men/i.test(value) ? "male" : "unisex";
const optionValues = (product: Awaited<ReturnType<typeof getEligibleProducts>>[number], name: string) => product.options.filter(option => option.name.toLowerCase() === name).flatMap(option => option.values.map(item => item.value));
const property = (name: string, value: string | number | undefined | null) => value === undefined || value === null || value === "" ? "" : `<g:${name}>${escapeXml(value)}</g:${name}>`;

export async function renderMetaFeed(feed: MetaFeed) {
  const products = await getEligibleProducts(feed);
  const entries = products.flatMap(product => {
    const images = product.images.map(image => absolute(image.image));
    if (!images.length) return [];
    const description = cleanDescription(product.description) || product.name;
    const gender = genderFor(`${product.category.slug} ${product.category.name}`);
    const material = optionValues(product, "material")[0] ?? optionValues(product, "fabric")[0];
    const base = { title: product.name, description, link: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`, image: images[0], additional: images.slice(1), gender, material };
    const rows = product.hasVariations && product.variants.length ? product.variants.map(variant => ({ id: variant.sku, price: Number(variant.price), stock: variant.stock, values: Object.fromEntries(variant.variantValues.map(item => [item.optionValue.option.name.toLowerCase(), item.optionValue.value])) })) : [{ id: product.sku, price: Number(product.price), stock: product.stock, values: {} as Record<string, string> }];
    return rows.map(row => {
      const compare = Number(product.comparePrice ?? 0);
      const title = Object.values(row.values).length ? `${base.title} - ${Object.values(row.values).join(" / ")}` : base.title;
      return `<item>${property("id", row.id)}${property("item_group_id", product.hasVariations ? product.sku : undefined)}${property("title", title)}${property("description", base.description)}${property("link", base.link)}${property("image_link", base.image)}${base.additional.map(image => property("additional_image_link", image)).join("")}${property("availability", row.stock > 0 ? "in stock" : "out of stock")}${property("condition", "new")}${property("price", `${(compare > row.price ? compare : row.price).toFixed(2)} INR`)}${compare > row.price ? property("sale_price", `${row.price.toFixed(2)} INR`) : ""}${property("brand", "Vayziq")}${property("google_product_category", "Apparel & Accessories > Clothing")}${property("target_country", feed.country)}${property("gender", base.gender)}${property("age_group", "adult")}${property("size", row.values.size)}${property("color", row.values.color ?? row.values.colour)}${property("material", base.material)}${property("mpn", row.id)}</item>`;
    });
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>${escapeXml(feed.name)}</title><link>${SITE_URL}</link><description>Vayziq product catalog</description>${entries.join("")}</channel></rss>`;
}
