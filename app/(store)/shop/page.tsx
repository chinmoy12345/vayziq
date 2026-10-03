import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageSeo("/shop");
}

import CollectionPage from "@/components/store/CollectionPage";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string; products?: string }> }) {
  const { category, sort, products } = await searchParams;
  const newest = sort === "newest";
  const productIds = products?.split(",").map(value => Number(value)).filter(value => Number.isSafeInteger(value) && value > 0).slice(0, 100);
  const hasOfferProducts = Boolean(productIds?.length);
  return <CollectionPage categorySlug={category} title={hasOfferProducts ? "Offer eligible styles" : newest ? "New Arrivals" : "Shop"} eyebrow={hasOfferProducts ? "OFFER EDIT" : newest ? "JUST IN" : "THE COLLECTION"} subtitle={hasOfferProducts ? "These styles qualify for the selected offer." : newest ? "The latest drops, selected for you." : "Style for every moment."} description={hasOfferProducts ? "Add the required quantity to your bag, then apply the selected offer at checkout." : newest ? "Discover the newest active products added to VAYZIQ." : "Explore our complete collection, thoughtfully selected for comfort, elegance and everyday beauty."} image="/uploads/banners/home-saree-editorial.png" showFullFilters bannerPlacement="shop" newest={newest} productIds={productIds} />;
}
