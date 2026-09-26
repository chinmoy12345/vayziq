"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
import { useProductCardSettings } from "@/components/product/ProductCardSettings";

/* =========================================================
   PRODUCT TYPE
========================================================= */

export interface Product {
  id: number | string;
  slug?: string;
  name: string;
  category: string;
  categorySlug?: string;
  parentCategorySlug?: string | null;
  colorCount?: number;
  price: string;
  image: string;
  images?: string[];
  oldPrice?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  filterValues?: { sizes: string[]; colors: string[] };
}

/* =========================================================
   HEART ICON
========================================================= */

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   STAR ICON
========================================================= */

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m12 3 2.78 5.63 6.22.9-4.5 4.38 1.06 6.2L12 17.18l-5.56 2.93 1.06-6.2L3 9.53l6.22-.9L12 3Z" />
    </svg>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const cardSettings = useProductCardSettings();
  const [saved, setSaved] = useState(false);
  const [wishAnimating, setWishAnimating] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const galleryImages = product.images?.length ? product.images : [product.image];
  const currentImage = galleryImages[imageIndex] ?? product.image;
  const productSlug = product.slug ?? product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  useEffect(() => {
    const loadSavedState = async () => {
      const response = await fetch("/api/account/wishlist");
      if (!response.ok) return;
      const data = (await response.json()) as { productIds: number[] };
      setSaved(data.productIds.includes(Number(product.id)));
    };
    void loadSavedState();
  }, [product.id]);

  const toggleWishlist = async () => {
    const productId = Number(product.id);
    if (!Number.isInteger(productId)) return;
    const nextSaved = !saved;
    setSaved(nextSaved);
    setWishAnimating(true);
    window.setTimeout(() => setWishAnimating(false), 450);
    const response = await fetch(nextSaved ? "/api/account/wishlist" : `/api/account/wishlist?productId=${productId}`, {
      method: nextSaved ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      ...(nextSaved ? { body: JSON.stringify({ productId }) } : {}),
    });
    if (!response.ok) {
      setSaved(!nextSaved);
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setWishlistMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
      window.setTimeout(() => setWishlistMessage(null), 3200);
      return;
    }
    setWishlistMessage(nextSaved ? "Added to your wishlist" : "Removed from your wishlist");
    window.setTimeout(() => setWishlistMessage(null), 2600);
  };

  return (
    <article className="group min-w-0">

      {/* ===================================================
          IMAGE
      =================================================== */}

      <div className="relative overflow-hidden bg-[#F5E9E7]">

        <Link
          href={`/product/${productSlug}`}
          className="block"
        >
          <div className="relative aspect-[3/4] overflow-hidden">

            <ProgressiveImage
              src={currentImage}
              alt={product.name}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                group-hover:scale-105
              "
            />


      {/* Soft Image Overlay */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/15
                via-transparent
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
            />
          </div>
        </Link>

        {cardSettings.productCardCarousel && galleryImages.length > 1 && <>
          <button type="button" aria-label="Show previous product image" onClick={() => setImageIndex(index => (index - 1 + galleryImages.length) % galleryImages.length)} className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#E8DADA] bg-white/95 text-[#514343] shadow-sm transition hover:bg-[#B56F6F] hover:text-white md:opacity-0 md:group-hover:opacity-100"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <button type="button" aria-label="Show next product image" onClick={() => setImageIndex(index => (index + 1) % galleryImages.length)} className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[#E8DADA] bg-white/95 text-[#514343] shadow-sm transition hover:bg-[#B56F6F] hover:text-white md:opacity-0 md:group-hover:opacity-100"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
          <span aria-label={`Image ${imageIndex + 1} of ${galleryImages.length}`} className="absolute bottom-3 right-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#514343] shadow-sm">{imageIndex + 1} / {galleryImages.length}</span>
        </>}
        {cardSettings.productCardRating && product.rating !== undefined && (product.reviews ?? 0) > 0 && <div aria-label={`${product.rating.toFixed(1)} out of 5 from ${product.reviews} reviews`} className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#4C4141] shadow-sm"><span className="text-[#B56F6F]"><StarIcon /></span><span>{product.rating.toFixed(1)}</span><span className="text-[#A89999]">|</span><span>{product.reviews}</span></div>}
        {/* View Product button hidden on request; restore by uncommenting:
        <Link href={`/product/${productSlug}`} className="absolute bottom-3 left-3 right-3 flex h-10 items-center justify-center bg-white/95 text-[9px] font-semibold tracking-[0.16em] text-[#3B3333] opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#B56F6F] hover:text-white">VIEW PRODUCT</Link>
        */}
        {/* =================================================
            BADGE
        ================================================= */}

        {product.badge && (
          <span
            className="
              absolute
              left-3
              top-3
              bg-[#B56F6F]
              px-3
              py-1.5
              text-[9px]
              font-semibold
              tracking-[0.12em]
              text-white
            "
          >
            {product.badge}
          </span>
        )}

        {/* =================================================
            WISHLIST
        ================================================= */}

        <button
          type="button"
          aria-label={`${saved ? "Remove" : "Add"} ${product.name} ${saved ? "from" : "to"} wishlist`}
          aria-pressed={saved}
          onClick={() => void toggleWishlist()}
          className={`
            absolute
            right-3
            top-3
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            text-[#5A4B4B]
            shadow-sm
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-[#B56F6F]
            hover:text-white
            ${saved ? "bg-[#B56F6F] text-white hover:bg-[#9f5e5e]" : "bg-white/95"}
          `}
        >
          <span className={wishAnimating ? "wishlist-heart-pop" : undefined}><HeartIcon /></span>
        </button>

      </div>

      {wishlistMessage && (
        <p role="status" className="wishlist-toast fixed bottom-5 right-5 z-[90] rounded-full bg-[#2B2525] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {wishlistMessage}
        </p>
      )}

      {/* ===================================================
          PRODUCT INFORMATION
      =================================================== */}

      <div className="min-w-0 pt-3 sm:pt-4">

        {/* Category */}
        <p
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-[#B08B8B]
          "
        >
          {product.category}
        </p>

        {/* Product Name */}
        <Link href={`/product/${productSlug}`}>
          <h3
            className="
              mt-1.5
              line-clamp-1
              font-serif
              text-[15px] sm:text-[17px]
              text-[#2B2525]
              transition-colors
              duration-200
              hover:text-[#B56F6F]
            "
          >
            {product.name}
          </h3>
        </Link>
        {product.colorCount ? <p className="mt-2 text-[11px] text-[#8A7777]">{product.colorCount} {product.colorCount === 1 ? "Color" : "Colors"} Available</p> : null}

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">

          <span
            className="
              text-sm
              font-semibold
              text-[#3B3333]
            "
          >
            {product.price}
          </span>

          {product.oldPrice && (
            <span
              className="
                text-xs
                text-[#B09A9A]
                line-through
              "
            >
              {product.oldPrice}
            </span>
          )}
          {product.oldPrice && Number(product.oldPrice.replace(/[^0-9.]/g, "")) > Number(product.price.replace(/[^0-9.]/g, "")) && <span className="text-[10px] font-medium text-emerald-700">{Math.round((1 - Number(product.price.replace(/[^0-9.]/g, "")) / Number(product.oldPrice.replace(/[^0-9.]/g, ""))) * 100)}% OFF</span>}
        </div>

      </div>
    </article>
  );
}
