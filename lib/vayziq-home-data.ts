import prisma from "@/lib/db";

export type VayziqHomeBanner = { image: string; alt: string; href: string };
export type VayziqHomeCategory = { id: number; name: string; slug: string; image: string };
export type VayziqHomeProduct = { id: number; name: string; slug: string; price: string; oldPrice: string | null; discountPercent: number | null; image: string; images: string[]; category: string; colors: string[]; options: { name: string; values: string[] }[]; rating: string; videoUrl: string | null };
export type VayziqHomeData = { banners: VayziqHomeBanner[]; categories: VayziqHomeCategory[]; products: VayziqHomeProduct[] };

const fallbackBanners: VayziqHomeBanner[] = [
  { image: "/vayziq/hero-paired-v2.png", alt: "VAYZIQ everyday collection", href: "/shop" },
  { image: "/vayziq/category-women.png", alt: "VAYZIQ women collection", href: "/women" },
  { image: "/vayziq/category-men.png", alt: "VAYZIQ men collection", href: "/men" },
  { image: "/vayziq/fashion-grid.png", alt: "VAYZIQ fashion essentials", href: "/shop" },
];

const fallbackImage = "/vayziq/fashion-grid.png";

export async function getVayziqHomeData(): Promise<VayziqHomeData> {
  const [banners, roots, products, reviewStats] = await Promise.all([
    prisma.banner.findMany({ where: { active: true, placement: "home" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 8 }),
    prisma.category.findMany({
      where: { status: "active", slug: { in: ["men", "women"] }, parentId: null },
      include: { children: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { status: "active", category: { status: "active" } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 3 }, category: true, options: { include: { values: { orderBy: { sortOrder: "asc" } } } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
    prisma.review.groupBy({ by: ["productId"], where: { approved: true }, _avg: { rating: true }, _count: { _all: true } }),
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

  return {
    banners: banners.length ? banners.map((banner) => ({ image: banner.image, alt: banner.title, href: banner.link || "/shop" })) : fallbackBanners,
    categories: categoryCards,
    products: products.map((product) => ({
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
    })),
  };
}
