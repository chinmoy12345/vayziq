import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import OfferZone from "@/components/home/OfferZone";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturedReviews from "@/components/home/FeaturedReviews";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";
import WatchAndBuy from "@/components/home/WatchAndBuy";
import Hero from "@/components/home/Hero";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getActiveBanners, getActiveCategories, getEditorialWatchBuyProducts, getStoreProducts, getWatchBuyProducts, toCardProduct } from "@/lib/storefront";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Women’s Ethnic Wear Online", description: `Shop women’s sarees, kurtis and nightwear at ${branding.name}. Explore new arrivals, thoughtful styles and offers with delivery across India.`, alternates: { canonical: "/" }, openGraph: { title: `Women’s Ethnic Wear Online | ${branding.name}`, description: `Explore sarees, kurtis and nightwear at ${branding.name}, with thoughtful styles and new arrivals.`, url: "/", type: "website" } };
}

export default async function Home() {
  const visibility = await getHomepageVisibility();
  const [categories, featured, newArrivals, banners, watchProducts, editorialWatchProducts] = await Promise.all([
    getActiveCategories(),
    visibility.featuredCollection ? getStoreProducts({ featured: true, take: 4 }) : Promise.resolve([]),
    visibility.newArrivals ? getStoreProducts({ newest: true, take: 4 }) : Promise.resolve([]),
    getActiveBanners("home"),
    visibility.watchAndBuy ? getWatchBuyProducts() : Promise.resolve([]),
    visibility.watchAndBuy ? getEditorialWatchBuyProducts() : Promise.resolve([]),
  ]);
  return <>
    <Hero banners={banners.map(({ title, subtitle, image, link }) => ({ title, subtitle, image, link }))} />
    {visibility.offerZone && <OfferZone />}
    <Categories categories={categories} />
    {visibility.featuredCollection && <FeaturedProducts products={featured.map(toCardProduct)} />}
    {visibility.watchAndBuy && <WatchAndBuy products={watchProducts} editorialProducts={editorialWatchProducts} />}
    {visibility.newArrivals && <NewArrivals products={newArrivals.map(toCardProduct)} />}
    {visibility.customerReviews && <FeaturedReviews />}
    {visibility.newsletter && <Newsletter />}
  </>;
}
