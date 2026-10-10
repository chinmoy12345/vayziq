"use client";

import { useEffect, useState } from "react";

export default function SaleCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Date.parse(endsAt) - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (remaining === 0) return null;

  let countdown = "--h : --m : --s";
  if (remaining !== null) {
    const total = Math.floor(remaining / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    countdown = `${days ? `${days}d : ` : ""}${String(hours).padStart(2, "0")}h : ${String(minutes).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
  }

  return <div className="border-b border-[#f1dfaa] bg-gradient-to-r from-[#fff9e8] via-[#fff3c5] to-[#fff9e8] px-4 py-3.5 text-center text-xs font-semibold tracking-[0.08em] text-[#5b4300] sm:text-sm" role="timer" aria-live="off"><span>SALE ENDS IN</span><span className="mx-2 text-[#b88800]">•</span><strong className="tabular-nums text-[#171717]">{countdown}</strong></div>;
}