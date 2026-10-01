"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Tag, TicketPercent } from "lucide-react";
import { useOffers } from "@/lib/use-offers";
import { offerTerms, offerTitle } from "@/lib/product-offers";

// Campaign heading copy can be enabled later without removing the offer cards.
const SHOW_DEAL_TEXT = false;

export default function OffersPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#fffdf7]">
      <DealContent />
    </main>
  );
}

function DealContent() {
  const { offers, loading, error } = useOffers();

  function saveOffer(code: string) {
    localStorage.setItem("tantuka-offer", code);
  }

  return (
    <div className="relative z-10 mx-auto max-w-[1440px] bg-[linear-gradient(135deg,#fffdf7_0%,#fff6df_48%,#fffdf7_100%)] px-4 pb-8 pt-4 sm:px-6 sm:py-10 lg:px-8">
      {SHOW_DEAL_TEXT && <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#b77e00]">Deals</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">Offers &amp; Discounts</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#666]">Use one active offer per order. Choose an offer and continue shopping to apply it in your cart.</p></div>}
      <section className="relative mb-7 min-h-[210px] overflow-hidden border-2 border-[#181411] bg-[#211d19] p-5 text-white shadow-[5px_5px_0_#fbb606] sm:min-h-[260px] sm:p-8">
        <Image src="/uploads/banners/offer-saree-editorial.png" alt="Seasonal VAYZIQ offers" fill priority sizes="(max-width: 1440px) 100vw, 1440px" className="object-cover object-center opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
        <div className="relative z-10 max-w-xl"><p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#fbb606]">VAYZIQ offer edit</p><h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-5xl">More looks. More value.</h1><p className="mt-3 max-w-md text-sm leading-6 text-white/85">Explore limited-time savings, bundle pricing and buy-more offers. Apply one code at checkout.</p><Link href="/shop" className="mt-5 inline-flex min-h-10 items-center gap-2 border-2 border-[#fbb606] bg-[#fbb606] px-4 text-xs font-extrabold uppercase tracking-[.08em] text-[#111] transition hover:bg-white">Shop offers <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
      <div className="mb-5 flex items-center gap-3 sm:mb-7"><span className="h-px flex-1 bg-[#d8cba9]" /><h1 className="shrink-0 text-lg font-black tracking-[-.04em] text-[#211d19] sm:text-2xl">Exclusive savings</h1><span className="h-px flex-1 bg-[#d8cba9]" /></div>
      {loading && <p className="mt-10 text-sm text-[#666]">Loading offers…</p>}
      {error && <p role="alert" className="mt-10 text-sm text-red-700">{error}</p>}
      {!loading && !error && !offers.length && (
        <div className="mt-10 rounded-xl border border-dashed border-[#ddd] bg-white p-10 text-center">
          <Tag className="mx-auto h-8 w-8 text-[#b77e00]" />
          <p className="mt-3 font-bold text-[#111]">No active offers right now.</p>
          <p className="mt-1 text-sm text-[#666]">Please check back soon for new deals.</p>
        </div>
      )}
      <section className={`${SHOW_DEAL_TEXT ? "mt-8" : "mt-0"} -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3`}>
        {offers.map((offer, index) => (
          <article key={offer.code} className="group relative isolate flex min-h-[350px] min-w-[242px] snap-center flex-col overflow-hidden rounded-none border-[3px] border-[#181411] p-3 shadow-[5px_5px_0_#181411] transition duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#fbb606] sm:min-w-0 sm:p-4">
            <Image
              src={index % 2 ? "/uploads/banners/offer-saree-editorial.png" : "/uploads/banners/offer-nightwear-editorial.png"}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="-z-20 object-cover object-center transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 bg-[#fbb606] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[.08em] text-[#111]"><TicketPercent className="h-3.5 w-3.5" />{offerTitle(offer)}</span>
              <span className="grid h-8 w-8 place-items-center border border-white/40 bg-black/20 text-white backdrop-blur-sm"><Tag className="h-4 w-4" /></span>
            </div>
            <div className="mt-auto">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/70">Exclusive code</p>
              <h2 className="mt-1 break-words bg-white px-2 py-1 text-xl font-black tracking-[-.04em] text-[#111]">{offer.code}</h2>
              {offer.description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/90">{offer.description}</p>}
              <div className="mt-4 border-t border-white/25 pt-3"><p className="flex gap-2 text-xs leading-5 text-white/75"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#fbb606]" />{offerTerms(offer)}</p></div>
              <Link href="/shop" onClick={() => saveOffer(offer.code)} className="mt-4 flex min-h-10 items-center justify-center gap-2 border-2 border-[#111] bg-[#fbb606] px-4 text-sm font-black uppercase tracking-[.04em] text-[#111] transition hover:bg-white">Use this offer <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
