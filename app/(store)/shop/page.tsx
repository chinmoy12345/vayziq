import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Shop Women’s Ethnic Wear", description: `Shop sarees, kurtis and nightwear at ${branding.name}. Browse the complete women’s ethnic wear collection.`, alternates: { canonical: "/shop" }, openGraph: { title: `Shop Women’s Ethnic Wear | ${branding.name}`, description: `Shop sarees, kurtis and nightwear at ${branding.name}. Browse the complete women’s ethnic wear collection.`, type: "website", url: "/shop" } };
}

import CollectionPage from "@/components/store/CollectionPage";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  return <CollectionPage categorySlug={category} title="Shop" eyebrow="THE COLLECTION" subtitle="Style for every moment." description="Explore our complete collection, thoughtfully selected for comfort, elegance and everyday beauty." image="/uploads/banners/home-saree-editorial.png" showFullFilters bannerPlacement="shop" />;
}
