"use client";
import { useRef, useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { offerDiscount, offerTitle, offerTerms, offerRequirement, type OfferItem, type ProductOffer } from "@/lib/product-offers";

const money = (value: number) => "₹" + value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function OfferSelector({ subtotal, code, onChange, items, offers: productOffers, loading = false, error: loadError = "" }: { items: OfferItem[]; subtotal: number; code: string; onChange: (code: string) => void; offers: ProductOffer[]; loading?: boolean; error?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const saving = offerDiscount(code, subtotal, productOffers, items);
  function open() {
    setSelected(saving ? code : "");
    setInput("");
    setError("");
    const offerList = dialog.current?.querySelector("fieldset");
    if (offerList) offerList.scrollTop = 0;
    dialog.current?.showModal();
  }
  function check() {
    const normalized = input.trim().toUpperCase();
    const offer = productOffers.find(item => item.code === normalized);
    if (!offer || !offerDiscount(normalized, subtotal, productOffers, items)) { setError(offer ? offerRequirement(offer, subtotal, items) : "Offer code not found."); return; }
    setSelected(normalized); setError("");
  }



  return <div className="my-4">
    {(loading || loadError || !productOffers.length) && <p role="status" className="mb-2 text-xs text-[#8A7777]">{loading ? "Loading offers…" : loadError || "No active offers right now."}</p>}
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[#E8DADA] bg-[#FAF5F2] px-4 py-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#4F4444]"><Tag size={16} />Offers &amp; Discounts</span><button type="button" onClick={open} className="min-h-11 text-xs font-semibold text-[#9F5E5E]">{saving ? "Change offer" : "View all offers"}</button></div>
    {saving > 0 && <div role="status" className="mt-3 rounded-xl border border-[#DECACA] bg-[#FFFDFC] p-4"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold text-[#9F5E5E]"><Check size={16} />Offer applied</span><button type="button" onClick={() => onChange("")} className="min-h-9 text-xs text-[#8A7777] underline">Remove</button></div><p className="mt-1 break-all text-sm font-semibold text-[#4F4444]">{code}</p><p className="mt-1 text-xs text-[#8A7777]">{productOffers.find(offer => offer.code === code) ? offerTitle(productOffers.find(offer => offer.code === code)!) : ""}</p><p className="mt-3 text-sm font-semibold text-[#9F5E5E]">You saved {money(saving)}</p></div>}
    {code && !saving && !loading && !loadError && <p role="status" className="mt-2 text-xs text-amber-800">Your cart no longer qualifies for {code}. Choose another offer.</p>}
    <dialog ref={dialog} aria-label="Offers and discounts" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-2xl border border-[#E8DADA] bg-[#FFFDFC] p-0 text-[#2b2525] shadow-2xl backdrop:bg-[#2B2525]/50 backdrop:backdrop-blur-sm">
      <div className="flex max-h-[85dvh] flex-col">
        <div className="shrink-0 border-b border-[#E8DADA] bg-[#FAF5F2] p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Offers &amp; Discounts</h2><button type="button" onClick={() => dialog.current?.close()} aria-label="Close offers" className="flex h-10 w-10 items-center justify-center rounded-full text-[#8A7777] hover:bg-[#F1E4DE]"><X size={20} /></button></div><form className="mt-3 flex gap-2" onSubmit={event => { event.preventDefault(); check(); }}><input aria-label="Offer code" value={input} onChange={event => setInput(event.target.value)} placeholder="Enter offer code" className="h-11 min-w-0 flex-1 rounded-lg border border-[#E8DADA] bg-white px-3 text-sm outline-none focus:border-[#B56F6F] focus:ring-2 focus:ring-[#B56F6F]/10" /><button disabled={!input.trim()} className="rounded-lg border border-[#B56F6F] px-4 text-sm text-[#975858] disabled:opacity-40">Check</button></form><p role="status" className="mt-2 text-xs text-rose-700">{error}</p></div>
        <fieldset className="min-h-0 overflow-y-auto space-y-3 p-5 [scrollbar-width:thin]"><legend className="sr-only">Choose one offer</legend>{productOffers.map(offer => {
          const amount = offerDiscount(offer.code, subtotal, productOffers, items);
          return <label key={offer.code} className={"flex gap-3 rounded-xl border p-4 transition " + (selected === offer.code && amount ? "border-[#B56F6F] bg-[#F8EFEC] shadow-sm" : amount ? "cursor-pointer border-[#E8DADA] bg-white hover:border-[#C79B91]" : "cursor-not-allowed border-[#EEE7E3] bg-[#FAF8F6] text-[#9A8888]")}><input type="radio" name="cart-offer" value={offer.code} checked={selected === offer.code} disabled={!amount} onChange={() => { setSelected(offer.code); setError(""); }} className="mt-1 h-4 w-4 shrink-0 accent-[#B56F6F]" /><span className="min-w-0"><span className="block text-sm font-semibold">{amount ? "Save " + money(amount) : offerTitle(offer)} · {offer.code}</span><span className="mt-1 block text-xs leading-5">{offerTerms(offer)}</span>{!amount && <span className="mt-1 block text-xs text-[#975858]">{offerRequirement(offer, subtotal, items)}</span>}</span></label>;
        })}</fieldset>
        <div className="shrink-0 border-t border-[#E8DADA] bg-[#FAF5F2] p-5"><p className="mb-3 text-xs text-gray-500">One offer per order. Shipping is calculated separately.</p><button type="button" disabled={!offerDiscount(selected, subtotal, productOffers, items)} onClick={() => { onChange(selected); dialog.current?.close(); }} className="h-12 w-full rounded-xl bg-[#B56F6F] text-xs font-semibold tracking-[0.08em] text-white transition hover:bg-[#9F5E5E] disabled:cursor-not-allowed disabled:opacity-40">{selected && offerDiscount(selected, subtotal, productOffers, items) ? "Apply & save " + money(offerDiscount(selected, subtotal, productOffers, items)) : "Select an offer"}</button></div>
      </div>
    </dialog>
  </div>;
}
