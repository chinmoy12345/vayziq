import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import CategoryListing from "@/components/category/CategoryListing";
import { getStoreFilters, getStoreProducts, toCardProduct } from "@/lib/storefront";

export async function generateMetadata(props: Parameters<typeof originalMetadata>[0]) { return pageSeo("/search", await originalMetadata(props)); }
async function originalMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const branding = await getStoreBranding();
  const query = (await searchParams).q?.trim();
  return { title: query ? `Search results for ${query}` : "Search", description: `Search ${branding.name}’s collection of men’s, women’s and unisex streetwear.`, robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [products, filters] = await Promise.all([
    getStoreProducts({ query }),
    getStoreFilters(),
  ]);
  return <main className="min-h-screen bg-[#FFFDFC]"><section className="border-b border-[#E8DADA] bg-[#F8EFEC]"><div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10"><p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#B56F6F]">SEARCH</p><h1 className="font-serif text-4xl leading-none text-[#2B2525] sm:text-5xl">{query ? `Results for “${query}”` : "Search our collection"}</h1></div></section><CategoryListing products={products.map(toCardProduct)} productCount={products.length} filters={filters} showFullFilters /></main>;
}
