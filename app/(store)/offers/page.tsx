"use client";

import Link from "next/link";
import { ArrowRight, Check, Gift, ShoppingBag, Sparkles, Tag, TicketPercent } from "lucide-react";
import { useOffers } from "@/lib/use-offers";
import { offerTerms, offerTitle, type ProductOffer } from "@/lib/product-offers";
import styles from "./OffersPage.module.css";

type DealTheme = { label: string; icon: typeof Gift };

function themeFor(offer: ProductOffer): DealTheme {
  if (offer.type === "buy_get") return { label: "Buy & get", icon: Gift };
  if (offer.type === "quantity_price") return { label: "Bundle price", icon: ShoppingBag };
  if (offer.type === "quantity_discount") return { label: "More in bag", icon: Sparkles };
  if (offer.type === "percentage") return { label: "Limited saving", icon: TicketPercent };
  return { label: "Cart reward", icon: Tag };
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
      <section className={styles.offerGrid}>
        {offers.map(offer => { const theme = themeFor(offer); const Icon = theme.icon; return <article key={offer.code} className={styles.offerCard}><div className={styles.cardTop}><span className={styles.cardAccent} /><Icon className={styles.cardIcon} aria-hidden="true" /><span className={styles.offerType}>{theme.label}</span><p className={styles.offerTitle}>{offerTitle(offer)}</p><h3 className={styles.offerCode}>{offer.code}</h3></div><div className={styles.cardBody}><p className={`${styles.description} line-clamp-2`}>{offer.description}</p><div className={styles.terms}><p className="line-clamp-3 flex gap-2"><Check className={styles.check} />{offerTerms(offer)}</p></div><Link href={offerShopHref(offer)} onClick={() => saveOffer(offer.code)} className={styles.offerAction}>Use this offer <ArrowRight className="h-3.5 w-3.5" /></Link></div></article>; })}
      </section>
    </div>
  </main>;
}
