"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { useOffers } from "@/lib/use-offers";
import { offerTerms, offerTitle } from "@/lib/product-offers";

// Campaign heading copy can be enabled later without removing the offer cards.
const SHOW_DEAL_TEXT = false;

export default function OffersPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f7f7f7]">
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
    <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
      {SHOW_DEAL_TEXT && <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#b77e00]">Deals</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">Offers &amp; Discounts</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#666]">Use one active offer per order. Choose an offer and continue shopping to apply it in your cart.</p></div>}
      {loading && <p className="mt-10 text-sm text-[#666]">Loading offers…</p>}
      {error && <p role="alert" className="mt-10 text-sm text-red-700">{error}</p>}
      {!loading && !error && !offers.length && (
        <div className="mt-10 rounded-xl border border-dashed border-[#ddd] bg-white p-10 text-center">
          <Tag className="mx-auto h-8 w-8 text-[#b77e00]" />
          <p className="mt-3 font-bold text-[#111]">No active offers right now.</p>
          <p className="mt-1 text-sm text-[#666]">Please check back soon for new deals.</p>
        </div>
      )}
      <section className={`${SHOW_DEAL_TEXT ? "mt-8" : "mt-0"} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        {offers.map((offer, index) => (
          <article key={offer.code} className="relative isolate overflow-hidden rounded-xl border border-white/60 p-5 shadow-lg">
            <Image
              src={index % 2 ? "/uploads/banners/offer-saree-editorial.png" : "/uploads/banners/offer-nightwear-editorial.png"}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="-z-20 object-cover object-center"
            />
            <div className="absolute inset-0 -z-10 bg-black/55" />
            <span className="inline-flex rounded bg-[#fbb606] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#111]">{offerTitle(offer)}</span>
            <h2 className="mt-4 text-xl font-extrabold text-white">{offer.code}</h2>
            {offer.description && <p className="mt-2 text-sm text-white/90">{offer.description}</p>}
            <p className="mt-3 text-xs leading-5 text-white/75">{offerTerms(offer)}</p>
            <Link href="/shop" onClick={() => saveOffer(offer.code)} className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-bold text-[#111] hover:bg-[#fbb606]">Use this offer</Link>
          </article>
        ))}
      </section>
    </div>
  );
}
