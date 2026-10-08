"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ChannelVisitTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  useEffect(() => {
    const params = new URLSearchParams(query);
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: params.get("utm_source"), campaign: params.get("utm_campaign"), referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, query]);
  return null;
}
