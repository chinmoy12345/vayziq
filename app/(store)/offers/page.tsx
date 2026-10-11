"use client";

import Link from "next/link";
import { ArrowRight, Check, Gift, ShoppingBag, Sparkles, Tag, TicketPercent } from "lucide-react";
import { useOffers } from "@/lib/use-offers";
import { offerTerms, offerTitle, type ProductOffer } from "@/lib/product-offers";

type DealTheme = { panel: string; soft: string; ink: string; accent: string; label: string; icon: typeof Gift };

function themeFor(offer: ProductOffer): DealTheme {
  if (offer.type === "buy_get") return { panel: "from-[#ff4a57] via-[#fa654d] to-[#ffbc43]", soft: "bg-[#fff1dd]", ink: "text-[#271312]", accent: "bg-[#271312] text-white", label: "Buy & get", icon: Gift };
  if (offer.type === "quantity_price") return { panel: "from-[#1a766d] via-[#129d88] to-[#74d8bd]", soft: "bg-[#e0f8ef]", ink: "text-[#062e29]", accent: "bg-[#062e29] text-white", label: "Bundle price", icon: ShoppingBag };
  if (offer.type === "quantity_discount") return { panel: "from-[#171717] via-[#343434] to-[#f6b800]", soft: "bg-[#fff5cf]", ink: "text-[#171717]", accent: "bg-[#f6b800] text-[#171717]", label: "More in bag", icon: Sparkles };
  if (offer.type === "percentage") return { panel: "from-[#402c92] via-[#7c3fd2] to-[#e55bb4]", soft: "bg-[#f3eaff]", ink: "text-[#24123e]", accent: "bg-[#24123e] text-white", label: "Limited saving", icon: TicketPercent };
  return { panel: "from-[#075b95] via-[#1690c6] to-[#73d7ee]", soft: "bg-[#e1f6fc]", ink: "text-[#06344f]", accent: "bg-[#06344f] text-white", label: "Cart reward", icon: Tag };
}

function saveOffer(code: string) { localStorage.setItem("tantuka-offer", code); }
function offerShopHref(offer: ProductOffer) {
  return `/offer/${encodeURIComponent(offer.code)}`;
}

export default function OffersPage() {
  const { offers, loading, error } = useOffers();

  return <main className="min-h-[calc(100vh-64px)] bg-white text-[#171312]">
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-8 sm:pt-7">
      <section className="relative min-h-[164px] overflow-hidden rounded-xl bg-[#171312] px-6 py-7 text-white shadow-[0_10px_26px_rgba(0,0,0,.08)] sm:px-10">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#fbb606] opacity-95 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[42%] h-64 w-64 rounded-full border-[28px] border-[#d65db1]/80" />
        <div className="relative z-10 max-w-2xl"><p className="text-[9px] font-extrabold uppercase tracking-[.18em] text-[#fbb606]">VAYZIQ / THE OFFER EDIT</p><h1 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">Offers that feel worth it.</h1><p className="mt-2 max-w-xl text-xs leading-5 text-white/75 sm:text-sm">Fresh price drops, bundle value and buy-get rewards—choose one offer in your cart and it is calculated before payment.</p><Link href="/shop" className="mt-4 inline-flex items-center gap-2 border-b-2 border-[#fbb606] pb-1 text-[11px] font-extrabold text-white">Explore styles <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </section>

      <div className="mt-7 flex items-end justify-between gap-4"><div><h2 className="text-[27px] font-extrabold tracking-[-1px]">Live Offer Codes</h2><p className="mt-1 text-xs leading-5 text-[#756565]">Select a code and it will be ready in your cart. Only one offer applies per order.</p></div><Link href="/shop" className="flex shrink-0 items-center gap-1 text-xs font-semibold">View All Products <ArrowRight className="h-4 w-4" /></Link></div>
      {loading && <p className="mt-10 text-center text-sm text-[#666]">Loading offers…</p>}
      {error && <p role="alert" className="mt-10 text-center text-sm text-red-700">{error}</p>}
      {!loading && !error && !offers.length && <div className="mt-10 rounded-2xl border border-dashed border-[#ddd] bg-white p-10 text-center"><Tag className="mx-auto h-8 w-8 text-[#b77e00]" /><p className="mt-3 font-bold">No active offers right now.</p><p className="mt-1 text-sm text-[#666]">Please check back soon for new deals.</p></div>}
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {offers.map(offer => { const theme = themeFor(offer); const Icon = theme.icon; return <article key={offer.code} className="group overflow-hidden rounded-xl border border-[#e6ddd5] bg-white shadow-[0_3px_12px_rgba(43,31,23,.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(43,31,23,.11)]"><div className={`relative min-h-[104px] overflow-hidden bg-gradient-to-br ${theme.panel} p-4 text-white`}><span className="absolute -right-5 -top-7 h-24 w-24 rounded-full border-[14px] border-white/20" /><Icon className="absolute bottom-[-10px] right-3 h-20 w-20 rotate-[-12deg] text-white/20" strokeWidth={1.15} /><div className="relative"><span className="inline-flex rounded-full bg-black/20 px-2 py-1 text-[8px] font-extrabold uppercase tracking-[.12em] backdrop-blur">{theme.label}</span><p className="mt-3 text-[11px] font-bold text-white/85">{offerTitle(offer)}</p><h3 className="mt-0.5 truncate text-xl font-black tracking-[-.04em]">{offer.code}</h3></div></div><div className="p-4"><p className="line-clamp-2 min-h-9 text-xs leading-[18px] text-[#514343]">{offer.description}</p><div className="mt-3 border-t border-[#eee5df] pt-2.5"><p className="line-clamp-3 flex gap-2 text-[10px] leading-4 text-[#756565]"><Check className="mt-0.5 h-3 w-3 shrink-0 text-[#b77e00]" />{offerTerms(offer)}</p></div><Link href={offerShopHref(offer)} onClick={() => saveOffer(offer.code)} className={`mt-3 flex min-h-9 items-center justify-center gap-2 rounded-lg ${theme.accent} px-3 text-[10px] font-extrabold uppercase tracking-[.06em] transition hover:brightness-110`}>Use this offer <ArrowRight className="h-3.5 w-3.5" /></Link></div></article>; })}
      </section>
    </div>
  </main>;
}
