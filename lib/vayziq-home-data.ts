import prisma from "@/lib/db";
import { offerTitle, type ProductOffer } from "@/lib/product-offers";

export type VayziqHomeBanner = { image: string; alt: string; href: string };
export type VayziqHomeOfferBanner = { image: string; title: string; subtitle: string | null; href: string };
export type VayziqHomeOffer = { id: number; code: string; title: string; condition: string; description: string | null };
export type VayziqHomeCategory = { id: number; name: string; slug: string; image: string };
export type VayziqHomeProduct = { id: number; name: string; slug: string; price: string; oldPrice: string | null; discountPercent: number | null; image: string; images: string[]; category: string; colors: string[]; options: { name: string; values: string[] }[]; rating: string; videoUrl: string | null; badge: string | null; badgeTone: string | null; inStock: boolean };
export type VayziqHomeData = { banners: VayziqHomeBanner[]; offerBanners: VayziqHomeOfferBanner[]; offers: VayziqHomeOffer[]; categories: VayziqHomeCategory[]; products: VayziqHomeProduct[]; catalogProducts: VayziqHomeProduct[]; recommendedProducts: VayziqHomeProduct[] };

const fallbackBanners: VayziqHomeBanner[] = [
  { image: "/vayziq/hero-paired-v2.png", alt: "VAYZIQ everyday collection", href: "/shop" },
  { image: "/vayziq/category-women.png", alt: "VAYZIQ women collection", href: "/women" },
  { image: "/vayziq/category-men.png", alt: "VAYZIQ men collection", href: "/men" },
  { image: "/vayziq/fashion-grid.png", alt: "VAYZIQ fashion essentials", href: "/shop" },
];

const fallbackImage = "/vayziq/fashion-grid.png";
const fallbackOfferBanners: VayziqHomeOfferBanner[] = [
  { image: "/vayziq/category-women.png", title: "More to wear. More to love.", subtitle: "Explore current offers on everyday streetwear.", href: "/offers" },
  { image: "/vayziq/category-men.png", title: "Good fits, better finds.", subtitle: "Find the latest Vayziq deals in one place.", href: "/offers" },
];

export async function getVayziqHomeData(): Promise<VayziqHomeData> {
  const now = new Date();
  const [banners, offerBanners, coupons, roots, products, reviewStats, recommendationSetting] = await Promise.all([
    prisma.banner.findMany({ where: { active: true, placement: "home" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 8 }),
    prisma.banner.findMany({ where: { active: true, placement: "offer-zone" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 2, select: { id: true, image: true, title: true, subtitle: true } }),
    prisma.coupon.findMany({ where: { active: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }] }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.category.findMany({
      where: { status: "active", slug: { in: ["men", "women"] }, parentId: null },
      include: { children: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: "active", category: { status: "active" } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 3 }, category: true, options: { include: { values: { orderBy: { sortOrder: "asc" } } } }, variants: { select: { stock: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.review.groupBy({ by: ["productId"], where: { approved: true }, _avg: { rating: true }, _count: { _all: true } }),
    prisma.storeSetting.findUnique({ where: { key: "homepage_you_may_like_products" }, select: { value: true } }),
  ]);

  const ratings = new Map(reviewStats.map((item) => [item.productId, item._count._all ? `${(item._avg.rating ?? 0).toFixed(1)} (${item._count._all})` : "New"]));
  const men = roots.find((category) => category.slug === "men");
  const women = roots.find((category) => category.slug === "women");
  const categoryCards = [men, women, ...(men?.children ?? [])].filter((category): category is NonNullable<typeof category> => Boolean(category)).slice(0, 7).map((category) => ({
    id: category.id,
    name: category.name.replace(/^Men's\s+/i, ""),
    slug: category.slug,
    image: category.image ?? fallbackImage,
  }));

  const catalogProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: `₹${Number(product.price).toLocaleString("en-IN")}`,
    oldPrice: product.comparePrice && Number(product.comparePrice) > Number(product.price) ? `₹${Number(product.comparePrice).toLocaleString("en-IN")}` : null,
    discountPercent: product.comparePrice && Number(product.comparePrice) > Number(product.price) ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100) : null,
    image: product.images[0]?.image ?? fallbackImage,
    images: product.images.length ? product.images.map((image) => image.image) : [fallbackImage],
    category: product.category.name,
    colors: product.options.find((option) => /colou?r/i.test(option.name))?.values.map((value) => value.value) ?? [],
    options: product.options.map((option) => ({ name: option.name, values: option.values.map((value) => value.value) })),
    rating: ratings.get(product.id) ?? "New",
    videoUrl: product.videoUrl,
    badge: product.badgeEnabled && product.badgeText ? product.badgeText : null,
    badgeTone: product.badgeEnabled && product.badgeText ? product.badgeTone : null,
    inStock: product.hasVariations ? product.variants.some((variant) => variant.stock > 0) : product.stock > 0,
  }));
  const selectedRecommendationIds = Array.isArray(recommendationSetting?.value)
    ? recommendationSetting.value.map(Number).filter(id => Number.isSafeInteger(id) && id > 0)
    : [];
  const catalogById = new Map(catalogProducts.map(product => [product.id, product]));
  const selectedRecommendations = selectedRecommendationIds.flatMap(id => catalogById.get(id) ? [catalogById.get(id)!] : []);

  return {
    banners: banners.length ? banners.map((banner) => ({ image: banner.image, alt: banner.title, href: banner.link || "/shop" })) : fallbackBanners,
    offerBanners: fallbackOfferBanners.map((fallback, index) => {
      const banner = offerBanners[index];
      return banner ? { image: banner.image, title: banner.title.trim() || fallback.title, subtitle: banner.subtitle?.trim() || null, href: `/offers/${banner.id}` } : fallback;
    }),
    offers: coupons.filter((coupon) => coupon.usageLimit === null || coupon.usageCount < coupon.usageLimit).map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      title: offerTitle({
        code: coupon.code,
        description: coupon.description ?? undefined,
        type: coupon.type,
        value: Number(coupon.value),
        minimum: Number(coupon.minimumOrder ?? 0),
        maximum: coupon.maximumDiscount === null ? null : Number(coupon.maximumDiscount),
        rules: coupon.rules as ProductOffer["rules"],
      }).toUpperCase(),
      condition: coupon.minimumOrder && Number(coupon.minimumOrder) > 0 ? `On Orders Above ₹${Number(coupon.minimumOrder).toLocaleString("en-IN")}` : "On Your Order",
      description: coupon.description,
    })),
    categories: categoryCards,
    // Keep hero merchandising intentionally compact, while the dedicated
    // catalog block below exposes every active product for an early launch.
    products: catalogProducts.slice(0, 12),
    catalogProducts,
    recommendedProducts: selectedRecommendations.length ? selectedRecommendations : [...catalogProducts.slice(0, 12)].reverse(),
  };
}
