import Breadcrumbs from "./Breadcrumbs";
import PageBanner from "@/components/store/PageBanner";
import CategoryListing from "@/components/category/CategoryListing";
import { getQuantityOfferSlides } from "@/components/store/promo-slides";
import { getActiveBanners, getStoreFilters, getStoreProducts, toCardProduct, type BannerPlacement } from "@/lib/storefront";
import type { BannerSlide } from "@/components/store/BannerSlider";

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
}

export default async function CollectionPage(props: CollectionPageProps) {
  const { categorySlug, title, showFullFilters = false, showProductFilters = false, bannerPlacement, newest = false } = props;
  const [products, filters, banner] = await Promise.all([
    getStoreProducts({ categorySlug: showFullFilters ? undefined : categorySlug, newest }),
    showFullFilters || showProductFilters ? getStoreFilters(showFullFilters ? undefined : categorySlug) : Promise.resolve({}),
    bannerPlacement ? getActiveBanners(bannerPlacement) : Promise.resolve([]),
  ]);
  const promoSlides = bannerPlacement
    ? getQuantityOfferSlides(categorySlug ? title : "the collection", categorySlug ? `/${categorySlug}` : "/shop")
    : [];
  const featureBanner = categorySlug ? categoryFeatureBanner(categorySlug, title) : shopFeatureBanner;
  const slides = [featureBanner, ...banner, ...promoSlides];
  return <main className="shop-home-body min-h-screen bg-[#FFFDFC]"><Breadcrumbs title={title} isShop={bannerPlacement === "shop"} category={showFullFilters && categorySlug ? products.find(product => product.category.slug === categorySlug)?.category.name : undefined} /><PageBanner banners={slides} title={title} category={Boolean(categorySlug) || bannerPlacement === "shop"} /><CategoryListing key={categorySlug ?? "all"} initialCategorySlug={categorySlug} products={products.map(toCardProduct)} productCount={products.length} filters={filters} showFullFilters={showFullFilters} showProductFilters={showProductFilters} /></main>;
}
