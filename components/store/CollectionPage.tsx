import Breadcrumbs from "./Breadcrumbs";
import PageBanner from "@/components/store/PageBanner";
import CategoryListing from "@/components/category/CategoryListing";
import { getQuantityOfferSlides } from "@/components/store/promo-slides";
import { getActiveBanners, getStoreFilters, getStoreProducts, toCardProduct, type BannerPlacement } from "@/lib/storefront";
import type { BannerSlide } from "@/components/store/BannerSlider";

const CATEGORY_FEATURE_BANNERS: Record<string, BannerSlide> = {
  sarees: {
    title: "Sarees, woven to be remembered",
    subtitle: "Heritage-inspired weaves for celebrations and everyday elegance.",
    image: "/images/category-banners/sarees.webp",
    link: "/sarees",
    overlayText: true,
  },
  kurtis: {
    title: "Easy elegance, every day",
    subtitle: "Printed and embroidered kurtis made for effortless style.",
    image: "/images/category-banners/kurtis.webp",
    link: "/kurtis",
    overlayText: true,
  },
  nightwear: {
    title: "Slow down in softer style",
    subtitle: "Comfort-first nightwear for the quieter moments of your day.",
    image: "/images/category-banners/nightwear.webp",
    link: "/nightwear",
    overlayText: true,
  },
};

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
}

export default async function CollectionPage(props: CollectionPageProps) {
  const { categorySlug, title, showFullFilters = false, showProductFilters = false, bannerPlacement } = props;
  const [products, filters, banner] = await Promise.all([
    getStoreProducts({ categorySlug: showFullFilters ? undefined : categorySlug }),
    showFullFilters || showProductFilters ? getStoreFilters(showFullFilters ? undefined : categorySlug) : Promise.resolve({}),
    bannerPlacement ? getActiveBanners(bannerPlacement) : Promise.resolve([]),
  ]);
  const promoSlides = bannerPlacement
    ? getQuantityOfferSlides(categorySlug ? title : "the collection", categorySlug ? `/${categorySlug}` : "/shop")
    : [];
  const categoryFeatureBanner = categorySlug ? CATEGORY_FEATURE_BANNERS[categorySlug] : undefined;
  const slides = [...(categoryFeatureBanner ? [categoryFeatureBanner] : []), ...banner, ...promoSlides];
  return <main className="shop-home-body min-h-screen bg-[#FFFDFC]"><Breadcrumbs title={title} isShop={bannerPlacement === "shop"} category={showFullFilters && categorySlug ? products.find(product => product.category.slug === categorySlug)?.category.name : undefined} /><PageBanner banners={slides} title={title} category={Boolean(categorySlug) || bannerPlacement === "shop"} /><CategoryListing key={categorySlug ?? "all"} initialCategorySlug={categorySlug} products={products.map(toCardProduct)} productCount={products.length} filters={filters} showFullFilters={showFullFilters} showProductFilters={showProductFilters} /></main>;
}
