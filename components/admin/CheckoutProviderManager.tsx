"use client";

import { useEffect, useState } from "react";
import type { CheckoutProvider } from "@/lib/checkout-provider-settings";

export default function CheckoutProviderManager() {
  const [provider, setProvider] = useState<CheckoutProvider>("native");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/admin/checkout-provider", { cache: "no-store" })
      .then(async response => {
        const body = await response.json() as { data?: { provider?: CheckoutProvider }; message?: string };
        if (!response.ok) throw new Error(body.message || "Checkout provider could not be loaded.");
        if (body.data?.provider) setProvider(body.data.provider);
      })
      .catch(error => setMessage(error instanceof Error ? error.message : "Checkout provider could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/checkout-provider", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider }) });
      const body = await response.json() as { data?: { provider?: CheckoutProvider }; message?: string };
      if (!response.ok) throw new Error(body.message || "Checkout provider could not be saved.");
      if (body.data?.provider) setProvider(body.data.provider);
      setMessage(provider === "native" ? "Native checkout is selected." : "Shiprocket Checkout is selected. Complete Shiprocket headless-checkout onboarding before activating it for shoppers.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout provider could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mt-6 rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
    <div className="border-b border-[#eee6e1] px-5 py-5 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#a87567]">Checkout routing</p><h2 className="mt-1 text-xl font-semibold text-[#292321]">Choose checkout system</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#756b66]">Keep Vayziq&apos;s native checkout available, or prepare the store for Shiprocket Checkout. Only one system will be active for shoppers.</p></div>
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <label className={`cursor-pointer rounded-xl border p-4 ${provider === "native" ? "border-[#292321] bg-[#faf8f6]" : "border-[#e5ddd8]"}`}><input className="sr-only" type="radio" name="checkout-provider" value="native" checked={provider === "native"} disabled={loading || saving} onChange={() => setProvider("native")} /><span className="block text-sm font-semibold text-[#292321]">Vayziq native checkout</span><span className="mt-2 block text-xs leading-5 text-[#756b66]">Existing address, COD, Razorpay and Cashfree flow. This is the default and remains available.</span></label>
      <label className={`cursor-pointer rounded-xl border p-4 ${provider === "shiprocket" ? "border-[#292321] bg-[#faf8f6]" : "border-[#e5ddd8]"}`}><input className="sr-only" type="radio" name="checkout-provider" value="shiprocket" checked={provider === "shiprocket"} disabled={loading || saving} onChange={() => setProvider("shiprocket")} /><span className="block text-sm font-semibold text-[#292321]">Shiprocket Checkout</span><span className="mt-2 block text-xs leading-5 text-[#756b66]">Shiprocket&apos;s OTP, saved-address, delivery and payment flow. It needs approved Headless Checkout credentials before customer activation.</span></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6e1] px-5 py-4 sm:px-6"><p className="text-xs text-[#756b66]">Shiprocket API shipping credentials alone do not activate their hosted checkout.</p><button type="button" onClick={() => void save()} disabled={loading || saving} className="rounded-lg bg-[#292321] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Save checkout system"}</button></div>
    {message && <p role="status" className="mx-5 mb-5 rounded-lg border border-[#e7d3cb] bg-[#fff8f5] px-4 py-3 text-sm text-[#7d5e57] sm:mx-6 sm:mb-6">{message}</p>}
  </section>;
}
