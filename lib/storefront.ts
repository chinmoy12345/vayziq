import { productColors } from "@/lib/product-colors";
import { getStoreMenuSettings } from "@/lib/store-menu-settings";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
type StoreProduct = Prisma.ProductGetPayload<{ include: { category: { include: { parent: { select: { slug: true } } } }; images: true; options: { include: { values: true } } } }>;
type StoreCardProduct = StoreProduct & { cardRating?: number; cardReviewCount?: number };
import { cache } from "react";

import prisma from "@/lib/db";
import type { CategoryFilterConfig } from "@/components/category/CategoryFilters";
import type { Product } from "@/components/product/ProductCard";

const FALLBACK_IMAGE = "/logo.png";
const DEFAULT_COLORS = ["Maroon", "Pink", "Blue", "Green", "Beige", "Black"];
const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const productFilterValues = (product: StoreProduct) => {
  const valuesFor = (name: string) => product.options.filter((option) => option.name.toLowerCase() === name).flatMap((option) => option.values.map((value) => value.value));
  const sizes = valuesFor("size");
  const colors = productColors(product);
  return {
    sizes: sizes.length ? sizes : (product.category.slug === "sarees" ? ["Free Size"] : [DEFAULT_SIZES[product.id % DEFAULT_SIZES.length]]),
    colors: colors.length ? colors : [DEFAULT_COLORS[product.id % DEFAULT_COLORS.length]],
  };
};

export const formatPrice = (value: { toString(): string } | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));

export const getStoreProducts = cache(async (options?: {
  categorySlug?: string;
  query?: string;
  featured?: boolean;
  take?: number;
  newest?: boolean;
}) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      ...(options?.featured ? { featured: true } : {}),
      ...(options?.categorySlug
        ? { category: { status: "active", OR: [{ slug: options.categorySlug }, { parent: { is: { slug: options.categorySlug } } }] } }
        : {}),
    },
    include: {
      category: { include: { parent: { select: { slug: true } } } },
      images: { orderBy: { sortOrder: "asc" } },
      options: { include: { values: { orderBy: { sortOrder: "asc" } } } },
    },
    orderBy: options?.newest ? { createdAt: "desc" } : [{ featured: "desc" }, { createdAt: "desc" }],
    take: options?.take,
  });

  const reviewStats = products.length ? await prisma.review.groupBy({ by: ["productId"], where: { approved: true, productId: { in: products.map(product => product.id) } }, _avg: { rating: true }, _count: { _all: true } }) : [];
  const statsByProduct = new Map(reviewStats.map(stat => [stat.productId, { rating: stat._avg.rating ?? undefined, count: stat._count._all }]));
  const cardProducts: StoreCardProduct[] = products.map(product => { const stats = statsByProduct.get(product.id); return { ...product, cardRating: stats?.count ? stats.rating : undefined, cardReviewCount: stats?.count ?? 0 }; });
  if (!options?.query?.trim()) return cardProducts;
  const queryTokens = normalizeSearch(options.query).split(" ").filter(Boolean);
  return cardProducts
    .map((product) => ({ product, score: productSearchScore(product, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || Number(right.product.featured) - Number(left.product.featured) || right.product.createdAt.getTime() - left.product.createdAt.getTime())
    .map(({ product }) => product);
});

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function productSearchScore(product: StoreProduct, tokens: string[]) {
  const name = normalizeSearch(product.name);
  const category = normalizeSearch(product.category.name);
  const description = normalizeSearch(product.description ?? "");
  const haystack = `${name} ${category} ${description}`;
  return tokens.reduce((score, token) => {
    if (name === token) return score + 120;
    if (name.startsWith(token)) return score + 70;
    if (name.includes(token)) return score + 45;
    if (category.includes(token)) return score + 32;
    if (description.includes(token)) return score + 16;
    return haystack.split(" ").some((word) => editDistance(word, token) <= 1) ? score + 10 : score;
  }, 0);
}

function editDistance(left: string, right: string) {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const value = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = row[j];
      row[j] = value;
    }
  }
  return row[right.length];
}

export type BannerPlacement = "home" | "shop" | "search" | "sarees" | "kurtis" | "nightwear" | "offer-zone" | `category:${string}`;

export const getActiveBanner = cache(async (placement: BannerPlacement) =>
  prisma.banner.findFirst({
    where: { active: true, placement },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
);

export const getActiveBanners = cache(async (placement: BannerPlacement) =>
  prisma.banner.findMany({
    where: { active: true, placement },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
);

export const toCardProduct = (product: StoreCardProduct): Product => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  category: product.category.name,
  categorySlug: product.category.slug,
  parentCategorySlug: product.category.parent?.slug ?? null,
  price: formatPrice(product.price),
  oldPrice: product.comparePrice ? formatPrice(product.comparePrice) : undefined,
  image: product.images[0]?.image ?? FALLBACK_IMAGE,
  images: product.images.map(image => image.image),
  rating: product.cardRating,
  reviews: product.cardReviewCount,
  badge: product.featured ? "FEATURED" : undefined,
  createdAt: product.createdAt.toISOString(),
  filterValues: productFilterValues(product),
  colorCount: productColors(product).length,
});

async function getProductEngagementCounts(productIds: number[]) {
  const empty = new Map<number, { likeCount: number; shareCount: number }>();
  if (!productIds.length) return empty;
  try {
    const rows = await prisma.productEngagement.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, likeCount: true, shareCount: true },
    });
    return new Map(rows.map((row) => [row.productId, { likeCount: row.likeCount, shareCount: row.shareCount }]));
  } catch (error) {
    // Allow an unmigrated development database to render with zero counts.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2021") return empty;
    throw error;
  }
}

