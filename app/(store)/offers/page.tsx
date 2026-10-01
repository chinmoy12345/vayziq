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
  const ids = offer.rules?.productIds ?? [];
  return ids.length ? `/shop?products=${ids.join(",")}` : "/shop";
}

export default function OffersPage() {
  const { offers, loading, error } = useOffers();
  const spotlight = offers.slice(0, 3);

  return <main className="min-h-[calc(100vh-64px)] bg-[#fffdf9] text-[#171312]">
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 sm:pt-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#171312] px-6 py-8 text-white shadow-[0_18px_50px_rgba(31,22,17,.18)] sm:px-10 sm:py-12">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#fbb606] opacity-95 blur-3xl" />
        <div className="absolute bottom-[-100px] left-[42%] h-64 w-64 rounded-full border-[28px] border-[#d65db1]/80" />
        <div className="relative z-10 max-w-2xl"><p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-[#fbb606]">VAYZIQ value edit</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em] sm:text-6xl">Offers that feel worth it.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">Fresh price drops, bundle value and buy-get rewards—choose one offer in your cart and it is calculated before payment.</p><Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-extrabold uppercase tracking-[.08em] text-[#171312] transition hover:bg-[#fbb606]">Explore styles <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      {!loading && spotlight.length > 0 && <section className="relative z-10 -mt-3 mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
        {spotlight.map(offer => { const theme = themeFor(offer); const Icon = theme.icon; return <Link key={offer.code} href={offerShopHref(offer)} onClick={() => saveOffer(offer.code)} className={`group overflow-hidden rounded-2xl ${theme.soft} p-4 shadow-[0_8px_24px_rgba(30,20,15,.12)] transition hover:-translate-y-1`}><div className="flex items-start justify-between gap-3"><div><p className={`text-[9px] font-extrabold uppercase tracking-[.16em] ${theme.ink}`}>{theme.label}</p><p className={`mt-1 text-lg font-black tracking-[-.04em] ${theme.ink}`}>{offer.code}</p></div><span className={`grid h-9 w-9 place-items-center rounded-full ${theme.accent}`}><Icon className="h-4 w-4" /></span></div><p className={`mt-3 text-xs font-bold ${theme.ink}`}>{offerTitle(offer)}</p><span className={`mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${theme.ink}`}>Use offer <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>; })}
      </section>}

      <div className="mt-10 flex items-center gap-3"><span className="h-px flex-1 bg-[#ddd2c4]" /><h2 className="shrink-0 text-lg font-black tracking-[-.04em] sm:text-2xl">Live offer codes</h2><span className="h-px flex-1 bg-[#ddd2c4]" /></div>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-5 text-[#756565]">Select a code and it will be ready in your cart. Only one offer applies per order.</p>
      {loading && <p className="mt-10 text-center text-sm text-[#666]">Loading offers…</p>}
      {error && <p role="alert" className="mt-10 text-center text-sm text-red-700">{error}</p>}
      {!loading && !error && !offers.length && <div className="mt-10 rounded-2xl border border-dashed border-[#ddd] bg-white p-10 text-center"><Tag className="mx-auto h-8 w-8 text-[#b77e00]" /><p className="mt-3 font-bold">No active offers right now.</p><p className="mt-1 text-sm text-[#666]">Please check back soon for new deals.</p></div>}
      <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map(offer => { const theme = themeFor(offer); const Icon = theme.icon; return <article key={offer.code} className="group overflow-hidden rounded-[22px] border border-[#e6ddd5] bg-white shadow-[0_8px_22px_rgba(43,31,23,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(43,31,23,.13)]"><div className={`relative min-h-[150px] overflow-hidden bg-gradient-to-br ${theme.panel} p-5 text-white`}><span className="absolute -right-5 -top-7 h-32 w-32 rounded-full border-[18px] border-white/20" /><Icon className="absolute bottom-[-12px] right-4 h-28 w-28 rotate-[-12deg] text-white/20" strokeWidth={1.15} /><div className="relative"><span className="inline-flex rounded-full bg-black/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.15em] backdrop-blur">{theme.label}</span><p className="mt-5 text-sm font-bold text-white/85">{offerTitle(offer)}</p><h3 className="mt-1 text-3xl font-black tracking-[-.06em]">{offer.code}</h3></div></div><div className="p-5"><p className="min-h-10 text-sm leading-5 text-[#514343]">{offer.description}</p><div className="mt-4 border-t border-[#eee5df] pt-3"><p className="flex gap-2 text-xs leading-5 text-[#756565]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b77e00]" />{offerTerms(offer)}</p></div><Link href={offerShopHref(offer)} onClick={() => saveOffer(offer.code)} className={`mt-5 flex min-h-11 items-center justify-center gap-2 rounded-xl ${theme.accent} px-4 text-xs font-extrabold uppercase tracking-[.07em] transition hover:brightness-110`}>Use this offer <ArrowRight className="h-4 w-4" /></Link></div></article>; })}
      </section>
    </div>
  </main>;
}
