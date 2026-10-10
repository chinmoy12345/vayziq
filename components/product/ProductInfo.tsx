"use client";

import {
  Check,
  Heart,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Share2,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductOffers from "./ProductOffers";
import ProductOfferBadges from "./ProductOfferBadges";

interface ProductInfoData {
  id: number | string;
  variants?: { id: number; price: number; stock: number; values: Record<string,string> }[];
  name: string;
  category: string;
  price: string;
  basePrice?: number;
  oldPrice?: string;
  discount?: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  description: string;
  material: string;
  sizes?: string[];
  colors?: string[];
  colorImages?: Record<string, string>;
  sizeGuideImage?: string;
  stock?: number;
  min?: number;
  max?: number;
  slug?: string;
  image?: string;
}

interface ProductInfoProps {
  product: ProductInfoData;
  showRating?: boolean;
  showOffers?: boolean;
}

export default function ProductInfo({
  product,
  showRating = true,
  showOffers = true,
}: ProductInfoProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] =
    useState(product.sizes?.[0] || "");

  const [selectedColor, setSelectedColor] =
    useState(product.colors?.[0] || "");

  const variant = product.variants?.find(v => (!v.values.size || v.values.size === selectedSize) && (!(v.values.color || v.values.colour) || (v.values.color || v.values.colour) === selectedColor));
  const sellingPrice = variant?.price ?? product.basePrice ?? Number(product.price.replace(/[^\d.]/g, ""));
  const compareAtPrice = Number((product.oldPrice ?? "").replace(/[^\d.]/g, ""));
  const discountPercent = compareAtPrice > sellingPrice ? Math.floor((compareAtPrice - sellingPrice) / compareAtPrice * 100) : 0;
  const selectedVariantStock = product.variants?.length ? variant?.stock ?? 0 : product.stock ?? 0;
  const minimumQuantity = product.min ?? 1;
  const maximumQuantity = Math.min(product.max ?? 10, selectedVariantStock);
  const canPurchase = product.variants?.length ? Boolean(variant && selectedVariantStock >= minimumQuantity) : (product.stock ?? 0) >= minimumQuantity;
  const colorSwatches: Record<string, string> = { Black: "#151515", Olive: "#647056", White: "#f5f5f3", Grey: "#a6a8aa", Gray: "#a6a8aa", Navy: "#233550", Beige: "#d8c7aa" };
  const [quantity, setQuantity] = useState(minimumQuantity);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const [wishlist, setWishlist] = useState(false);
  const [wishAnimating, setWishAnimating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  const [addedToBag, setAddedToBag] =
    useState(false);

  const [buyingNow, setBuyingNow] =
    useState(false);

  const checkDelivery = async () => {
    if (!/^[1-9]\d{5}$/.test(pincode)) {
      setDeliveryMessage("Enter a valid 6-digit PIN code.");
      return;
    }
    setCheckingDelivery(true);
    setDeliveryMessage("");
    try {
      const response = await fetch(`/api/delivery-estimate?pincode=${encodeURIComponent(pincode)}`);
      const result = await response.json();
      setDeliveryMessage(result.message ?? "Could not check this PIN code.");
    } catch {
      setDeliveryMessage("Delivery estimate is temporarily unavailable. Please try again shortly.");
    } finally {
      setCheckingDelivery(false);
    }
  };

  const addToBag = () => {
    if (!canPurchase || quantity < minimumQuantity || quantity > maximumQuantity) { setActionMessage(`Choose ${minimumQuantity}–${maximumQuantity} items.`); return; }
    if (product.variants?.length && (!variant || variant.stock < quantity)) { setActionMessage("Choose an available variant with enough stock."); return; }
    const savedCart = JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{
      id: number | string; quantity: number; size?: string; color?: string;
    }>;
    const existing = savedCart.find((item) => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
    const totalInBag = savedCart.filter(item => Number(item.id) === Number(product.id)).reduce((sum, item) => sum + item.quantity, 0);
    if (totalInBag + quantity > (product.max ?? 10)) { setActionMessage(`Maximum ${product.max ?? 10} items of this product per order.`); return; }
    const item = {
      id: product.id, slug: product.slug, name: product.name, category: product.category,
      price: sellingPrice, variantId: variant?.id, image: product.image ?? "/logo.png",
      quantity, size: selectedSize || undefined, color: selectedColor || undefined,
    };
    localStorage.setItem("susmita-cart", JSON.stringify(existing
      ? savedCart.map((cartItem) => cartItem === existing ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem)
      : [...savedCart, item]));
    window.dispatchEvent(new Event("cart-updated"));
    setAddedToBag(true);
    setActionMessage(`Added ${quantity} ${quantity === 1 ? "item" : "items"} to your bag.`);
    window.setTimeout(() => setActionMessage(null), 2800);

    setTimeout(() => {
      setAddedToBag(false);
    }, 2000);
  };

  useEffect(() => {
    const loadWishlist = async () => {
      const response = await fetch("/api/account/wishlist");
      if (!response.ok) return;
      const data = (await response.json()) as { productIds: number[] };
      setWishlist(data.productIds.includes(Number(product.id)));
    };
    void loadWishlist();
  }, [product.id]);

  const toggleWishlist = async () => {
    const productId = Number(product.id);
    if (!Number.isInteger(productId)) return;
    const nextValue = !wishlist;
    setWishlist(nextValue);
    setWishAnimating(true);
    window.setTimeout(() => setWishAnimating(false), 450);
    const response = await fetch(nextValue ? "/api/account/wishlist" : `/api/account/wishlist?productId=${productId}`, {
      method: nextValue ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      ...(nextValue ? { body: JSON.stringify({ productId }) } : {}),
    });
    if (!response.ok) {
      setWishlist(!nextValue);
      if (response.status === 401) window.dispatchEvent(new Event("vayziq:open-auth"));
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setActionMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
      window.setTimeout(() => setActionMessage(null), 3200);
      return;
    }
    setActionMessage(nextValue ? "Added to your wishlist" : "Removed from your wishlist");
    window.setTimeout(() => setActionMessage(null), 2600);
  };

  const buyNow = () => {
    if (!canPurchase || quantity < minimumQuantity || quantity > maximumQuantity) { setActionMessage(`Choose ${minimumQuantity}–${maximumQuantity} items.`); return; }
    if (product.variants?.length && (!variant || variant.stock < quantity)) {
      setActionMessage("Choose an available variant with enough stock.");
      return;
    }
    const checkoutItem = {
      id: Number(product.id),
      slug: product.slug,
      name: product.name,
      category: product.category,
      image: product.image ?? "/logo.png",
      price: sellingPrice,
      quantity,
      variantId: variant?.id,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    };
    sessionStorage.setItem("susmita-buy-now", JSON.stringify(checkoutItem));
    setBuyingNow(true);
    router.push("/checkout?buyNow=1");
  };

  return (
    <>
    <div className="min-w-0">

      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        {product.category}
      </p>

      {/* =====================================================
          PRODUCT NAME
      ===================================================== */}

      <h1 className="mt-2 max-w-xl text-xl font-semibold leading-snug tracking-tight text-[#171717] sm:text-2xl">
        {product.name}
      </h1>

      {/* =====================================================
          RATING
      ===================================================== */}

      {showRating && <button type="button" onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label={`Read ${product.reviews || 0} product reviews`} className="mt-4 flex flex-wrap items-center gap-3 rounded-md text-left transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbb606] focus-visible:ring-offset-2">

        <div className="flex items-center gap-1">

          {Array.from({ length: 5 }).map(
            (_, index) => (
              <Star
                key={index}
                className="h-4 w-4 text-[#B56F6F]"
                fill={
                  index < Math.round(product.rating || 0)
                    ? "currentColor"
                    : "none"
                  }
                strokeWidth={1.3}
              />
            )
          )}

        </div>

        <span className="text-xs text-[#756565]">
          {product.rating?.toFixed(1) || "0.0"}
        </span>

        <span className="text-xs text-[#B7A4A4]">
          |
        </span>

        <span className="text-xs text-[#756565]">
          {product.reviews || 0} Reviews
        </span>

      </button>}

      {/* =====================================================
          PRICE
      ===================================================== */}

      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">

        <span className="text-2xl font-bold tracking-tight text-[#171717] sm:text-[28px]">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(sellingPrice)}
        </span>

        {compareAtPrice > sellingPrice && (
          <span className="text-sm text-[#9A8888] line-through">
            {product.oldPrice}
          </span>
        )}

        {discountPercent > 0 && (
          <span className="rounded bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
            {discountPercent}% OFF
          </span>
        )}

      </div>

      <p className="mt-1 text-[11px] text-gray-500">
        Inclusive of all taxes
      </p>

      {/* =====================================================
          OFFER
      ===================================================== */}

      {showOffers && canPurchase && <div className="mt-3 border-b border-gray-200 pb-5">
        <ProductOfferBadges id={product.id} price={String(sellingPrice)} inStock={canPurchase} />
      </div>}

      {/* =====================================================
          COLOR
      ===================================================== */}

      {product.colors &&
        product.colors.length > 0 && (
          <div className="mt-7">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#4F4444]">
                COLOR
                <span className="ml-2 font-normal tracking-normal text-[#8A7777]">
                  {selectedColor}
                </span>
              </p>

            </div>

            <div className="mt-3 flex flex-wrap gap-3">

              {product.colors.map(
                (color, index) => {
                  const colorOutOfStock = Boolean(product.variants?.length && !product.variants.some((item) => (item.values.color || item.values.colour) === color && item.stock > 0));
                  const colorImage = product.colorImages?.[color];
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={colorOutOfStock}
                      onClick={() => { setSelectedColor(color); window.dispatchEvent(new CustomEvent("vayziq:product-color", { detail: { productId: Number(product.id), color } })); }}
                      title={color}
                      className={`relative overflow-hidden border text-xs transition ${colorImage ? "w-[76px] rounded-lg bg-white p-1" : "flex items-center gap-2 px-3 py-2"} ${
                        colorOutOfStock
                          ? "cursor-not-allowed border-[#e8e8e8] bg-[#f7f7f7] text-[#9a9a9a] opacity-60"
                          : selectedColor === color
                          ? "border-[#fbb606] ring-1 ring-[#fbb606]"
                          : "border-[#E8DADA] bg-white hover:border-[#fbb606]"
                      }`}
                    >
                      {colorImage ? <>
                        <span className="block aspect-[4/5] w-full rounded-md bg-[#f3f2f0] bg-cover bg-center" style={{ backgroundImage: `url(${colorImage})` }} />
                        <span className="block truncate px-1 pb-1 pt-2 text-center font-medium text-[#292321]">{color}</span>
                        {selectedColor === color && !colorOutOfStock && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#fbb606] text-black shadow"><Check className="h-3 w-3" /></span>}
                      </> : <>
                        <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: colorSwatches[color] ?? ["#D88A8A", "#405A78", "#648A6A", "#C7A4B8"][index % 4] }} />
                        {color}
                        {selectedColor === color && !colorOutOfStock && <Check className="h-3.5 w-3.5 text-[#9b7200]" />}
                      </>}
                    </button>
                ); }
              )}

            </div>

          </div>
        )}

      {/* =====================================================
          SIZE
      ===================================================== */}

      <div className="mt-7 border-t border-[#ece8e4] pt-6">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#4F4444]">
                {product.sizes?.length ? "SELECT SIZE" : "SIZE & FIT"}
              </p>

              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="
                  flex
                  items-center
                  gap-1.5
                  text-[10px]
                  font-medium
                  tracking-[0.08em]
                  text-[#B56F6F]
                  hover:underline
                "
              >
                <Ruler className="h-3.5 w-3.5" />
                SIZE GUIDE
              </button>

            </div>

            {product.sizes && product.sizes.length > 0 && <div className="mt-3 flex flex-wrap gap-2">

              {product.sizes.map((size) => {
                const sizeOutOfStock = Boolean(product.variants?.length && !product.variants.some((item) => item.values.size === size && (!(item.values.color || item.values.colour) || (item.values.color || item.values.colour) === selectedColor) && item.stock > 0));
                return <button
                  key={size}
                  type="button"
                  disabled={sizeOutOfStock}
                  onClick={() =>
                    setSelectedSize(size)
                  }
                  className={`
                    flex
                    h-10
                    min-w-12
                    items-center
                    justify-center
                    border
                    px-4
                    text-xs
                    transition
                    ${
                      sizeOutOfStock
                        ? "cursor-not-allowed border-[#e8e8e8] bg-[#f7f7f7] text-[#9a9a9a] line-through opacity-65"
                        : selectedSize === size
                        ? "border-[#B56F6F] bg-[#B56F6F] text-white"
                        : "border-[#E8DADA] bg-white text-[#4F4444] hover:border-[#B56F6F]"
                    }
                  `}
                >
                  {size}{sizeOutOfStock && <span className="ml-1 text-[8px] no-underline">Out</span>}
                </button>
              })}

            </div>}

            {product.variants?.length ? <p className={`mt-3 text-xs font-semibold ${canPurchase ? "text-emerald-700" : "text-rose-700"}`}>{canPurchase ? `${selectedVariantStock} item${selectedVariantStock === 1 ? "" : "s"} available in this variant` : "This selected variation is out of stock"}</p> : null}

          </div>

      {/* =====================================================
          QUANTITY
      ===================================================== */}

      <div className="mt-7">

        <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-[#4F4444]">
          QUANTITY
        </p>

        <div className="flex h-11 w-fit items-center border border-[#E8DADA]">

          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.max(minimumQuantity, value - 1)
              )
            }
            className="flex h-full w-11 items-center justify-center text-[#5E5151] transition hover:bg-[#F8EFEC]"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="w-10 text-center text-sm text-[#3B3333]">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((value) =>
                Math.min(maximumQuantity, value + 1)
              )
            }
            className="flex h-full w-11 items-center justify-center text-[#5E5151] transition hover:bg-[#F8EFEC]"
            aria-label="Increase quantity"
          disabled={!canPurchase || quantity >= maximumQuantity}
          >
            <Plus className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">

        <button
          type="button"
          onClick={addToBag}
          disabled={!canPurchase || quantity > maximumQuantity}
          className="
            flex
            h-13
            items-center
            justify-center
            gap-3
            border
            border-[#B56F6F]
            bg-[#B56F6F]
            px-6
            text-[10px]
            font-semibold
            tracking-[0.18em]
            text-white
            transition
            hover:bg-[#9F5E5E] disabled:cursor-not-allowed disabled:border-[#d6d6d6] disabled:bg-[#e6e6e6] disabled:text-[#777]
          "
        >
          <ShoppingBag
            className="h-4 w-4"
            strokeWidth={1.5}
          />

          {addedToBag
            ? "ADDED TO BAG"
            : "ADD TO BAG"}
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={!canPurchase || quantity > maximumQuantity}
          className="
            flex
            h-13
            items-center
            justify-center
            gap-3
            border
            border-[#2B2525]
            bg-[#2B2525]
            px-6
            text-[10px]
            font-semibold
            tracking-[0.18em]
            text-white
            transition
            hover:bg-[#3B3333] disabled:cursor-not-allowed disabled:border-[#d6d6d6] disabled:bg-[#e6e6e6] disabled:text-[#777]
          "
        >
          {buyingNow
            ? "PROCESSING..."
            : "BUY NOW"}
        </button>

      </div>

      {/* =====================================================
          WISHLIST / SHARE
      ===================================================== */}

      <div className="mt-5 flex items-center justify-center gap-7 border-b border-[#E8DADA] pb-6">

        <button
          type="button"
          onClick={toggleWishlist}
          className="flex items-center gap-2 text-xs text-[#6D5B5B] transition hover:text-[#B56F6F]"
        >
          <Heart
            className={`h-4 w-4 ${wishAnimating ? "wishlist-heart-pop" : ""}`}
            fill={
              wishlist
                ? "currentColor"
                : "none"
            }
            strokeWidth={1.5}
          />

          {wishlist
            ? "Added to Wishlist"
            : "Add to Wishlist"}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 text-xs text-[#6D5B5B] transition hover:text-[#B56F6F]"
        >
          <Share2
            className="h-4 w-4"
            strokeWidth={1.5}
          />

          Share
        </button>

      </div>

      {showOffers && canPurchase && <ProductOffers productId={Number(product.id)} quantity={quantity} price={sellingPrice} alwaysExpanded />}

      {actionMessage && (
        <p role="status" className="wishlist-toast fixed bottom-5 right-5 z-[90] rounded-full bg-[#2B2525] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {actionMessage}
        </p>
      )}

      {/* =====================================================
          DELIVERY
      ===================================================== */}

      <div className="mt-7">

        <div className="flex items-center gap-2">

          <Truck
            className="h-5 w-5 text-[#B56F6F]"
            strokeWidth={1.5}
          />

          <p className="text-sm font-medium text-[#3B3333]">
            Check Delivery
          </p>

        </div>

        <div className="mt-3 flex h-11 border border-[#E8DADA] bg-white">

          <div className="flex flex-1 items-center gap-2 px-3">

            <MapPin
              className="h-4 w-4 text-[#9A8888]"
              strokeWidth={1.5}
            />

            <input
              type="text"
              value={pincode}
              onChange={(event) =>
                {
                  setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setDeliveryMessage("");
                }
              }
              inputMode="numeric"
              aria-label="Delivery PIN code"
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void checkDelivery(); } }}
              placeholder="Enter 6-digit PIN code"
              className="
                min-w-0
                flex-1
                bg-transparent
                text-xs
                text-[#4F4444]
                outline-none
                placeholder:text-[#B7A4A4]
              "
            />

          </div>

          <button
            type="button"
            onClick={() => void checkDelivery()}
            disabled={checkingDelivery || pincode.length !== 6}
            className="
              border-l
              border-[#E8DADA]
              px-5
              text-[10px]
              font-semibold
              tracking-[0.1em]
              text-[#B56F6F]
              transition
              hover:bg-[#F8EFEC]
              disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            CHECK
          </button>

        </div>

        {deliveryMessage && (
          <p role="status" aria-live="polite" className="mt-2 text-xs text-[#756565]">
            {deliveryMessage}
          </p>
        )}

      </div>

    </div>

      {sizeGuideOpen && <SizeGuideDialog product={product} selectedSize={selectedSize} onSelect={(size) => { setSelectedSize(size); setSizeGuideOpen(false); }} onClose={() => setSizeGuideOpen(false)} />}
    </>
  );
}
function SizeGuideDialog({ product, selectedSize, onSelect, onClose }: { product: ProductInfoData; selectedSize: string; onSelect: (size: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"chart" | "measure">("chart");
  const sizes = product.sizes ?? [];

  return <div className="fixed inset-0 z-[280] flex items-end justify-center bg-black/60 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onMouseDown={onClose}>
    <div className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[88dvh] sm:rounded-2xl" onMouseDown={(event) => event.stopPropagation()}>
      <header className="flex items-start justify-between border-b border-[#e9e5e2] px-5 py-4 sm:px-7 sm:py-5">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9b7200]">Find your perfect fit</p><h2 id="size-guide-title" className="mt-1 text-xl font-bold text-[#171717] sm:text-2xl">Size Guide</h2><p className="mt-1 max-w-xl truncate text-xs text-[#756b66] sm:text-sm">{product.name}</p></div>
        <button type="button" onClick={onClose} aria-label="Close size guide" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e5e0dc] text-[#292321] transition hover:bg-[#f5f3f1]"><X className="h-5 w-5" /></button>
      </header>
      <div className="flex border-b border-[#e9e5e2] px-5 sm:px-7">
        <button type="button" onClick={() => setTab("chart")} className={`relative px-1 py-4 text-xs font-bold uppercase tracking-[0.12em] ${tab === "chart" ? "text-[#171717] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#fbb606]" : "text-[#8a817c]"}`}>Size chart</button>
        <button type="button" onClick={() => setTab("measure")} className={`relative ml-8 px-1 py-4 text-xs font-bold uppercase tracking-[0.12em] ${tab === "measure" ? "text-[#171717] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#fbb606]" : "text-[#8a817c]"}`}>How to measure</button>
      </div>
      <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        {tab === "chart" ? <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(230px,0.8fr)]">
          <div className="min-w-0">{product.sizeGuideImage ? <div className="overflow-hidden rounded-xl border border-[#e8e3df] bg-[#faf9f8] p-2"><Image src={product.sizeGuideImage} alt={`${product.name} size chart`} width={1200} height={1600} className="max-h-[52dvh] h-auto w-full object-contain" /></div> : <div className="rounded-xl border border-dashed border-[#d9d1ca] bg-[#faf9f7] px-5 py-9 text-center"><Ruler className="mx-auto h-8 w-8 text-[#b08a21]" /><h3 className="mt-3 text-base font-bold text-[#292321]">Product size chart coming soon</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756b66]">Choose from the available sizes or contact support for exact garment measurements.</p></div>}</div>
          <aside className="rounded-xl border border-[#e8e3df] p-4 sm:p-5"><h3 className="text-sm font-bold text-[#292321]">Available sizes</h3><p className="mt-1 text-xs leading-5 text-[#81766f]">Select a size to apply it to this product.</p>{sizes.length ? <div className="mt-4 grid grid-cols-3 gap-2">{sizes.map((size) => <button key={size} type="button" onClick={() => onSelect(size)} className={`h-11 rounded-lg border text-sm font-bold transition ${selectedSize === size ? "border-[#fbb606] bg-[#fff4c7] text-[#171717]" : "border-[#ded8d3] bg-white text-[#3b3430] hover:border-[#fbb606]"}`}>{size}</button>)}</div> : <p className="mt-4 rounded-lg bg-[#f7f5f3] px-4 py-3 text-xs leading-5 text-[#756b66]">No size variants are configured for this product.</p>}<div className="mt-5 border-t border-[#ece7e3] pt-4 text-xs leading-5 text-[#756b66]"><strong className="block text-[#292321]">Fit tip</strong>If you are between two sizes, choose the larger size for a relaxed fit.</div></aside>
        </div> : <div className="grid gap-4 sm:grid-cols-3">{[["1","Chest / Bust","Measure around the fullest part, keeping the tape level."],["2","Waist","Measure around your natural waist without pulling the tape tight."],["3","Hip / Inseam","Measure the fullest hip; for inseam, measure from crotch to ankle."]].map(([number,title,copy]) => <article key={number} className="rounded-xl border border-[#e8e3df] bg-[#faf9f7] p-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#fbb606] text-sm font-bold text-[#171717]">{number}</span><h3 className="mt-4 font-bold text-[#292321]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#756b66]">{copy}</p></article>)}<p className="rounded-lg bg-[#fff7dc] px-4 py-3 text-xs leading-5 text-[#5b4a15] sm:col-span-3">Use a soft measuring tape and wear light clothing. Keep the tape comfortably snug for the most accurate fit.</p></div>}
      </div>
    </div>
  </div>;
}
