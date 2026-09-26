"use client";
import { StoreName } from "@/components/StoreBranding";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
export type BannerSlide = {
  title: string;
  image?: string;
  link: string | null;
  subtitle?: string | null;
  overlayText?: boolean;
  promo?: { eyebrow: string; headline: string; detail: string; code?: string; theme: "rose" | "dark" };
};
export default function BannerSlider({ slides, label, hero = false, category = false }: { slides: BannerSlide[]; label: string; hero?: boolean; category?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [start, setStart] = useState<number | null>(null);
  const active = index % Math.max(1, slides.length);
  useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const sync = () => setReduced(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  useEffect(() => { if (paused || hover || reduced || slides.length < 2) return; const timer = window.setInterval(() => setIndex(value => (value + 1) % slides.length), 3500); return () => window.clearInterval(timer); }, [paused, hover, reduced, slides.length]);
  if (!slides.length) return null;
  const go = (delta: number) => setIndex((active + delta + slides.length) % slides.length);
  return <section aria-label={label} aria-roledescription="carousel" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocusCapture={() => setHover(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHover(false); }} onTouchStart={event => setStart(event.touches[0].clientX)} onTouchEnd={event => { if (start !== null) { const delta = event.changedTouches[0].clientX - start; if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1); } setStart(null); }} className={"relative overflow-hidden bg-[#F8EFEC] " + (hero ? "h-[300px] sm:h-[440px] lg:h-[570px]" : category ? "h-[220px] w-full sm:h-[310px] lg:h-[390px]" : "h-[190px] sm:h-[260px] lg:h-[320px]")}>
    {slides.map((slide,i) => <div key={`${slide.image ?? slide.title}-${i}`} hidden={active !== i} aria-label={`${i + 1} of ${slides.length}`} aria-roledescription="slide" className="absolute inset-0">{slide.link ? <Link href={slide.link} aria-label={slide.title || "View collection"} className="block h-full focus-visible:outline-4 focus-visible:outline-[#B56F6F]"><SlideContent slide={slide} priority={i === 0} category={category} /></Link> : <SlideContent slide={slide} priority={i === 0} category={category} />}</div>)}
    {slides.length > 1 && <><button aria-label="Previous slide" type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#4F4444] shadow"><ChevronLeft size={20} /></button><button aria-label="Next slide" type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#4F4444] shadow"><ChevronRight size={20} /></button><div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center rounded-full bg-white/90 px-2 shadow opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100">{slides.map((_,i) => <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} aria-current={active === i ? "true" : undefined} onClick={() => setIndex(i)} className="grid h-10 w-8 place-items-center"><span className={"h-1.5 rounded-full " + (active === i ? "w-5 bg-[#B56F6F]" : "w-1.5 bg-[#D4C1BB]")} /></button>)}{!reduced && <button type="button" aria-label={paused ? "Play slides" : "Pause slides"} onClick={() => setPaused(!paused)} className="grid h-10 w-9 place-items-center">{paused ? <Play size={14} /> : <Pause size={14} />}</button>}</div></>}
  </section>;
}
function SlideContent({ slide, priority, category = false }: { slide: BannerSlide; priority: boolean; category?: boolean }) {
  if (slide.promo) {
    const dark = slide.promo.theme === "dark";
    return <div className={`relative flex h-full items-center overflow-hidden px-8 sm:px-16 lg:px-24 ${dark ? "bg-[#302525] text-white" : "bg-[#F5E7E2] text-[#332828]"}`}>
      <div aria-hidden="true" className={`absolute -right-12 top-1/2 aspect-square w-56 -translate-y-1/2 rounded-full border sm:-right-4 sm:w-80 ${dark ? "border-white/10" : "border-[#B56F6F]/15"}`} />
      <div aria-hidden="true" className={`absolute -right-2 top-1/2 aspect-square w-40 -translate-y-1/2 rounded-full border sm:right-12 sm:w-60 ${dark ? "border-white/10" : "border-[#B56F6F]/15"}`} />
      <div className="relative max-w-xl">
        <p className={`text-[9px] font-semibold tracking-[0.24em] sm:text-[11px] ${dark ? "text-[#E6B4AA]" : "text-[#9F5E5E]"}`}>{slide.promo.eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-5xl lg:text-6xl">{slide.promo.headline}</h2>
        <p className={`mt-2 max-w-md text-xs sm:mt-3 sm:text-sm ${dark ? "text-white/70" : "text-[#725F5B]"}`}>{slide.promo.detail}</p>
        <span className={`mt-5 inline-flex min-h-10 items-center gap-2 border px-4 text-[9px] font-semibold tracking-[0.17em] sm:mt-7 sm:min-h-11 sm:px-5 sm:text-[10px] ${dark ? "border-white/40 text-white" : "border-[#B56F6F]/40 text-[#754646]"}`}>{slide.promo.code ? <>USE CODE <span className="font-bold">{slide.promo.code}</span></> : "EXPLORE COLLECTION"}</span>
      </div>
      <span className={`absolute bottom-5 right-7 hidden text-[9px] tracking-[0.18em] sm:block ${dark ? "text-white/50" : "text-[#8A7777]"}`}>SHOP THE COLLECTION ↗</span>
    </div>;
  }
  return slide.image ? (
    <div className="relative h-full w-full overflow-hidden bg-[#F8EFEC]">
      <ProgressiveImage src={slide.image} alt={slide.title || "Collection banner"} loading={priority ? "eager" : "lazy"} className="h-full w-full object-cover object-center" />
      {category && slide.overlayText && (
        <>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#FFFDFC]/95 via-[#FFFDFC]/78 to-transparent sm:via-[#FFFDFC]/66" />
          <div className="absolute inset-y-0 left-0 flex w-[78%] items-center px-5 sm:w-[66%] sm:px-10 lg:w-[58%] lg:px-14">
            <div className="max-w-xl">
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9F5E5E] sm:text-[10px]">The <StoreName /> edit</p>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-[#332828] sm:mt-3 sm:text-4xl lg:text-5xl">{slide.title}</h2>
              {slide.subtitle && <p className="mt-2 max-w-md text-[11px] leading-5 text-[#6F5C58] sm:mt-3 sm:text-sm sm:leading-6">{slide.subtitle}</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8B5050] sm:mt-5 sm:text-[10px]">Explore collection <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </div>
          </div>
        </>
      )}
    </div>
  ) : null;
}
