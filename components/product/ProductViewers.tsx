"use client";

import { useEffect, useRef, useState } from "react";
import { Eye } from "lucide-react";

export default function ProductViewers({ productId, showCount }: { productId: number; showCount: boolean }) {
  const [view, setView] = useState<{ productId: number; count: number } | null>(null);
  const visitRef = useRef<{ productId: number; id: string } | null>(null);
  useEffect(() => {
    if (visitRef.current?.productId !== productId) visitRef.current = { productId, id: crypto.randomUUID() };
    const visitId = visitRef.current.id;
    let visitorId: string;
    try {
      visitorId = localStorage.getItem("vayziq-view-visitor") || crypto.randomUUID();
      localStorage.setItem("vayziq-view-visitor", visitorId);
    } catch { visitorId = crypto.randomUUID(); }
    let disposed = false;
    let pending = false;
    const controller = new AbortController();
    async function heartbeat() {
      if (document.visibilityState !== "visible" || pending || disposed) return;
      pending = true;
      try {
        const response = await fetch(`/api/products/${productId}/views`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId, visitId }), signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Tracking unavailable");
        const data = await response.json();
        if (!disposed && Number.isSafeInteger(data.activeViewers) && data.activeViewers >= 0) setView({ productId, count: data.activeViewers });
      } catch { if (!disposed) setView(null); }
      finally { pending = false; }
    }
    void heartbeat();
    const timer = window.setInterval(() => void heartbeat(), 20_000);
    const onVisibility = () => { if (document.visibilityState === "visible") void heartbeat(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { disposed = true; controller.abort(); window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisibility); };
  }, [productId]);
  if (!showCount || !view || view.productId !== productId || view.count < 1) return null;
  return <p className="mb-4 flex items-center gap-2 rounded-lg bg-[#fff7e0] px-3 py-2 text-xs font-medium text-[#67521d]" title="Unique browsers active on this product in the last 60 seconds"><Eye className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{view.count} {view.count === 1 ? "person is" : "people are"} viewing this product now</span></p>;
}
