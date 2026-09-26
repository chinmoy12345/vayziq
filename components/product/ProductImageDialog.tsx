"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ProgressiveImage from "@/components/ui/ProgressiveImage";

export default function ProductImageDialog({ images, name, active, onChange, onClose }: {
  images: string[]; name: string; active: number; onChange: (index: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const move = (direction: number) => onChange((active + direction + images.length) % images.length);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(<dialog ref={dialog} aria-label={`${name} image gallery`} onCancel={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}
    className="fixed inset-0 m-auto h-[100dvh] max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-[#2B2525] backdrop:bg-black/80 sm:h-[92dvh] sm:w-[94vw] sm:max-w-6xl">
    <div className="flex h-full flex-col overflow-hidden bg-[#FFFDFC] sm:rounded-2xl">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E8DADA] px-4 py-3 sm:px-6">
        <div className="min-w-0"><p className="text-[10px] font-semibold tracking-[0.2em] text-[#B56F6F]">A CLOSER LOOK</p><h2 className="truncate text-sm font-medium sm:text-base">{name}</h2></div>
        <button type="button" onClick={onClose} aria-label="Close gallery" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E8DADA] hover:bg-[#F8EFEC]"><X className="h-5 w-5" /></button>
      </header>
      <div className="relative min-h-0 flex-1 bg-[#F8EFEC]"
        onTouchStart={(event) => { touchStart.current = event.touches.length === 1 ? event.touches[0].clientX : null; }}
        onTouchEnd={(event) => { if (touchStart.current !== null && event.changedTouches.length) { const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 60) move(distance > 0 ? -1 : 1); } touchStart.current = null; }}>
        <ProgressiveImage src={images[active]} alt={`${name}, image ${active + 1}`} loading="eager" className="h-full w-full object-contain" />
        {images.length > 1 && <><button type="button" aria-label="Previous image" onClick={() => move(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-sm"><ChevronLeft /></button><button type="button" aria-label="Next image" onClick={() => move(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-sm"><ChevronRight /></button></>}
      </div>
      <footer className="shrink-0 border-t border-[#E8DADA] px-4 py-3">
        <p aria-live="polite" className="mb-3 text-center text-xs text-[#7A6969]">{active + 1} / {images.length}</p>
        {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-1"><div className="mx-auto flex gap-2">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => onChange(index)} aria-label={`View image ${index + 1}`} aria-current={active === index ? "true" : undefined} className={`h-16 w-12 shrink-0 overflow-hidden rounded-md border-2 ${active === index ? "border-[#B56F6F]" : "border-transparent opacity-60 hover:opacity-100"}`}><ProgressiveImage src={image} alt="" className="h-full w-full object-cover" /></button>)}</div></div>}
      </footer>
    </div>
  </dialog>, document.body);
}
