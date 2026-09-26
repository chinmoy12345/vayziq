import type { MetadataRoute } from "next";
import prisma from "@/lib/db";
import { getActiveCategories } from "@/lib/storefront";
import { getBlogPosts } from "@/lib/blog";

const site = "https://tantuka.in";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, subcategories, products, offerBanners, blogPosts] = await Promise.all([
    getActiveCategories(),
    prisma.category.findMany({ where: { status: "active", parentId: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({
      where: { status: "active", category: { status: "active" } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.banner.findMany({
      where: { active: true, placement: "offer-zone" },
      select: { id: true, updatedAt: true },
    }),
    getBlogPosts(),
  ]);

  const staticPages = [
    ["", 1], ["shop", 0.9], ["about", 0.5], ["contact", 0.5], ["privacy", 0.3],
    ["returns", 0.5], ["shipping", 0.5], ["watch-buy", 0.7], ["blog", 0.7],
    ["offers/buy2save50", 0.7], ["offers/buy3save90", 0.7],
  ] as const;
  const reservedSlugs = new Set(["shop", "account", "product", "cart", "checkout", "login", "register", "search", "wishlist", "about", "contact", "privacy", "returns", "shipping", "offers", "blog", "api", "admin", "watch-buy"]);

  return [
    ...staticPages.map(([slug, priority]) => ({ url: slug ? site + "/" + slug : site, changeFrequency: "weekly" as const, priority })),
    ...categories.filter(category => !reservedSlugs.has(category.slug)).map(category => ({ url: site + "/" + category.slug, lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...subcategories.filter(category => !reservedSlugs.has(category.slug)).map(category => ({ url: site + "/" + category.slug, lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map(product => ({ url: site + "/product/" + product.slug, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...offerBanners.map(banner => ({ url: site + "/offers/" + banner.id, lastModified: banner.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...blogPosts.map(post => ({ url: site + "/blog/" + post.slug, lastModified: new Date(post.updatedAt || post.date), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
