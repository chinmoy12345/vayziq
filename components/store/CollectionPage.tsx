import Breadcrumbs from "./Breadcrumbs";
import PageBanner from "@/components/store/PageBanner";
import CategoryListing from "@/components/category/CategoryListing";
import { getActiveBanner, getStoreFilters, getStoreProducts, toCardProduct, type BannerPlacement } from "@/lib/storefront";
import type { BannerSlide } from "@/components/store/BannerSlider";
import { SITE_URL } from "@/lib/seo";

const shopFeatureBanner: BannerSlide = {
  title: "Move freely. Live boldly.",
  subtitle: "Everyday essentials designed for comfort, confidence and movement.",
  image: "/vayziq/hero-paired-v2.png",
  link: "/shop",
  overlayText: true,
};

function categoryFeatureBanner(slug: string, title: string): BannerSlide {
  const label = title.replace(/^Men's\s+|^Women's\s+/i, "");
  const normalized = `${slug} ${title}`.toLowerCase();
  const image = normalized.includes("women") || normalized.includes("hoodie")
    ? "/vayziq/category-women.png"
    : normalized.includes("jogger")
      ? "/vayziq/category-joggers.png"
      : normalized.includes("t-shirt")
        ? "/vayziq/product-tshirt.png"
        : normalized.includes("accessor") || normalized.includes("track")
          ? "/vayziq/fashion-grid.png"
          : "/vayziq/category-men.png";
  return {
    title: `${label}, made to move`,
    subtitle: "Premium everyday wear with a clean fit, soft comfort and bold VAYZIQ attitude.",
    image,
    link: `/${slug}`,
    overlayText: true,
  };
}

interface CollectionPageProps {
  categorySlug?: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  image?: string;
  showFullFilters?: boolean;
  showProductFilters?: boolean;
  bannerPlacement?: Exclude<BannerPlacement, "home">;
  newest?: boolean;
  productIds?: number[];
}

export default async function CollectionPage(props: CollectionPageProps) {
  const { categorySlug, title, showFullFilters = false, showProductFilters = false, bannerPlacement, newest = false, productIds } = props;
  const [products, filters, banner] = await Promise.all([
    getStoreProducts({ categorySlug: showFullFilters ? undefined : categorySlug, newest, productIds }),
    showFullFilters || showProductFilters ? getStoreFilters(showFullFilters ? undefined : categorySlug, productIds) : Promise.resolve({}),
    bannerPlacement ? getActiveBanner(bannerPlacement) : Promise.resolve(null),
  ]);
  const featureBanner = categorySlug ? categoryFeatureBanner(categorySlug, title) : shopFeatureBanner;
  const slides: BannerSlide[] = [banner ? {
    title: banner.title?.trim() || title,
    subtitle: banner.subtitle,
    image: banner.image,
    link: banner.link || null,
  } : featureBanner];
  const listedProducts = categorySlug ? products.filter(product => product.category.slug === categorySlug || product.category.parent?.slug === categorySlug) : products;
  const structuredData = {
    "@context": "https://schema.org", "@type": "ItemList", name: title,
    numberOfItems: listedProducts.length,
    itemListElement: listedProducts.slice(0, 12).map((product, index) => ({
      "@type": "ListItem", position: index + 1, name: product.name,
      url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}`,
    })),
  };
  return <main className="shop-home-body min-h-screen bg-[#FFFDFC]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <Breadcrumbs title={title} isShop={bannerPlacement === "shop"} category={showFullFilters && categorySlug ? products.find(product => product.category.slug === categorySlug)?.category.name : undefined} />
    <PageBanner banners={slides} title={title} category={Boolean(categorySlug) || bannerPlacement === "shop"} />
    <header className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 lg:px-10"><h1 className="text-2xl font-bold tracking-tight text-neutral-900">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{props.subtitle}</p></header>
    <CategoryListing key={`${categorySlug ?? "all"}-${productIds?.join("-") ?? "all-products"}`} initialCategorySlug={categorySlug} products={products.map(toCardProduct)} productCount={products.length} filters={filters} showFullFilters={showFullFilters} showProductFilters={showProductFilters} />
  </main>;
}
