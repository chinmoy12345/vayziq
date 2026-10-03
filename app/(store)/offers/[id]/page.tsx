import { pageSeo } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import CategoryListing from "@/components/category/CategoryListing";
import PageBanner from "@/components/store/PageBanner";
import { getQuantityOfferSlides } from "@/components/store/promo-slides";
import prisma from "@/lib/db";
import { getStoreFilters, getStoreProducts, toCardProduct } from "@/lib/storefront";

const demoOffers = {
  "buy2save50": { title: "Buy 2 · Save ₹50", subtitle: "Save ₹50 when you add any two eligible products to your bag.", code: "BUY2SAVE50", eyebrow: "A LITTLE SOMETHING EXTRA", theme: "rose" as const },
  "buy3save90": { title: "Buy 3 · Save ₹90", subtitle: "Save ₹90 when you add any three eligible products to your bag.", code: "BUY3SAVE90", eyebrow: "MORE TO LOVE", theme: "dark" as const },
};

export async function generateMetadata(props: Parameters<typeof originalMetadata>[0]) { return pageSeo("/offers/" + (await props.params).id, await originalMetadata(props)); }
async function originalMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const demoOffer = demoOffers[id.toLowerCase() as keyof typeof demoOffers];
  const bannerId = Number(id);
  const banner = demoOffer ? null : Number.isSafeInteger(bannerId) && bannerId > 0
    ? await prisma.banner.findFirst({ where: { id: bannerId, active: true, placement: "offer-zone" }, select: { title: true, subtitle: true } })
    : null;
  if (!demoOffer && !banner) return { title: "Offer not found", robots: { index: false, follow: false } };
  const title = demoOffer?.title ?? banner!.title.trim();
  const description = (demoOffer?.subtitle ?? banner?.subtitle?.trim() ?? "Explore current offers and shop eligible styles from Vayziq’s collection.").slice(0, 160);
  return { title, description, alternates: { canonical: "/offers/" + id }, openGraph: { title: title + " | Vayziq", description, url: "/offers/" + id, type: "website" } };
}

export default async function OfferZonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoOffer = demoOffers[id.toLowerCase() as keyof typeof demoOffers];
  const bannerId = Number(id);
  const banner = demoOffer ? null : Number.isSafeInteger(bannerId) && bannerId > 0
    ? await prisma.banner.findFirst({ where: { id: bannerId, active: true, placement: "offer-zone" } })
    : null;
  if (!demoOffer && !banner) notFound();

  let categorySlug: string | undefined;
  const productSlug = banner?.link?.match(/^\/product\/([^/?#]+)/)?.[1];
  if (productSlug) {
    const product = await prisma.product.findFirst({
      where: { slug: productSlug, status: "active", category: { status: "active" } },
      select: { category: { select: { slug: true } } },
    });
    categorySlug = product?.category.slug;
  } else if (banner) {
    const link = banner.link ?? "";
    const category = link.match(/^\/shop\?category=([^&#]+)/)?.[1];
    const section = link.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:[?#]|$)/)?.[1];
    const linkedCategory = section ? await prisma.category.findFirst({ where: { slug: section, status: "active" }, select: { slug: true } }) : null;
    categorySlug = category ? decodeURIComponent(category) : linkedCategory?.slug;
  }

  const [products, filters] = await Promise.all([
    getStoreProducts({ ...(categorySlug ? { categorySlug } : {}), take: 10 }),
    getStoreFilters(categorySlug),
  ]);
  const title = demoOffer?.title ?? banner?.title?.trim() ?? "Offer Zone";
  const collectionSlides = getQuantityOfferSlides("the collection", "/shop");
  const selectedOfferSlide = demoOffer ? collectionSlides.find(slide => slide.promo?.code === demoOffer.code) : undefined;
  const slides = demoOffer
    ? [...(selectedOfferSlide ? [{ ...selectedOfferSlide, title, link: `/offers/${id}`, promo: { ...selectedOfferSlide.promo!, eyebrow: demoOffer.eyebrow, detail: `${demoOffer.subtitle} Enter ${demoOffer.code} in the cart to redeem.` } }] : []), ...collectionSlides.filter(slide => slide !== selectedOfferSlide)]
    : [{ title: banner!.title, image: banner!.image, link: null }, ...collectionSlides];
  const collectionName = categorySlug ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1) : "our collection";

  return <main className="min-h-screen bg-[#FFFDFC]"><Breadcrumbs title={title} isShop={false} />{banner ? <section aria-label={title} className="w-full"><div className="relative h-[clamp(220px,62vw,560px)] w-full overflow-hidden bg-[#F8EFEC]"><img src={banner.image} alt={banner.title?.trim() || title} className="h-full w-full object-cover object-center" />{(banner.title?.trim() || banner.subtitle?.trim()) && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-5 pb-5 pt-16 text-white sm:px-8 sm:pb-8 lg:px-12"><div className="mx-auto w-full max-w-7xl">{banner.title?.trim() && <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl">{banner.title.trim()}</h1>}{banner.subtitle?.trim() && <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">{banner.subtitle.trim()}</p>}</div></div>}</div></section> : <PageBanner banners={slides} title={title} />}<section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10"><p className="font-serif text-2xl text-[#2B2525]">Explore {collectionName}</p><p className="mt-2 text-sm text-[#756565]">Browse up to 10 products and apply the offer code in your bag.</p></section><CategoryListing products={products.map(toCardProduct)} productCount={products.length} filters={filters} showProductFilters /></main>;
}
