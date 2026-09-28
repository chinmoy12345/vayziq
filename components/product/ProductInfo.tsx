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
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductOffers from "./ProductOffers";

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
  const selectedVariantStock = variant?.stock ?? 0;
  const canPurchase = !product.variants?.length || Boolean(variant && selectedVariantStock > 0);
  const colorSwatches: Record<string, string> = { Black: "#151515", Olive: "#647056", White: "#f5f5f3", Grey: "#a6a8aa", Gray: "#a6a8aa", Navy: "#233550", Beige: "#d8c7aa" };
  const [quantity, setQuantity] = useState(1);

  const [wishlist, setWishlist] = useState(false);
  const [wishAnimating, setWishAnimating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const estimatedSubtotal = sellingPrice * quantity;
  const amountUntilFreeShipping = Math.max(0, 999 - estimatedSubtotal);

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
    if (product.variants?.length && (!variant || variant.stock < quantity)) { setActionMessage("Choose an available variant with enough stock."); return; }
    const savedCart = JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{
      id: number | string; quantity: number; size?: string; color?: string;
    }>;
    const existing = savedCart.find((item) => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
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
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setActionMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
      window.setTimeout(() => setActionMessage(null), 3200);
      return;
    }
    setActionMessage(nextValue ? "Added to your wishlist" : "Removed from your wishlist");
    window.setTimeout(() => setActionMessage(null), 2600);
  };

  const buyNow = () => {
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
    <div className="min-w-0">

      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <p className="text-[10px] font-semibold tracking-[0.25em] text-[#B56F6F]">
        {product.category}
      </p>

      {/* =====================================================
          PRODUCT NAME
      ===================================================== */}

      <h1 className="mt-3 max-w-xl font-serif text-3xl leading-tight text-[#2B2525] sm:text-4xl">
        {product.name}
      </h1>

      {/* =====================================================
          RATING
      ===================================================== */}

      {showRating && <div className="mt-4 flex flex-wrap items-center gap-3">

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

      </div>}

      {/* =====================================================
          PRICE
      ===================================================== */}

      <div className="mt-6 flex flex-wrap items-center gap-3">

        <span className="font-serif text-2xl text-[#2B2525]">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(sellingPrice)}
        </span>

        {product.oldPrice && (
          <span className="text-sm text-[#9A8888] line-through">
            {product.oldPrice}
          </span>
        )}

        {product.discount && (
          <span className="text-xs font-semibold text-[#B56F6F]">
            {product.discount}
          </span>
        )}

      </div>

      <p className="mt-1 text-[10px] text-[#9A8888]">
        Inclusive of all taxes
      </p>

      {/* =====================================================
          OFFER
      ===================================================== */}

      {showOffers && <ProductOffers productId={Number(product.id)} quantity={quantity} price={sellingPrice} />}

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
                  return (
                  <button
                    key={color}
                    type="button"
                    disabled={colorOutOfStock}
                    onClick={() =>
                      setSelectedColor(color)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      border
                      px-3
                      py-2
                      text-xs
                      transition
                      ${
                        colorOutOfStock
                          ? "cursor-not-allowed border-[#e8e8e8] bg-[#f7f7f7] text-[#9a9a9a] opacity-60"
                          : selectedColor === color
                          ? "border-[#B56F6F] bg-[#F8EFEC]"
                          : "border-[#E8DADA] bg-white hover:border-[#C99A9A]"
                      }
                    `}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{
                        backgroundColor:
                          colorSwatches[color] ?? ["#D88A8A", "#405A78", "#648A6A", "#C7A4B8"][index % 4],
                      }}
                    />

                    {color}

                    {selectedColor === color && !colorOutOfStock && (
                      <Check
                        className="h-3.5 w-3.5 text-[#B56F6F]"
                      />
                    )}
                  </button>
                ); }
              )}

            </div>

          </div>
        )}

      {/* =====================================================
          SIZE
      ===================================================== */}

      {product.sizes &&
        product.sizes.length > 0 && (
          <div className="mt-7">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#4F4444]">
                SELECT SIZE
              </p>

              <button
                type="button"
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

            <div className="mt-3 flex flex-wrap gap-2">

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

            </div>

            {product.variants?.length ? <p className={`mt-3 text-xs font-semibold ${canPurchase ? "text-emerald-700" : "text-rose-700"}`}>{canPurchase ? `${selectedVariantStock} item${selectedVariantStock === 1 ? "" : "s"} available in this variant` : "This selected variation is out of stock"}</p> : null}

          </div>
        )}

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
                Math.max(1, value - 1)
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
                Math.min(variant ? Math.max(1, Math.min(10, variant.stock)) : 10, value + 1)
              )
            }
            className="flex h-full w-11 items-center justify-center text-[#5E5151] transition hover:bg-[#F8EFEC]"
            aria-label="Increase quantity"
          disabled={!canPurchase || quantity >= Math.min(10, selectedVariantStock)}
          >
            <Plus className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* =====================================================
          ACTION BUTTONS
      ===================================================== */}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">

        <button
          type="button"
          onClick={addToBag}
          disabled={!canPurchase || quantity > selectedVariantStock}
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
          disabled={!canPurchase || quantity > selectedVariantStock}
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
  );
}
