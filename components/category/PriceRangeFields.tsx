"use client";

import { useId, useState } from "react";

export default function PriceRangeFields({ min, max, maxLimit, onChange }: {
  min: number; max: number; maxLimit?: number; onChange: (min: number, max: number) => void;
}) {
  const id = useId();
  const ceiling = Math.max(1, maxLimit ?? max);
  const lower = Math.min(min, ceiling);
  const upper = Math.max(lower, Math.min(max, ceiling));
  const [active, setActive] = useState<"min" | "max" | null>(null);
  const minPercent = lower / ceiling * 100;
  const maxPercent = upper / ceiling * 100;
  return <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2 text-[11px]">
      <label htmlFor={`${id}-min`} className="flex items-center justify-between rounded-md border border-[#E8DADA] bg-white px-2.5 py-2 text-[#756565]">
        <span className="font-medium uppercase tracking-[0.08em]">Min</span>
        <span className="font-semibold tabular-nums text-[#3B3333]">₹{lower.toLocaleString("en-IN")}</span>
      </label>
      <label htmlFor={`${id}-max`} className="flex items-center justify-between rounded-md border border-[#E8DADA] bg-white px-2.5 py-2 text-[#756565]">
        <span className="font-medium uppercase tracking-[0.08em]">Max</span>
        <span className="font-semibold tabular-nums text-[#3B3333]">₹{upper.toLocaleString("en-IN")}</span>
      </label>
    </div>
    <div className="relative h-8 touch-none">
      <div aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#E8DADA]" />
      <div aria-hidden="true" className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#B56F6F]" style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }} />
      <input id={`${id}-min`} type="range" min={0} max={ceiling} step={1} value={lower}
        onPointerDown={() => setActive("min")} onPointerUp={() => setActive(null)} onBlur={() => setActive(null)}
        onChange={event => onChange(Math.min(Number(event.target.value), max), max)} aria-label="Minimum price"
        className="price-range-thumb" style={{ zIndex: active === "min" ? 5 : active === "max" ? 3 : lower > ceiling * 0.8 ? 4 : 3 }} />
      <input id={`${id}-max`} type="range" min={0} max={ceiling} step={1} value={upper}
        onPointerDown={() => setActive("max")} onPointerUp={() => setActive(null)} onBlur={() => setActive(null)}
        onChange={event => onChange(min, Math.max(Number(event.target.value), min))} aria-label="Maximum price"
        className="price-range-thumb" style={{ zIndex: active === "max" ? 5 : active === "min" ? 3 : lower > ceiling * 0.8 ? 3 : 4 }} />
    </div>
    <style jsx>{`
      .price-range-thumb { appearance: none; -webkit-appearance: none; position: absolute; inset: 0; width: 100%; height: 32px; margin: 0; background: transparent; pointer-events: none; }
      .price-range-thumb::-webkit-slider-runnable-track { height: 4px; background: transparent; }
      .price-range-thumb::-moz-range-track { height: 4px; background: transparent; }
      .price-range-thumb::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; width: 18px; height: 18px; margin-top: -7px; border: 2px solid #fffdfc; border-radius: 50%; background: #B56F6F; box-shadow: 0 1px 4px #4F444455; pointer-events: auto; cursor: grab; }
      .price-range-thumb:active::-webkit-slider-thumb { cursor: grabbing; }
      .price-range-thumb::-moz-range-thumb { width: 14px; height: 14px; border: 2px solid #fffdfc; border-radius: 50%; background: #B56F6F; box-shadow: 0 1px 4px #4F444455; pointer-events: auto; cursor: grab; }
      .price-range-thumb:focus-visible::-webkit-slider-thumb, .price-range-thumb:focus-visible::-moz-range-thumb { outline: 2px solid #6D3939; outline-offset: 2px; }
    `}</style>
  </div>;
}
