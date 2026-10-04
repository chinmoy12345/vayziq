"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ProductCarousel.module.css";

export default function ProductCarousel({ children, label, inset = false }: { children: ReactNode; label: string; inset?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [ready, setReady] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach(child => observer.observe(child));
    element.addEventListener("scroll", update, { passive: true });
    update();
    setReady(true);
    return () => { observer.disconnect(); element.removeEventListener("scroll", update); };
  }, [children]);
  function move(direction: number) {
    const element = track.current;
    if (!element) return;
    const first = element.firstElementChild;
    const step = (first?.getBoundingClientRect().width ?? element.clientWidth) + parseFloat(getComputedStyle(element).columnGap || "0");
    const count = Math.max(1, Math.floor((element.clientWidth + 1) / step));
    element.scrollBy({ left: direction * step * count, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <section aria-label={label} aria-roledescription="carousel" className={`${styles.carousel} ${inset ? styles.inset : ""}`}>
    <div className={styles.controls} hidden={!ready || (edges.start && edges.end)}>
      {ready && <><button type="button" aria-label={`Previous ${label} products`} aria-controls={id} disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={18} /></button>
      <button type="button" aria-label={`Next ${label} products`} aria-controls={id} disabled={edges.end} onClick={() => move(1)}><ChevronRight size={18} /></button></>}
    </div>
    <div ref={track} id={id} tabIndex={0} aria-label={`${label}, scroll for more products`} className={styles.track} onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>{children}</div>
  </section>;
}
