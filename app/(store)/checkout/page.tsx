// app/checkout/page.tsx

"use client";
import { useCartPrices, cartLineKey } from "@/lib/use-cart-prices";
import { useOffers } from "@/lib/use-offers";

import Image from "next/image";
import OfferSelector from "@/components/product/OfferSelector";
import Breadcrumbs from "@/components/store/Breadcrumbs";
import { offerDiscount } from "@/lib/product-offers";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

type Address = {
  id: number;
  variantId?: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Office";
  isDefault: boolean;
};

type CartItem = {
  variantId?: number;
  size?: string;
  color?: string;
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  quantity: number;
};

type PaymentMethod = "cod" | "razorpay";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = { open: () => void };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (payment: RazorpayPaymentResponse) => void | Promise<void>;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

function loadRazorpayCheckout() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { offers: productOffers, loading: offersLoading, error: offersError } = useOffers();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Keep the server and browser's first render identical. The cart is stored
  // in localStorage, which only exists after the page has hydrated.
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedAddress, setSelectedAddress] =
    useState<number>(0);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [coupon, setCoupon] = useState("");
  const [buyNowMode, setBuyNowMode] = useState(false);
  const [couponApplied, setCouponApplied] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState(false);

  const [showAddressList, setShowAddressList] =
    useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressForm, setAddressForm] = useState({ fullName: "", mobile: "", line1: "", line2: "", city: "", state: "", postalCode: "" });

  useEffect(() => {
    const loadCart = window.setTimeout(() => {
      try {
        const isBuyNow = new URLSearchParams(window.location.search).get("buyNow") === "1";
        const buyNowItem = isBuyNow ? sessionStorage.getItem("susmita-buy-now") : null;
        if (buyNowItem) {
          sessionStorage.removeItem("susmita-buy-now");
          setBuyNowMode(true);
          setCoupon(""); setCouponApplied(false);
          setCart([JSON.parse(buyNowItem) as CartItem]);
        } else {
          const savedOffer = localStorage.getItem("tantuka-offer") || "";
          setCoupon(savedOffer); setCouponApplied(Boolean(savedOffer));
          setCart(JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as CartItem[]);
        }
      } catch {
        setCart([]);
      }
    }, 0);
    return () => window.clearTimeout(loadCart);
  }, []);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setCheckoutReady(true), 0);
    return () => window.clearTimeout(readyTimer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/payments/razorpay/availability", { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then((data: { available?: boolean } | null) => { if (!controller.signal.aborted) setOnlinePaymentAvailable(data?.available === true); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      const response = await fetch("/api/account/addresses");
      if (!response.ok) return;
      const data = (await response.json()) as { addresses: Array<{ id: number; fullName: string; mobile: string; line1: string; city: string; state: string; postalCode: string; isDefault: boolean }> };
      const saved = data.addresses.map((address) => ({ id: address.id, name: address.fullName, phone: address.mobile, address: address.line1, city: address.city, state: address.state, pincode: address.postalCode, type: "Home" as const, isDefault: address.isDefault }));
      setAddresses(saved); setSelectedAddress(saved.find((address) => address.isDefault)?.id ?? saved[0]?.id ?? 0);
    };
    void loadAddresses();
  }, []);

  const priceError = useCartPrices(cart, setCart);
  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 999 ? 0 : 79;

  const discount = couponApplied ? offerDiscount(coupon, subtotal, productOffers, cart) : 0;

  const total =
    subtotal + shipping - discount;

  const currentAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddress
    ) ?? addresses[0];

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    const offer = productOffers.find(item => item.code === code);
    if (!offerDiscount(code, subtotal, productOffers, cart)) {
      setCheckoutMessage(offer ? "Minimum order for " + code + " is ₹" + offer.minimum + "." : "Please enter a valid offer code.");
      setCouponApplied(false); return;
    }
    localStorage.setItem("tantuka-offer", code); setCoupon(code); setCouponApplied(true); setCheckoutMessage("");
  }

  function removeCoupon() {
    localStorage.removeItem("tantuka-offer");
    setCoupon("");
    setCouponApplied(false);
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAddress(true); setAddressError("");
    try {
      const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addressForm) });
      const data = (await response.json()) as { message?: string; address?: { id: number; fullName: string; mobile: string; line1: string; city: string; state: string; postalCode: string; isDefault: boolean } };
      if (!response.ok || !data.address) { setAddressError(data.message || "Unable to save address."); return; }
      const added = { id: data.address.id, name: data.address.fullName, phone: data.address.mobile, address: data.address.line1, city: data.address.city, state: data.address.state, pincode: data.address.postalCode, type: "Home" as const, isDefault: data.address.isDefault };
      setAddresses((current) => [...current, added]); setSelectedAddress(added.id); setShowAddressForm(false); setShowAddressList(false);
    } catch { setAddressError("Unable to save address. Please try again."); }
    finally { setSavingAddress(false); }
  }

  async function handlePlaceOrder() {
    if (!currentAddress) {
      return;
    }

    setPlacingOrder(true);
    setCheckoutMessage("");
    let paymentGatewayOpen = false;

    try {
      if (paymentMethod === "razorpay") {
        const response = await fetch("/api/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ addressId: selectedAddress, items: cart, couponCode: couponApplied ? coupon : undefined }),
        });
        const data = (await response.json()) as {
          message?: string;
          keyId?: string;
          razorpayOrderId?: string;
          amount?: number;
          currency?: string;
          internalOrderId?: number;
          orderNumber?: string;
          customer?: { name: string; email: string; contact: string };
        };
        if (!response.ok || !data.keyId || !data.razorpayOrderId || !data.amount || !data.currency || !data.internalOrderId || !data.orderNumber || !data.customer) {
          throw new Error(data.message || "Unable to start online payment.");
        }
        const checkoutIsReady = await loadRazorpayCheckout();
        if (!checkoutIsReady || !window.Razorpay) {
          throw new Error("Razorpay checkout could not be loaded. Please check your connection and try again.");
        }

        const razorpay = new window.Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Vayziq",
          description: `Order ${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          prefill: data.customer,
          theme: { color: "#111111" },
          modal: { ondismiss: () => setPlacingOrder(false) },
          handler: async (payment) => {
            setPlacingOrder(true);
            try {
              const verifyResponse = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ internalOrderId: data.internalOrderId, ...payment }),
              });
              const verification = (await verifyResponse.json()) as { message?: string; orderNumber?: string };
              if (!verifyResponse.ok || !verification.orderNumber) {
                throw new Error(verification.message || "We could not verify your payment.");
              }
              if (!buyNowMode) {
                localStorage.removeItem("susmita-cart");
                localStorage.removeItem("tantuka-offer");
                window.dispatchEvent(new Event("cart-updated"));
              }
              router.push(`/order-success/${encodeURIComponent(verification.orderNumber)}`);
              router.refresh();
            } catch (error) {
              setCheckoutMessage(error instanceof Error ? error.message : "We could not verify your payment. Please contact support if money was deducted.");
            } finally {
              setPlacingOrder(false);
            }
          },
        });
        razorpay.open();
        paymentGatewayOpen = true;
        return;
      }

      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addressId: selectedAddress, paymentMethod, items: cart, couponCode: couponApplied ? coupon : undefined }) });
      const data = (await response.json()) as { message?: string; orderNumber?: string };
      if (!response.ok || !data.orderNumber) throw new Error(data.message || "Unable to place order.");
      if (!buyNowMode) {
        localStorage.removeItem("susmita-cart");
        localStorage.removeItem("tantuka-offer");
        window.dispatchEvent(new Event("cart-updated"));
      }
      router.push(`/order-success/${encodeURIComponent(data.orderNumber)}`);
      router.refresh();
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "Unable to place order. Please try again.");
    } finally {
      if (!paymentGatewayOpen) setPlacingOrder(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdf9]">
      <Breadcrumbs title="Checkout" isShop={false} parent={{ label: "Bag", href: "/cart" }} />

      {/* =====================================
          CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Back */}

        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#9b5c5c]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        {/* Title */}

        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8e8e8] pb-6">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a97900]">Vayziq checkout</p><h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">Complete your order</h1><p className="mt-1 text-sm text-[#666]">Review your delivery, payment and order details.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-2 text-xs font-semibold text-[#333]"><ShieldCheck className="h-4 w-4 text-[#168660]" /> Secure checkout</div>
        </div>

        {/* =====================================
            MAIN GRID
        ====================================== */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* ===================================
              LEFT
          ==================================== */}

          <div className="space-y-6">
            {/* =================================
                DELIVERY ADDRESS
            ================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b56f6f]/10">
                    <MapPin className="h-4 w-4 text-[#9b5c5c]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Delivery Address
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Where should we deliver your
                      order?
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddressList(
                      !showAddressList
                    )
                  }
                  className="text-xs font-semibold text-[#111] hover:underline"
                >
                  {currentAddress ? "Change" : "Add address"}
                </button>
              </div>

              <div className="p-5 sm:p-6">
                {currentAddress && (
                  <div className="rounded-xl border border-[#d8b4a0] bg-[#fffaf7] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#9b5c5c]">
                          <Check className="h-3 w-3 text-white" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                              {currentAddress.name}
                            </p>

                            <span className="rounded-full bg-[#9b5c5c]/10 px-2 py-0.5 text-[10px] font-medium text-[#9b5c5c]">
                              {currentAddress.type}
                            </span>
                          </div>

                          <p className="mt-1 text-sm leading-6 text-gray-600">
                            {currentAddress.address}
                            <br />
                            {currentAddress.city},{" "}
                            {currentAddress.state}{" "}
                            -{" "}
                            {currentAddress.pincode}
                          </p>

                          <p className="mt-2 text-xs text-gray-500">
                            Mobile:{" "}
                            <span className="font-medium text-gray-700">
                              {currentAddress.phone}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address selector */}

                {(showAddressList || !currentAddress) && (
                  <div className="mt-4 space-y-3">
                    {addresses.map(
                      (address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddress(
                              address.id
                            );
                            setShowAddressList(
                              false
                            );
                          }}
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            selectedAddress ===
                            address.id
                              ? "border-[#c99568] bg-[#fffaf7]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selectedAddress ===
                                address.id
                                  ? "border-[#9b5c5c] bg-[#9b5c5c]"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddress ===
                                address.id && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {address.name}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-gray-500">
                                {address.address},{" "}
                                {address.city},{" "}
                                {address.state} -{" "}
                                {address.pincode}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => { setShowAddressForm(true); setAddressError(""); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 hover:border-[#ffb900] hover:text-[#111]"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Address
                    </button>
                    {showAddressForm && <form className="space-y-3 rounded-xl border border-[#d8b4a0] bg-[#fffaf7] p-4" onSubmit={saveAddress}>
                      <p className="text-sm font-semibold text-gray-900">Add delivery address</p>
                      <div className="grid gap-3 sm:grid-cols-2"><input className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" onChange={(event) => setAddressForm({ ...addressForm, fullName: event.target.value })} placeholder="Full name" required value={addressForm.fullName} /><input className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" inputMode="numeric" maxLength={10} onChange={(event) => setAddressForm({ ...addressForm, mobile: event.target.value.replace(/\D/g, "") })} placeholder="Mobile number" required value={addressForm.mobile} /></div>
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })} placeholder="House / street / area" required value={addressForm.line1} />
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm" onChange={(event) => setAddressForm({ ...addressForm, line2: event.target.value })} placeholder="Landmark (optional)" value={addressForm.line2} />
                      <div className="grid gap-3 sm:grid-cols-3"><input className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} placeholder="City" required value={addressForm.city} /><input className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} placeholder="State" required value={addressForm.state} /><input className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" inputMode="numeric" maxLength={6} onChange={(event) => setAddressForm({ ...addressForm, postalCode: event.target.value.replace(/\D/g, "") })} placeholder="PIN code" required value={addressForm.postalCode} /></div>
                      {addressError && <p className="text-xs text-red-600">{addressError}</p>}<div className="flex justify-end gap-2"><button className="rounded-lg px-3 py-2 text-xs font-medium text-gray-600" onClick={() => setShowAddressForm(false)} type="button">Cancel</button><button className="rounded-lg bg-[#111] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" disabled={savingAddress} type="submit">{savingAddress ? "Saving..." : "Save Address"}</button></div>
                    </form>}
                  </div>
                )}
              </div>
            </section>

            {/* =================================
                DELIVERY
            ================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b56f6f]/10">
                    <Truck className="h-4 w-4 text-[#9b5c5c]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Delivery
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Estimated delivery
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Standard Delivery
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Delivery within 4–7 business
                      days
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping}`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================
                PAYMENT
            ================================== */}

            <section className="rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b56f6f]/10">
                    <CreditCard className="h-4 w-4 text-[#9b5c5c]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Choose your preferred payment
                      method
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-5 sm:p-6">
                {/* COD */}

                <PaymentOption
                  selected={
                    paymentMethod === "cod"
                  }
                  onSelect={() =>
                    setPaymentMethod("cod")
                  }
                  icon={
                    <Wallet className="h-5 w-5" />
                  }
                  title="Cash on Delivery"
                  description="Pay when your order arrives"
                />

                {onlinePaymentAvailable && <PaymentOption
                  selected={
                    paymentMethod === "razorpay"
                  }
                  onSelect={() =>
                    setPaymentMethod("razorpay")
                  }
                  icon={
                    <CreditCard className="h-5 w-5" />
                  }
                  title="Pay Online with Razorpay"
                  description="UPI, cards, net banking & wallets"
                />}
              </div>
            </section>
          </div>

          {/* ===================================
              RIGHT
          ==================================== */}

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="space-y-5">
              {/* =================================
                  ORDER ITEMS
              ================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Your Order
                  </h2>

                  <Link
                    href="/cart"
                    className="text-xs font-medium text-[#9b5c5c] hover:underline"
                  >
                    Edit Cart
                  </Link>
                </div>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div
                      key={cartLineKey(item)}
                      className="flex gap-3 p-4"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {item.category}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* =================================
                  COUPON
              ================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900">
                  Have a coupon?
                </h2>

                <p role="alert" className="text-xs text-red-700">{priceError}</p><OfferSelector items={cart} offers={productOffers} loading={offersLoading} error={offersError} subtotal={subtotal} code={couponApplied ? coupon : ""} onChange={code => { setCoupon(code); setCouponApplied(Boolean(code)); localStorage.setItem("tantuka-offer", code); }} />
                {couponApplied && discount > 0 ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />

                      <div>
                        <p className="text-xs font-semibold text-green-700">
                          {coupon} applied
                        </p>

                        <p className="mt-0.5 text-[10px] text-green-600">
                          ₹{discount.toLocaleString("en-IN")} discount
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) =>
                        setCoupon(
                          e.target.value
                        )
                      }
                      placeholder="Enter coupon code"
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-[#c99568] focus:ring-2 focus:ring-[#c99568]/10"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!coupon.trim()}
                      className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <p className="mt-2 text-[10px] text-gray-400">
                  Choose an available offer above. One code per order.
                </p>
              </section>

              {/* =================================
                  PRICE SUMMARY
              ================================== */}

              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900">
                  Price Details
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <PriceRow
                    label={`Subtotal (${cart.length} items)`}
                    value={`₹${subtotal.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <PriceRow
                    label="Delivery"
                    value={
                      shipping === 0
                        ? "FREE"
                        : `₹${shipping}`
                    }
                    valueClass={
                      shipping === 0
                        ? "text-green-600"
                        : ""
                    }
                  />

                  {discount > 0 && (
                    <PriceRow
                      label="Coupon Discount"
                      value={`-₹${discount.toLocaleString(
                        "en-IN"
                      )}`}
                      valueClass="text-green-600"
                    />
                  )}
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      Total Amount
                    </span>

                    <span className="text-xl font-semibold text-gray-900">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>

                {/* Place Order */}

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={
                    !checkoutReady ||
                    placingOrder ||
                    !currentAddress
                  }
                  className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#9b5c5c] px-5 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-[#874e4e] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      PLACING ORDER...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "razorpay" ? "PAY WITH RAZORPAY" : "PLACE COD ORDER"}
                      <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                    </>
                  )}
                </button>

                {checkoutMessage && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700" role="alert">
                    {checkoutMessage}
                  </p>
                )}

                {/* Security */}

                <div className="mt-4 flex items-start gap-2 text-[10px] leading-4 text-gray-400">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                  <span>
                    Your order and payment information
                    are protected with secure
                    encryption.
                  </span>
                </div>
              </section>

              {/* Free Shipping Message */}

              {subtotal < 999 && (
                <div className="rounded-xl border border-[#ead8c8] bg-[#fffaf7] px-4 py-3 text-center text-xs text-[#9b5c5c]">
                  Add ₹
                  {(999 - subtotal).toLocaleString(
                    "en-IN"
                  )}{" "}
                  more to get FREE delivery.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ========================================= */
/* PAYMENT OPTION */
/* ========================================= */

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#c99568] bg-[#fffaf7]"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Radio */}

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-[#9b5c5c]"
            : "border-gray-300"
        }`}
      >
        {selected && (
          <div className="h-2.5 w-2.5 rounded-full bg-[#9b5c5c]" />
        )}
      </div>

      {/* Icon */}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-[#b56f6f]/10 text-[#9b5c5c]"
            : "bg-gray-50 text-gray-500"
        }`}
      >
        {icon}
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          {description}
        </p>
      </div>

      {/* Selected */}

      {selected && (
        <Check className="h-4 w-4 shrink-0 text-[#9b5c5c]" />
      )}
    </button>
  );
}

/* ========================================= */
/* PRICE ROW */
/* ========================================= */

function PriceRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-500">
        {label}
      </span>

      <span
        className={`font-medium text-gray-900 ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
