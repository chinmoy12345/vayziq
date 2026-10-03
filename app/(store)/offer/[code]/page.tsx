import Link from "next/link";
import { pageSeo } from "@/lib/seo";
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  return pageSeo(`/offer/${code.toUpperCase()}`, { title: coupon ? `${offerTitle(publicOffer(coupon))} | Vayziq` : "Offer unavailable | Vayziq", description: coupon ? offerTerms(publicOffer(coupon)) : undefined, robots: { index: Boolean(coupon && couponAvailable(coupon)) } });
}
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import { couponAvailable, publicOffer } from "@/lib/coupons";
import { offerTerms, offerTitle } from "@/lib/product-offers";
import { offerCardPreview } from "@/lib/offer-card";
import { getStoreProducts, getStoreFilters, toCardProduct } from "@/lib/storefront";
import CategoryListing from "@/components/category/CategoryListing";
import OfferCodeButton from "@/components/product/OfferCodeButton";

export const dynamic = "force-dynamic";
export default async function OfferPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) notFound();
  if (!couponAvailable(coupon)) return <main className="mx-auto max-w-3xl px-5 py-16"><h1 className="text-3xl font-bold">This offer has ended</h1><p className="mt-3 text-gray-600">Explore our current offers for more savings.</p><Link href="/offers" className="mt-5 inline-block underline">View live offers</Link></main>;
  const offer = publicOffer(coupon);
  const products = (await getStoreProducts({ productIds: offer.rules?.productIds.length ? offer.rules.productIds : undefined })).filter(product => product.category.status === "active" && (product.hasVariations ? product.variants.some(variant => variant.stock > 0) : product.stock > 0) && offerCardPreview(offer, product.id, Number(product.price)));
  const filters = products.length ? await getStoreFilters(undefined, products.map(product => product.id)) : {};
  if (filters.categories) filters.categories = filters.categories.filter(category => (category.count ?? 0) > 0);
  return <main className="min-h-screen bg-white pb-10">
    <header className="border-b border-gray-200 bg-[#fff9eb] px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-7xl">
      <Link href="/offers" className="text-xs font-semibold text-gray-600">← All offers</Link>
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-700">{offerTitle(offer)}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">{offer.rules?.heading || offerTitle(offer)}</h1>
      {offer.description && <p className="mt-3 max-w-2xl text-sm text-gray-700">{offer.description}</p>}
      <p className="mt-3 max-w-3xl text-xs leading-6 text-gray-600">{offerTerms(offer)} Only one offer applies per order.</p>
      <div className="mt-5"><OfferCodeButton code={offer.code} /></div>
      {offer.rules?.bannerImage && <div role="img" aria-label={offer.rules.heading || offerTitle(offer)} className="mt-6 aspect-[3/1] rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(offer.rules.bannerImage)})` }} />}
    </div></header>
    {products.length ? <CategoryListing products={products.map(toCardProduct)} productCount={products.length} filters={filters} showFullFilters /> : <p className="p-10 text-center text-gray-600">Eligible styles are currently out of stock. Please check back soon.</p>}
  </main>;
}
