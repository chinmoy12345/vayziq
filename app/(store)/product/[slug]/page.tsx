import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, RefreshCw, RotateCcw, Truck } from "lucide-react";

import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import SaleCountdown from "@/components/product/SaleCountdown";
import { getSaleCountdownSettings } from "@/lib/sale-countdown-settings";
import { effectiveQuantityLimits, getGlobalQuantityLimits } from "@/lib/quantity-limits";
import ProductReviews from "@/components/product/ProductReviews";
import ProductGrid from "@/components/product/ProductGrid";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import prisma from "@/lib/db";
import { formatPrice } from "@/lib/storefront";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getProductReel, getStoreReels } from "@/lib/reels";

type ProductPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ color?: string }> };
function colorPathSegment(color: string) {
  return color.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function resolveProductRoute(routeSlug: string) {
  const exact = await prisma.product.findFirst({
    where: { slug: routeSlug, status: "active", category: { status: "active" } },
    select: { slug: true },
  });
  if (exact) return { productSlug: exact.slug, color: "" };

  const parts = routeSlug.split("-").filter(Boolean);
  const candidateSlugs = parts.slice(1).map((_, index) => parts.slice(0, parts.length - index - 1).join("-"));
  if (!candidateSlugs.length) return { productSlug: routeSlug, color: "" };

  const candidates = await prisma.product.findMany({
    where: { slug: { in: candidateSlugs }, status: "active", category: { status: "active" } },
    select: { slug: true, options: { select: { name: true, values: { select: { value: true } } } } },
  });
  for (const candidate of candidates.sort((a, b) => b.slug.length - a.slug.length)) {
    const suffix = routeSlug.slice(candidate.slug.length + 1);
    const color = candidate.options
      .filter((option) => /colou?r/i.test(option.name))
      .flatMap((option) => option.values)
      .find((value) => colorPathSegment(value.value) === suffix)?.value;
    if (color) return { productSlug: candidate.slug, color };
  }
  return { productSlug: routeSlug, color: "" };
}

export async function generateMetadata(props: ProductPageProps) { return pageSeo("/product/" + (await props.params).slug, await originalMetadata(props)); }
async function originalMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const branding = await getStoreBranding();
  const { slug } = await params;
  const resolvedRoute = await resolveProductRoute(slug);
  const product = await prisma.product.findFirst({
    where: { slug: resolvedRoute.productSlug, status: "active", category: { status: "active" } },
    select: { name: true, description: true, images: { orderBy: { sortOrder: "asc" }, take: 1 }, category: { select: { name: true } } },
  });
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const description = (product.description?.replace(/\s+/g, " ").trim() || "Shop " + product.name + ` from ${branding.name}’s ` + product.category.name + " collection. Discover product details, pricing and delivery information.").slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: "/product/" + slug },
    openGraph: { type: "website", title: product.name + ` | ${branding.name}`, description, url: "/product/" + slug, images: product.images.map(image => ({ url: image.image, alt: product.name })) },
    twitter: { card: "summary_large_image", title: product.name + ` | ${branding.name}`, description, images: product.images[0]?.image ? [product.images[0].image] : undefined },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const branding = await getStoreBranding();
  const { slug } = await params;
  const resolvedRoute = await resolveProductRoute(slug);
  const requestedColor = (await searchParams).color?.trim() || resolvedRoute.color;
  const product = await prisma.product.findFirst({
    where: { slug: resolvedRoute.productSlug, status: "active", category: { status: "active" } },
    include: {
      variants: { include: { variantValues: { include: { optionValue: { include: { option: true } } } } } },
      category: true,
      reviews: { where: { approved: true }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, rating: true, comment: true, createdAt: true } },
      images: { orderBy: { sortOrder: "asc" } },
      options: { orderBy: { sortOrder: "asc" }, include: { values: { orderBy: { sortOrder: "asc" } } } },
    },
  });
  if (!product) notFound();

  const [visibility, globalCountdown, relatedSetting, reels] = await Promise.all([
    getHomepageVisibility(),
    getSaleCountdownSettings(),
    prisma.storeSetting.findUnique({ where: { key: `product_related_products_${product.id}` }, select: { value: true } }),
    getStoreReels(),
  ]);
  const productReel = getProductReel(reels, product.id);
  const countdownEndsAt = product.saleCountdownMode === "hidden" ? "" : product.saleCountdownMode === "custom" ? product.saleEndsAt?.toISOString() ?? "" : globalCountdown.enabled ? globalCountdown.endsAt : "";
  const relatedInclude = {
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    reviews: { where: { approved: true }, select: { rating: true } },
    category: { select: { name: true } },
  };
  const selectedRelatedIds = Array.isArray(relatedSetting?.value)
    ? relatedSetting.value.map(Number).filter(id => Number.isSafeInteger(id) && id > 0 && id !== product.id)
    : [];
  const selectedRelatedRows = selectedRelatedIds.length ? await prisma.product.findMany({
    where: { id: { in: selectedRelatedIds }, status: "active", category: { status: "active" } },
    include: relatedInclude,
  }) : [];
  const selectedRelatedById = new Map(selectedRelatedRows.map(item => [item.id, item]));
  const selectedRelatedProducts = selectedRelatedIds.flatMap(id => selectedRelatedById.get(id) ? [selectedRelatedById.get(id)!] : []).slice(0, 4);
  const categoryRelatedProducts = selectedRelatedProducts.length ? selectedRelatedProducts : await prisma.product.findMany({
    where: { id: { not: product.id }, status: "active", categoryId: product.categoryId, category: { status: "active" } },
    include: relatedInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  });
  const fallbackRelatedProducts = categoryRelatedProducts.length < 4
    ? await prisma.product.findMany({
        where: { id: { notIn: [product.id, ...categoryRelatedProducts.map(item => item.id)] }, status: "active", category: { status: "active" } },
        include: relatedInclude,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 4 - categoryRelatedProducts.length,
      })
    : [];
  const relatedProducts = [...categoryRelatedProducts, ...fallbackRelatedProducts];

  const averageRating = product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0;
  const optionValues = (name: string) => product.options.find(option => option.name.toLowerCase() === name)?.values.map(value => value.value) ?? [];
  const images = product.images.map(image => image.image);
  const galleryImages = product.images.map(image => ({ src: image.image, color: image.color ?? undefined }));
  const oldPrice = product.comparePrice ? formatPrice(product.comparePrice) : undefined;
  const discount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
    ? `${Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)}% OFF`
    : undefined;
  const details = product.description?.split(/\n|\r/).map(line => line.trim()).filter(Boolean) ?? [];
  const material = optionValues("material")[0] ?? optionValues("fabric")[0] ?? "Details in description";
  const colors = [...new Set([...optionValues("color"), ...optionValues("colour")])];
  const initialColor = colors.find((color) => color.toLowerCase() === requestedColor.toLowerCase()) ?? colors[0] ?? "";
  const colorImages = Object.fromEntries(product.options.filter((option) => /colou?r/i.test(option.name)).flatMap((option) => option.values.filter((value) => value.image).map((value) => [value.value, value.image!] as const)));
  const sizes = optionValues("size");
  const purchaseProduct = {
    ...effectiveQuantityLimits(product, await getGlobalQuantityLimits()),
    variants: product.variants.map(variant => ({
      id: variant.id,
      price: Number(variant.price),
      stock: variant.stock,
      values: Object.fromEntries(variant.variantValues.map(({ optionValue }) => [optionValue.option.name.toLowerCase(), optionValue.value])),
    })),
    id: product.id,
    slug: product.slug,
    image: images[0] ?? "/logo.png",
    name: product.name,
    rating: averageRating,
    reviews: product.reviews.length,
    category: product.category.name,
    basePrice: Number(product.price),
    price: formatPrice(product.price),
    oldPrice,
    discount,
    badge: product.badgeEnabled && product.badgeText ? product.badgeText : undefined,
    description: product.description ?? "",
    material,
    sizes,
    colors,
    initialColor,
    colorImages,
    sizeGuideImage: product.sizeGuideImage ?? product.category.sizeGuideImage ?? undefined,
    stock: product.stock,
  };

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/\s+/g, " ").trim() || product.name + ` from ${branding.name}’s ` + product.category.name + " collection.",
    image: images,
    sku: product.sku,
    category: product.category.name,
    brand: { "@type": "Brand", name: `${branding.name}` },
    offers: {
      "@type": "Offer",
      url: "https://vayziq.com/product/" + product.slug,
      priceCurrency: "INR",
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: averageRating.toFixed(1), reviewCount: product.reviews.length } } : {}),
  };
  return <main className="product-home-body min-h-screen bg-[#FFFDFC]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, "\\u003c") }} />
    <Breadcrumbs title={product.name} isShop={false} parent={{ label: product.category.name, href: `/${product.category.slug}` }} />

    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-3 sm:px-8 sm:pt-6 lg:px-10">
      <section aria-label={`${product.name} purchase details`} className="grid items-start gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.16fr)_minmax(390px,0.84fr)] lg:gap-8 xl:gap-12">
        <div className="-mx-4 min-w-0 space-y-5 sm:mx-0">
          <ProductGallery productId={product.id} images={galleryImages} initialColor={initialColor} name={product.name} badge={product.badgeEnabled && product.badgeText ? product.badgeText : undefined} badgeTone={product.badgeTone} videoUrl={visibility.productDetailVideo ? productReel?.videoUrl : null} videoPoster={productReel?.poster} />
        </div>
        <aside className="min-w-0 overflow-hidden rounded-2xl border border-[#ece8e4] bg-white shadow-[0_18px_55px_rgba(25,20,18,0.07)] lg:sticky lg:top-24">
          {countdownEndsAt && <SaleCountdown endsAt={countdownEndsAt} />}
          <div className="px-4 pb-5 pt-4 sm:px-6 sm:pb-7 sm:pt-5 xl:px-8">
            <ProductInfo product={purchaseProduct} showRating={visibility.productDetailRating} showOffers={visibility.productDetailOffers} />
          </div>
        </aside>
      </section>

      {visibility.productDetailDelivery && <section aria-labelledby="delivery-benefits-title" className="mt-9 border-y border-[#E8DADA] py-6 sm:mt-12 sm:py-8">
        <div className="mb-5"><p className="text-[10px] font-semibold tracking-[0.22em] text-[#9F5E5E]">CLEAR, SIMPLE SHOPPING</p><h2 id="delivery-benefits-title" className="mt-1 font-serif text-2xl text-[#2B2525]">Delivery &amp; care</h2></div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <PolicyCard icon={Truck} title="Free shipping" status="Orders above ₹999" detail="Complimentary shipping when your order total is over ₹999." />
          <PolicyCard icon={RotateCcw} title="Returns" status={product.returnEnabled ? `${product.returnDays}-day returns` : "Returns unavailable"} detail={product.returnEnabled ? "The return window starts on the day your item is delivered." : "This product is not eligible for return."} />
          <PolicyCard icon={RefreshCw} title="Replacement" status={product.replacementEnabled ? `${product.replacementDays}-day replacement` : "Replacement unavailable"} detail={product.replacementEnabled ? "The replacement window starts on the day your item is delivered." : "Replacement is not available for this product."} />
        </div>
      </section>}

      {visibility.productDetailDescription && <section aria-labelledby="product-details-title" className="grid gap-6 py-8 sm:py-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
        <div><p className="text-[10px] font-semibold tracking-[0.22em] text-[#9F5E5E]">THE DETAILS</p><h2 id="product-details-title" className="mt-2 font-serif text-3xl text-[#2B2525]">About this piece</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#6D5B5B]">{product.description?.trim() || `Explore the ${product.category.name} collection from ${branding.name}.`}</p></div>
        <dl className="grid content-start gap-3 sm:grid-cols-2">
          <ProductFact label="Category" value={product.category.name} />
          <ProductFact label="Fabric / material" value={material} />
          {colors.length > 0 && <ProductFact label="Colour options" value={colors.join(", ")} />}
          {sizes.length > 0 && <ProductFact label="Available sizes" value={sizes.join(", ")} />}
          {details.length > 1 && <div className="rounded-xl border border-[#E8DADA] bg-white p-4 sm:col-span-2"><dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9A8888]">Product highlights</dt><dd className="mt-3 grid gap-2 sm:grid-cols-2">{details.map(detail => <span key={detail} className="flex gap-2 text-xs leading-5 text-[#6D5B5B]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B56F6F]" />{detail}</span>)}</dd></div>}
        </dl>
      </section>}

      {visibility.productDetailReviews && <ProductReviews productId={product.id} reviews={product.reviews.map(review => ({ ...review, createdAt: review.createdAt.toISOString() }))} />}

      {visibility.productDetailRelated && relatedProducts.length > 0 && <section aria-labelledby="related-products-title" className="mt-12 border-t border-[#E8DADA] pt-9 sm:mt-16 sm:pt-12">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div><p className="text-[10px] font-semibold tracking-[0.22em] text-[#9F5E5E]">CURATED FOR YOU</p><h2 id="related-products-title" className="mt-2 font-serif text-2xl text-[#2B2525] sm:text-3xl">You may also like</h2><p className="mt-2 text-sm text-[#756565]">More pieces selected to complement this style.</p></div>
          <Link href={`/${product.category.slug}`} className="shrink-0 text-xs font-medium text-[#9F5E5E] transition hover:text-[#744646]">View collection <span aria-hidden="true">→</span></Link>
        </div>
        <ProductGrid products={relatedProducts.map(item => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category.name,
          price: formatPrice(item.price),
          image: item.images[0]?.image ?? "/logo.png",
          oldPrice: item.comparePrice && Number(item.comparePrice) > Number(item.price) ? formatPrice(item.comparePrice) : undefined,
          rating: item.reviews.length ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / item.reviews.length : 0,
          reviews: item.reviews.length,
          badge: item.badgeEnabled && item.badgeText ? item.badgeText : undefined,
          badgeTone: item.badgeEnabled && item.badgeText ? item.badgeTone : undefined,
        }))} columns={4} hideCategory />
      </section>}
      <RecentlyViewed current={{
        id: product.id, slug: product.slug, name: product.name, category: product.category.name,
        price: formatPrice(product.price), image: images[0] ?? "/logo.png", images, oldPrice,
        rating: averageRating, reviews: product.reviews.length,
        badge: product.badgeEnabled && product.badgeText ? product.badgeText : undefined,
        badgeTone: product.badgeEnabled && product.badgeText ? product.badgeTone : undefined,
        inStock: product.hasVariations ? product.variants.some(variant => variant.stock > 0) : product.stock > 0,
      }} />
    </div>
  </main>;
}

function PolicyCard({ icon: Icon, title, status, detail }: { icon: typeof Truck; title: string; status: string; detail: string }) {
  return <article className="flex min-w-0 gap-3 rounded-xl border border-[#E8DADA] bg-white p-4 sm:flex-col sm:gap-4 sm:p-5">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F8EFEC] text-[#9F5E5E] sm:h-11 sm:w-11"><Icon className="h-5 w-5" strokeWidth={1.6} /></span>
    <div className="min-w-0"><h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A7777]">{title}</h3><p className="mt-1 font-serif text-lg leading-snug text-[#2B2525]">{status}</p><p className="mt-1 text-xs leading-5 text-[#756565]">{detail}</p></div>
  </article>;
}

function ProductFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-[#E8DADA] bg-white p-4"><dt className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9A8888]">{label}</dt><dd className="mt-2 break-words text-sm text-[#4F4444]">{value}</dd></div>;
}
