"use client";
import Link from "next/link";
import { BadgePercent } from "lucide-react";
import { useOffers } from "@/lib/use-offers";
import { offerCardPreview } from "@/lib/offer-card";
import { offerTerms } from "@/lib/product-offers";

export default function ProductOfferBadges({ id, price, inStock = true }: { id: number | string; price: string; inStock?: boolean }) {
  const { offers } = useOffers();
  if (!inStock) return null;
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  const candidates = offers.map(offer => ({ offer, preview: offerCardPreview(offer, Number(id), amount) })).filter(row => row.preview && row.offer.rules?.showOnCards !== false).sort((a,b) => (b.offer.rules?.priority ?? 0) - (a.offer.rules?.priority ?? 0) || (a.preview!.unit ?? Infinity) - (b.preview!.unit ?? Infinity));
  const best = candidates[0];
  if (!best?.preview) return null;
  const { offer, preview } = best;
  return <Link href={`/offer/${encodeURIComponent(offer.code)}`} title={offerTerms(offer)} className="mt-2 block text-left leading-5" aria-label={`${preview.label}. ${offerTerms(offer)}`}>
    {preview.unit !== null && <span className="inline-block rounded-md border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[11px] text-purple-800">{preview.quantity === 1 ? "Get it for " : "As low as "}<b>₹{preview.unit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</b>{preview.quantity! > 1 && <span> each · buy {preview.quantity}</span>}</span>}
    <span className="mt-1 flex items-start gap-1 text-[11px] font-semibold text-green-700"><BadgePercent className="mt-0.5 h-3.5 w-3.5 shrink-0" />{preview.label}</span>
    <span className="block text-[10px] text-gray-500">Code {offer.code} · View conditions</span>
  </Link>;
}