export const getWatchBuyProducts = cache(async (limit: number | null = 6) => {
  const { getStoreReels } = await import("@/lib/reels");
  const managedReels = (await getStoreReels()).filter((reel) => reel.enabled && reel.productId !== null);
  const managedProductIds = managedReels.flatMap((reel) => reel.productId === null ? [] : [reel.productId]);
  const products = await prisma.product.findMany({
    where: { status: "active", category: { status: "active" }, OR: [{ videoUrl: { not: null } }, ...(managedProductIds.length ? [{ id: { in: managedProductIds } }] : [])] },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    ...(limit === null ? {} : { take: limit }),
  });
  const engagements = await getProductEngagementCounts(products.map((product) => product.id));

  const mapped = products.flatMap((product) => {
    const reel = managedReels.find((item) => item.productId === product.id);
    const videoUrl = reel?.videoUrl || product.videoUrl;
    return videoUrl ? [{
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    image: reel?.poster || product.images[0]?.image || FALLBACK_IMAGE,
    videoUrl,
    reelTitle: reel?.title,
    reelBadge: reel?.badge,
    reelCta: reel?.cta,
    likeCount: engagements.get(product.id)?.likeCount ?? 0,
    shareCount: engagements.get(product.id)?.shareCount ?? 0,
    }] : [];
  });
  const ordered = [...mapped].sort((a, b) => {
    const first = managedReels.findIndex((reel) => reel.productId === a.id);
    const second = managedReels.findIndex((reel) => reel.productId === b.id);
    return (first < 0 ? 9999 : first) - (second < 0 ? 9999 : second);
  });
  return limit === null ? ordered : ordered.slice(0, limit);
});

export const getEditorialWatchBuyProducts = cache(async () => {
    const products = await prisma.product.findMany({
    where: { status: "active", videoUrl: null, category: { slug: "sarees", status: "active" } },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 8,
  });
  const engagements = await getProductEngagementCounts(products.map((product) => product.id));
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category.name,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    image: product.images[0]?.image ?? FALLBACK_IMAGE,
    likeCount: engagements.get(product.id)?.likeCount ?? 0,
    shareCount: engagements.get(product.id)?.shareCount ?? 0,
  }));
});
export async function getStoreFilters(categorySlug?: string): Promise<CategoryFilterConfig> {
  const [categories, products, currentCategory] = await Promise.all([
    prisma.category.findMany({
      where: { status: "active", parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, slug: true },
    }),
    getStoreProducts({ categorySlug }),
    categorySlug
      ? prisma.category.findFirst({
          where: { slug: categorySlug, status: "active" },
          select: {
            name: true,
            slug: true,
            children: {
              where: { status: "active" },
              orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
              select: { name: true, slug: true },
            },
          },
        })
      : Promise.resolve(null),
  ]);
  const optionValues = (name: string) => {
    const counts = new Map<string, number>();
    products.forEach((product) => product.options.filter((option) => option.name.toLowerCase() === name).forEach((option) => option.values.forEach((value) => counts.set(value.value, (counts.get(value.value) ?? 0) + 1))));
    return [...counts].map(([name, count]) => ({ name, count }));
  };
  return {
    categories: [{ name: "All Products", count: products.length }, ...categories.map((category) => ({ name: category.name, slug: category.slug, count: products.filter((product) => product.category.slug === category.slug || product.category.parent?.slug === category.slug).length }))],
    subcategories: currentCategory?.children.length
      ? [{ name: "All " + currentCategory.name, slug: currentCategory.slug, count: products.length }, ...currentCategory.children.map((child) => ({ name: child.name, slug: child.slug, count: products.filter((product) => product.category.slug === child.slug).length }))]
      : undefined,
    fabrics: optionValues("fabric"),
    sizes: optionValues("size").length ? optionValues("size") : [...new Set(products.map((product) => productFilterValues(product).sizes[0]))].map((name) => ({ name, count: products.filter((product) => productFilterValues(product).sizes.includes(name)).length })),
    colors: (optionValues("color").length ? optionValues("color") : [...new Set(products.map((product) => productFilterValues(product).colors[0]))].map((name) => ({ name, count: products.filter((product) => productFilterValues(product).colors.includes(name)).length }))).map((color) => ({ ...color, value: colorValue(color.name) })),
    occasions: optionValues("occasion"),
  };
}

function colorValue(name: string) {
  return ({ Maroon: "#7F1D3A", Pink: "#E99AAE", Blue: "#476C9B", Green: "#5D8064", Beige: "#D4B998", Black: "#27272A" }[name] ?? "#B56F6F");
}

export const getActiveCategories = cache(async () =>
  prisma.category.findMany({
    where: { status: "active", parentId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: { where: { status: "active" } } } } },
  })
);

export const getActiveCategory = cache(async (slug: string) =>
  prisma.category.findFirst({ where: { slug, status: "active" } })
);

export const getActiveNavigationCategories = cache(async () => {
  const { enabled, categoryIds } = await getStoreMenuSettings();
  if (!enabled || categoryIds.length === 0) return [];
  return prisma.category.findMany({
    where: { id: { in: categoryIds }, status: "active", parentId: null },
    select: { name: true, slug: true, children: { where: { status: "active" }, select: { name: true, slug: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
});
