"use client";
import { useOffers } from "@/lib/use-offers";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { offerDiscount, offerTitle, offerTerms } from "@/lib/product-offers";

const money = (amount: number) => "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
export default function ProductOffers({ price, productId, quantity, alwaysExpanded = false }: { price: number; productId: number; quantity: number; alwaysExpanded?: boolean }) {
  const { offers: allOffers, loading: offersLoading, error: offersError } = useOffers();
  const productOffers = allOffers.filter(offer => !offer.rules?.productIds.length || offer.rules.productIds.includes(productId));
  const items = [{ id: productId, price, quantity }];
  const track = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const best = Math.max(...productOffers.map(offer => offerDiscount(offer.code, price * quantity, productOffers, items)));
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); setMessage(code + " copied. Apply it at checkout."); }
    catch { setMessage("Use code " + code + " at checkout."); }
  }

  return <section aria-label="Offers and discounts" className="mt-6 min-w-0 border-b border-gray-200 pb-5">
    <div className="flex items-center justify-between gap-2">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Tag className="h-4 w-4 shrink-0 text-amber-600" />All available offers &amp; conditions</h2>
      {!alwaysExpanded && <button type="button" aria-expanded={expanded} aria-controls="product-offers" onClick={() => setExpanded(!expanded)} className="min-h-11 shrink-0 text-xs font-semibold text-[#9F5E5E]">{expanded ? "Show less" : "View all " + productOffers.length}</button>}
    </div>
    {(offersLoading || offersError || !productOffers.length) && <p role="status" className="py-3 text-xs text-[#8A7777]">{offersLoading ? "Loading offers…" : offersError || "No active offers for this product right now."}</p>}
    <div ref={track} id="product-offers" tabIndex={0} aria-label="Available offers, scroll for more" className={expanded ? "grid gap-3" : "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]"}>
      {productOffers.map(offer => {
        const saving = offerDiscount(offer.code, price * quantity, productOffers, items);
        return <button type="button" key={offer.code} onClick={() => copy(offer.code)} aria-label={"Copy offer code " + offer.code} className="flex w-full min-w-0 shrink-0 snap-start items-stretch rounded-xl border border-[#E8DADA] bg-[#FFFDFC] text-left shadow-sm transition hover:border-[#B56F6F] focus-visible:outline-2 focus-visible:outline-[#B56F6F] disabled:opacity-50" style={expanded ? undefined : { width: "min(290px, 92%)" }}>
          <span className="flex w-[92px] shrink-0 flex-col items-center justify-center border-r border-dashed border-[#E8DADA] bg-[#F8EFEC]/60 p-2 text-center">
            <span className="mb-1 rounded bg-[#B56F6F] px-1.5 py-0.5 text-[9px] font-semibold text-white">{saving > 0 && saving === best ? "Best total" : saving > 0 ? "Offer total" : "Offer"}</span>
            <span className="text-sm font-bold text-[#4F4444]">{saving > 0 ? money(price * quantity - saving) : offerTitle(offer)}</span>
          </span>
          <span className="min-w-0 p-3"><span className="block break-all text-xs font-semibold tracking-[0.08em] text-[#4F4444]">{offer.code}</span><span className="mt-1 block text-[11px] leading-4 text-[#8A7777]">{offerTerms(offer)}</span><span className="mt-1 block text-[10px] font-medium text-[#9F5E5E]">Tap to copy code</span></span>
        </button>;
      })}
    </div>
    {!expanded && productOffers.length > 0 && <div className="flex items-center justify-between gap-2 pt-1"><span className="text-[10px] text-[#8A7777]">One code per order · Shipping extra</span><div className="flex gap-1"><button type="button" aria-label="Previous offers" onClick={() => track.current?.scrollBy({ left: -290, behavior: "smooth" })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F1E4DE]"><ChevronLeft size={16} /></button><button type="button" aria-label="Next offers" onClick={() => track.current?.scrollBy({ left: 290, behavior: "smooth" })} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F1E4DE]"><ChevronRight size={16} /></button></div></div>}
    {expanded && <p className="mt-3 text-[10px] text-[#8A7777]">One code per order. Minimum spend is based on the product subtotal. Shipping extra.</p>}
    <p role="status" className="text-xs text-[#9F5E5E]">{message}</p>
  </section>;
}
