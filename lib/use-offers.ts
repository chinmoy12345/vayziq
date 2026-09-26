"use client";
import { useEffect, useState } from "react";
import type { ProductOffer } from "@/lib/product-offers";
export function useOffers() {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/offers", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active) { setOffers(data.offers); setError(""); }
      } catch { if (active) setError("Offers could not be loaded. Please refresh to try again."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    window.addEventListener("focus", load);
    return () => { active = false; window.removeEventListener("focus", load); };
  }, []);
  return { offers, loading, error };
}
