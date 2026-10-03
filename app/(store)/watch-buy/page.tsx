import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import Link from "next/link";
import WatchAndBuy from "@/components/home/WatchAndBuy";
import { getEditorialWatchBuyProducts, getWatchBuyProducts } from "@/lib/storefront";

export async function generateMetadata() { return pageSeo("/watch-buy", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return {
  title: "Watch & Buy",
  description: "Watch our product videos and explore the pieces featured in each look.",
  alternates: { canonical: "/watch-buy" },
  openGraph: { title: `Watch & Buy | ${branding.name}`, description: "Watch product videos and explore the streetwear styles featured in each look.", url: "/watch-buy", type: "website" },
};
}

export default async function WatchBuyPage() {
  const [products, editorialProducts] = await Promise.all([getWatchBuyProducts(null), getEditorialWatchBuyProducts()]);

  return (
    <main>
      {products.length || editorialProducts.length ? (
        <WatchAndBuy products={products} editorialProducts={editorialProducts} viewAll />
      ) : (
        <section className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="mt-3 font-serif text-4xl text-[#2B2525]">Watch &amp; Buy</h1>
          <p className="mt-4 text-sm leading-6 text-[#756565]">Product videos will appear here as they are added to the collection.</p>
          <Link href="/shop" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#B56F6F] px-6 text-xs font-semibold uppercase tracking-[0.1em] text-white">Explore the collection</Link>
        </section>
      )}
    </main>
  );
}
