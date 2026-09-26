"use client";
import { useCartPrices, cartLineKey } from "@/lib/use-cart-prices";
import type { HomepageVisibility } from "@/lib/homepage-settings";
import { useOffers } from "@/lib/use-offers";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import OfferSelector from "@/components/product/OfferSelector";
import { offerDiscount } from "@/lib/product-offers";
import { useEffect, useMemo, useState } from "react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

interface CartItem {
  id: number;
  variantId?: number;
  slug?: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export default function CartPageClient({ visibility }: { visibility: HomepageVisibility }) {
  const { offers: productOffers, loading: offersLoading, error: offersError } = useOffers();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  async function proceedToCheckout() {
    if (checkingSession) return;
    setCheckingSession(true); setCheckoutError("");
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) throw new Error("Session check failed");
      const data = await response.json();
      if (data.user) router.push("/checkout");
      else setAuthOpen(true);
    } catch { setCheckoutError("Unable to check your session. Please try again."); }
    finally { setCheckingSession(false); }
  }

  // localStorage is unavailable to the server. Load it after hydration so
  // the empty server render and the first browser render always match.
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [offerCode, setOfferCode] = useState("");
  const [cartLoaded, setCartLoaded] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = window.setTimeout(() => {
      try {
        if (visibility.cartOffers) {
          setOfferCode(localStorage.getItem("tantuka-offer") || "");
        } else {
          localStorage.removeItem("tantuka-offer");
          setOfferCode("");
        }
        setCartItems(JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as CartItem[]);
      } catch {
        setCartItems([]);
      }
      setCartLoaded(true);
    }, 0);
    return () => window.clearTimeout(loadCart);
  }, [visibility.cartOffers]);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("susmita-cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("cart-updated"));
  }, [cartItems, cartLoaded]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
      items.map((item) => {
        if (cartLineKey(item) !== id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity + change),
        };
      })
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) =>
      items.filter((item) => cartLineKey(item) !== id)
    );
  };

  const saveForLater = async (item: CartItem) => {
    const response = await fetch("/api/account/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.id }) });
    if (response.ok) {
      removeItem(cartLineKey(item));
      setWishlistMessage("Saved to your wishlist");
    } else {
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setWishlistMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
    }
    window.setTimeout(() => setWishlistMessage(null), 3200);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const priceError = useCartPrices(cartItems, setCartItems);
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = subtotal >= 999 ? 0 : 79;

  const discount = visibility.cartOffers
    ? offerDiscount(offerCode, subtotal, productOffers, cartItems)
    : 0;
  const total = subtotal + shipping - discount;

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <main className="min-h-screen bg-[#FFFDFC]">
      {authOpen && <AuthModal open onClose={() => setAuthOpen(false)} onSuccess={() => { setAuthOpen(false); router.push("/checkout"); router.refresh(); }} />}

      {wishlistMessage && (
        <p role="status" className="wishlist-toast fixed bottom-5 right-5 z-[90] rounded-full bg-[#2B2525] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {wishlistMessage}
        </p>
      )}

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      {visibility.cartPageHeader && (
        <section className="border-b border-[#E8DADA] bg-[#F8EFEC]">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#B56F6F]">YOUR BAG</p>
            <h1 className="font-serif text-5xl leading-none text-[#2B2525] sm:text-6xl">Shopping Cart</h1>
            <p className="mt-4 text-sm text-[#756565]">Review your selected pieces before checkout.</p>
          </div>
        </section>
      )}

      {/* =====================================================
          CART
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

        {cartItems.length === 0 ? (

          /* =================================================
             EMPTY CART
          ================================================= */

          <div className="flex min-h-[420px] items-center justify-center border border-[#E8DADA] bg-white">

            <div className="max-w-md px-6 py-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EFEC]">
                <ShoppingBag
                  className="h-7 w-7 text-[#B56F6F]"
                  strokeWidth={1.4}
                />
              </div>

              <h2 className="mt-6 font-serif text-2xl text-[#2B2525]">
                Your cart is empty
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8A7777]">
                Looks like you haven&apos;t added anything to
                your bag yet.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex h-11 items-center gap-3 bg-[#B56F6F] px-7 text-[10px] font-semibold tracking-[0.15em] text-white transition hover:bg-[#9F5E5E]"
              >
                CONTINUE SHOPPING

                <ArrowLeft
                  className="h-4 w-4 rotate-180"
                  strokeWidth={1.7}
                />
              </Link>

            </div>

          </div>

        ) : (

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">

            {/* =================================================
                CART ITEMS
            ================================================= */}

            <div>

              {/* CART HEADER */}

              {(visibility.cartItemCount || visibility.cartClearButton) && (
                <div className="mb-5 flex items-center justify-between border-b border-[#E8DADA] pb-5">
                  {visibility.cartItemCount ? (
                    <p className="font-serif text-lg italic text-[#4F4444]">
                      {totalItems} {totalItems === 1 ? "Item" : "Items"}
                    </p>
                  ) : <span />}
                  {visibility.cartClearButton && (
                    <button type="button" onClick={clearCart} className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] text-[#8E7777] transition hover:text-[#B56F6F]">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /> CLEAR CART
                    </button>
                  )}
                </div>
              )}

              {/* ITEMS */}

              <div className="divide-y divide-[#E8DADA]">

                {cartItems.map((item) => (

                  <div
                    key={cartLineKey(item)}
                    className="flex gap-4 py-6 sm:gap-6"
                  >

                    {/* IMAGE */}

                    <Link
                      href={`/product/${item.slug ?? item.id}`}
                      className="h-32 w-24 shrink-0 overflow-hidden bg-[#F8EFEC] sm:h-40 sm:w-32"
                    >
                      <ProgressiveImage
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>

                    {/* INFO */}

                    <div className="flex min-w-0 flex-1 flex-col">

                      <p className="text-[10px] font-semibold tracking-[0.15em] text-[#B56F6F]">
                        {item.category}
                      </p>

                      <h2 className="mt-2 font-serif text-lg leading-tight text-[#2B2525] sm:text-xl">
                        {item.name}
                      </h2>

                      {/* VARIANTS */}

                      <div className="mt-2 space-y-1">

                        {item.size && (
                          <p className="text-xs text-[#8A7777]">
                            Size:{" "}
                            <span className="text-[#5F5050]">
                              {item.size}
                            </span>
                          </p>
                        )}

                        {item.color && (
                          <p className="text-xs text-[#8A7777]">
                            Color:{" "}
                            <span className="text-[#5F5050]">
                              {item.color}
                            </span>
                          </p>
                        )}

                      </div>

                      {/* PRICE */}

                      <p className="mt-3 font-serif text-base text-[#3B3333]">
                        {formatPrice(item.price)}
                      </p>

                      {/* BOTTOM */}

                      <div className="mt-auto flex items-end justify-between gap-3 pt-4">

                        {/* QUANTITY */}

                        <div className="flex h-9 items-center border border-[#E8DADA] bg-white">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(cartLineKey(item), -1)
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-full w-9 items-center justify-center text-[#6D5B5B] transition hover:bg-[#F8EFEC] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <Minus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.6}
                            />
                          </button>

                          <span className="w-8 text-center text-xs text-[#3B3333]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(cartLineKey(item), 1)
                            }
                            className="flex h-full w-9 items-center justify-center text-[#6D5B5B] transition hover:bg-[#F8EFEC]"
                            aria-label="Increase quantity"
                          >
                            <Plus
                              className="h-3.5 w-3.5"
                              strokeWidth={1.6}
                            />
                          </button>

                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(cartLineKey(item))
                          }
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#9A8888] transition hover:text-[#B56F6F]"
                        >
                          <Trash2
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />

                          <span className="hidden sm:inline">
                            REMOVE
                          </span>
                        </button>

                        {visibility.cartSaveForLater && <button
                          type="button"
                          onClick={() => void saveForLater(item)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#9A8888] transition hover:text-[#B56F6F]"
                        >
                          <span className="hidden sm:inline">SAVE FOR LATER</span>
                          <span className="sm:hidden">SAVE</span>
                        </button>}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

              {/* CONTINUE SHOPPING */}

              <Link
                href="/shop"
                className="mt-7 inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.15em] text-[#6D5B5B] transition hover:text-[#B56F6F]"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  strokeWidth={1.6}
                />

                CONTINUE SHOPPING
              </Link>

            </div>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <aside className="h-fit border border-[#E8DADA] bg-[#F8EFEC] p-6 sm:p-7">

              <h2 className="font-serif text-2xl text-[#2B2525]">
                Order Summary
              </h2>

              <p role="alert" className="text-xs text-red-700">{priceError}</p>
              {visibility.cartOffers && <>
                <OfferSelector items={cartItems} offers={productOffers} loading={offersLoading} error={offersError} subtotal={subtotal} code={offerCode} onChange={code => { setOfferCode(code); localStorage.setItem("tantuka-offer", code); }} />
                {discount > 0 && <p className="flex justify-between text-sm text-emerald-800"><span>Offer discount</span><span>−{formatPrice(discount)}</span></p>}
              </>}
              {/* SUMMARY */}

              <div className="mt-6 space-y-4 border-b border-[#DECACA] pb-6">

                <div className="flex justify-between text-sm text-[#6D5B5B]">
                  <span>Subtotal</span>

                  <span>
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-[#6D5B5B]">
                  <span>Shipping</span>

                  <span>
                    {shipping === 0
                      ? "FREE"
                      : formatPrice(shipping)}
                  </span>
                </div>

              </div>

              {/* TOTAL */}

              <div className="flex items-center justify-between py-6">

                <span className="font-serif text-lg text-[#2B2525]">
                  Total
                </span>

                <span className="font-serif text-xl text-[#2B2525]">
                  {formatPrice(total)}
                </span>

              </div>

              {/* CHECKOUT */}

              <button
                type="button"
                onClick={proceedToCheckout}
                disabled={checkingSession}
                aria-busy={checkingSession}
                className="flex h-12 w-full items-center justify-center gap-3 bg-[#B56F6F] text-[10px] font-semibold tracking-[0.18em] text-white transition hover:bg-[#9F5E5E] hover:shadow-lg disabled:cursor-wait disabled:opacity-60"
              >
                <ShoppingBag
                  className="h-4 w-4"
                  strokeWidth={1.5}
                />

                {checkingSession ? "PLEASE WAIT…" : "PROCEED TO CHECKOUT"}
              </button>
              {checkoutError && <p role="alert" className="mt-3 text-xs text-rose-700">{checkoutError}</p>}

              {/* SHIPPING MESSAGE */}

              {visibility.cartShippingMessage && (subtotal < 999 ? (

                <p className="mt-5 text-center text-xs leading-5 text-[#8A7777]">
                  Add{" "}
                  <span className="font-medium text-[#B56F6F]">
                    {formatPrice(999 - subtotal)}
                  </span>{" "}
                  more to get free shipping.
                </p>

              ) : (

                <p className="mt-5 text-center text-xs text-[#8A7777]">
                  You qualify for free shipping.
                </p>

              ))}

              {/* TRUST */}

              {visibility.cartTrustBenefits && <div className="mt-6 border-t border-[#DECACA] pt-5">

                <div className="flex items-center gap-3 text-xs text-[#756565]">
                  <Check
                    className="h-4 w-4 shrink-0 text-[#B56F6F]"
                    strokeWidth={1.6}
                  />

                  Secure checkout
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#756565]">
                  <Check
                    className="h-4 w-4 shrink-0 text-[#B56F6F]"
                    strokeWidth={1.6}
                  />

                  Easy returns
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#756565]">
                  <Check
                    className="h-4 w-4 shrink-0 text-[#B56F6F]"
                    strokeWidth={1.6}
                  />

                  Quality assured
                </div>

              </div>}

            </aside>

          </div>

        )}

      </section>

    </main>
  );
}
