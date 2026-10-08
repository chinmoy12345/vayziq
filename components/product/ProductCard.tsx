"use client";

import Link from "next/link";
import ProductOfferBadges from "./ProductOfferBadges";
import { useEffect, useState } from "react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
import { useProductCardSettings } from "@/components/product/ProductCardSettings";
import styles from "./ProductCard.module.css";

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
  badgeTone?: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  filterValues?: { sizes: string[]; colors: string[] };
  options?: { name: string; values: string[] }[];
  inStock?: boolean;
  minOrderQuantity?: number | null;
  maxOrderQuantity?: number | null;
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

function productBadge(product: Product) {
  return product.badge ?? null;
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
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [cartLimits, setCartLimits] = useState({ min: 1, max: 10 });
  const [cartLimitMessage, setCartLimitMessage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const galleryImages = product.images?.length ? product.images : [product.image];
  const currentImage = galleryImages[imageIndex] ?? product.image;
  const badge = productBadge(product);
  const price = Number(product.price.replace(/[^0-9.]/g, ""));
  const oldPrice = Number(product.oldPrice?.replace(/[^0-9.]/g, "") ?? 0);
  const discountPercent = oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
  const inStock = product.inStock !== false;
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
      if (response.status === 401) window.dispatchEvent(new Event("vayziq:open-auth"));
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setWishlistMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
      window.setTimeout(() => setWishlistMessage(null), 3200);
      return;
    }
    setWishlistMessage(nextSaved ? "Added to your wishlist" : "Removed from your wishlist");
    window.setTimeout(() => setWishlistMessage(null), 2600);
  };

  const openCartPopup = () => {
    setSelectedOptions(Object.fromEntries((product.options ?? []).filter((option) => option.values.length).map((option) => [option.name, option.values[0]])));
    setCartQuantity(1);
    setCartLimitMessage("");
    setCartAdded(false);
    setCartOpen(true);
    void fetch("/api/cart/availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: [{ id: product.id, quantity: 1 }] }) })
      .then(response => response.json())
      .then(body => { const limits = body.availability?.[0]; if (limits) { setCartLimits({ min: limits.min, max: limits.max }); setCartQuantity(limits.min); } })
      .catch(() => setCartLimitMessage("Quantity limits could not be loaded. Try again."));
  };

  const addToCart = () => {
    if (cartQuantity < cartLimits.min || cartQuantity > cartLimits.max) { setCartLimitMessage(`Choose ${cartLimits.min}–${cartLimits.max} items.`); return; }
    const savedCart = JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{ id: number; quantity: number; size?: string; color?: string; options?: Record<string, string> }>;
    const size = selectedOptions.Size ?? selectedOptions.size ?? "";
    const color = selectedOptions.Color ?? selectedOptions.Colour ?? selectedOptions.color ?? selectedOptions.colour ?? "";
    const existing = savedCart.find((item) => item.id === Number(product.id) && item.size === size && item.color === color);
    const item = { id: Number(product.id), slug: productSlug, name: product.name, category: product.category, price: Number(product.price.replace(/[^\d.]/g, "")), image: product.image, quantity: cartQuantity, size, color, options: selectedOptions };
    const nextQuantity = (existing?.quantity ?? 0) + cartQuantity;
    if (savedCart.filter(cartItem => cartItem.id === Number(product.id)).reduce((sum, cartItem) => sum + cartItem.quantity, 0) + cartQuantity > cartLimits.max) { setCartLimitMessage(`Maximum ${cartLimits.max} items of this product per order.`); return; }
    localStorage.setItem("susmita-cart", JSON.stringify(existing ? savedCart.map((cartItem) => cartItem === existing ? { ...cartItem, quantity: nextQuantity } : cartItem) : [...savedCart, item]));
    window.dispatchEvent(new Event("cart-updated"));
    setCartAdded(true);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1800);
  };

  return (
    <>
    <article className={`${styles.card} group flex min-w-0 flex-col rounded-xl border border-[#e5e5e5] bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfcfcf] hover:shadow-lg`}>

      {/* ===================================================
          IMAGE
      =================================================== */}

      <div className="relative overflow-hidden rounded-lg bg-[#F5E9E7]">

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
        </>}
        {cardSettings.productCardRating && product.rating !== undefined && (product.reviews ?? 0) > 0 && <div aria-label={`${product.rating.toFixed(1)} out of 5 from ${product.reviews} reviews`} className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#4C4141] shadow-sm"><span className="text-[#B56F6F]"><StarIcon /></span><span>{product.rating.toFixed(1)}</span><span className="text-[#A89999]">|</span><span>{product.reviews}</span></div>}
        {(product.filterValues?.colors?.length ?? 0) > 0 && <span className="absolute bottom-3 right-3 z-10 flex items-center pl-2" aria-label={`${product.filterValues?.colors.length} colors available`}>{product.filterValues!.colors.slice(0, 3).map((color) => <i key={color} title={color} style={{ backgroundColor: color }} className="-ml-2 h-4 w-4 rounded-full border-2 border-white shadow-sm" />)}{product.filterValues!.colors.length > 3 && <b className="-ml-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-[#111] px-1 text-[8px] font-extrabold leading-none text-white">+{product.filterValues!.colors.length - 3}</b>}</span>}
        {/* View Product button hidden on request; restore by uncommenting:
        <Link href={`/product/${productSlug}`} className="absolute bottom-3 left-3 right-3 flex h-10 items-center justify-center bg-white/95 text-[9px] font-semibold tracking-[0.16em] text-[#3B3333] opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#B56F6F] hover:text-white">VIEW PRODUCT</Link>
        */}
        {/* =================================================
            BADGE
        ================================================= */}

        {badge && (
          <span
            title={badge}
            className={`${styles.badge}
              absolute
              left-2.5
              top-2.5
              ${product.badgeTone === "new" ? "bg-violet-600" : product.badgeTone === "sale" ? "bg-orange-500" : product.badgeTone === "popular" ? "bg-rose-500" : product.badgeTone === "neutral" ? "bg-slate-200 text-slate-700" : "bg-[#292321]"}
              rounded-full
              border
              border-white/30
              px-2.5
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-[0.1em]
              shadow-sm
              ${product.badgeTone === "neutral" ? "" : "text-white"}
            `}
          >
            {badge}
          </span>
        )}

        {!inStock && <span className="absolute inset-x-3 bottom-3 z-20 rounded-md bg-black/75 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">Out of stock</span>}

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
            right-2.5
            top-2.5
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/80
            text-[#5A4B4B]
            shadow-[0_2px_8px_rgba(0,0,0,0.14)]
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

      <div className="flex min-w-0 flex-1 flex-col px-1 pt-3 sm:pt-4">

        {/* Category */}
        <p
          className={`${styles.category}
            text-[9px]
            font-medium
            uppercase
            tracking-[0.18em]
            text-[#B08B8B]
          `}
        >
          {product.category}
        </p>

        {/* Product Name */}
        <Link href={`/product/${productSlug}`} title={product.name} className={styles.nameLink}>
          <h3
            className={`${styles.name}
              mt-1.5
              text-[15px] sm:text-[17px]
              text-[#2B2525]
              transition-colors
              duration-200
              hover:text-[#B56F6F]
            `}
          >
            {product.name}
          </h3>
        </Link>
        {/* =================================================
            PRICE
        ================================================= */}

        <div className={`${styles.price} mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1`}>

          <span
            className="
              text-sm
              font-semibold
              text-[#3B3333]
            "
          >
            {product.price}
          </span>

          {oldPrice > price && (
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
          {discountPercent && <span className="rounded bg-[#fff0bd] px-1.5 py-0.5 text-[10px] font-bold text-[#926300]">{discountPercent}% OFF</span>}
        </div>
        <div className={styles.offers}><ProductOfferBadges id={product.id} price={product.price} inStock={inStock} /></div>
        <button type="button" disabled={!inStock} onClick={openCartPopup} className={`mt-3 min-h-10 w-full rounded-md px-3 py-2.5 text-xs font-bold transition ${inStock ? "bg-[#111] text-white hover:bg-[#2b2b2b]" : "cursor-not-allowed bg-[#e8e5e3] text-[#827773]"}`}>{inStock ? (addedToCart ? "Added to Cart ✓" : "Add to Cart") : "Out of Stock"}</button>

      </div>
    </article>
    {cartOpen && (
      <div className="fixed inset-0 z-[250] grid place-items-center bg-black/50 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-labelledby={`cart-title-${product.id}`} onMouseDown={() => setCartOpen(false)}>
        <section className="relative max-h-[calc(100dvh-32px)] w-full max-w-[760px] overflow-auto rounded-2xl bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,.28)] sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#f3f3f3] text-lg text-[#111]">×</button>
          <div className={`grid gap-2 ${galleryImages.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
            {galleryImages.slice(0, 3).map((image, index) => <div key={`${image}-${index}`} className="overflow-hidden rounded-lg bg-[#f4f4f4]"><img src={image} alt={`${product.name} view ${index + 1}`} className="h-[145px] w-full object-cover sm:h-[250px]" /></div>)}
          </div>
          <div className="mt-5 pr-8"><p className="text-[10px] font-extrabold tracking-[.12em] text-[#777]">{cartAdded ? "ADDED TO BAG" : product.category.toUpperCase()}</p><h2 id={`cart-title-${product.id}`} className="mt-1 text-lg font-semibold leading-tight text-[#111]">{product.name}</h2><strong className="mt-2 block text-[17px] text-[#111]">{product.price}</strong>{product.oldPrice && <del className="ml-2 text-[13px] text-[#888]">{product.oldPrice}</del>}</div>
          {!cartAdded && <p className="mt-3 text-xs text-[#666]">Quantity per order: {cartLimits.min}–{cartLimits.max}</p>}
          {cartLimitMessage && <p role="alert" className="mt-2 text-xs text-red-700">{cartLimitMessage}</p>}
          {cartAdded ? <div className="mt-5"><Link href="/cart" className="flex min-h-11 items-center justify-center rounded-lg bg-[#fbb606] text-[13px] font-extrabold text-[#111]">View Cart</Link><button type="button" onClick={() => setCartOpen(false)} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#d7d7d7] bg-white text-[13px] font-extrabold text-[#111]">Continue Shopping</button></div> : <><div className="mt-5 space-y-4 border-t border-[#ececec] pt-4">{(product.options ?? []).filter((option) => option.values.length).map((option) => <div key={option.name}><p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#666]">{option.name}</p><div className="flex flex-wrap gap-2">{option.values.map((value) => <button key={value} type="button" onClick={() => setSelectedOptions((current) => ({ ...current, [option.name]: value }))} className={`min-w-11 rounded-md border px-3 py-2 text-xs font-bold transition ${selectedOptions[option.name] === value ? "border-[#111] bg-[#111] text-white" : "border-[#d6d6d6] bg-white text-[#333] hover:border-[#111]"}`}>{value}</button>)}</div></div>)}</div><div className="mt-5 flex items-center justify-between border-y border-[#ececec] py-3"><span className="text-sm font-bold text-[#333]">Quantity</span><div className="flex items-center gap-4"><button type="button" onClick={() => setCartQuantity((quantity) => Math.max(1, quantity - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d8d8] text-lg" aria-label="Decrease quantity">−</button><b className="text-sm">{cartQuantity}</b><button type="button" onClick={() => setCartQuantity((quantity) => quantity + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d8d8] text-lg" aria-label="Increase quantity">+</button></div></div><button type="button" onClick={addToCart} className="mt-5 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#fbb606] text-[13px] font-extrabold text-[#111]">Add to Bag</button></>}
        </section>
      </div>
    )}
    </>
  );
}
