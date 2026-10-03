"use client";
import { useEffect, useState } from "react";
import type { ProductOffer } from "@/lib/product-offers";
let pending: Promise<ProductOffer[]> | null = null;
function loadOffers() {
  if (!pending) pending = fetch("/api/offers", { cache: "no-store" }).then(async response => {
    if (!response.ok) throw new Error("Unable to load offers");
    return (await response.json()).offers as ProductOffer[];
  }).finally(() => { pending = null; });
  return pending;
}
export function useOffers() {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await loadOffers();
        if (active) { setOffers(data); setError(""); }
      } catch { if (active) setError("Offers could not be loaded. Please refresh to try again."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    window.addEventListener("focus", load);
    const timer = window.setInterval(load, 60000);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", load); };
  }, []);
  return { offers, loading, error };
}
