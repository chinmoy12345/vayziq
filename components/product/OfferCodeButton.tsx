"use client";
import { useState } from "react";
export default function OfferCodeButton({ code }: { code: string }) {
  const [saved, setSaved] = useState(false);
  return <button type="button" onClick={() => { try { localStorage.setItem("tantuka-offer", code); setSaved(true); } catch { setSaved(false); } }} className="rounded-lg bg-[#111] px-5 py-3 text-sm font-bold text-white" aria-live="polite">{saved ? `Selected: ${code}` : `Use code ${code}`}</button>;
}
