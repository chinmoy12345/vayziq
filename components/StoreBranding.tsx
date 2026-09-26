"use client";
import { createContext, useContext } from "react";
import type { StoreBranding } from "@/lib/store-branding";
const BrandingContext = createContext<StoreBranding | null>(null);
export function StoreBrandingProvider({ branding, children }: { branding: StoreBranding; children: React.ReactNode }) {
  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
}
export function StoreName() {
  const branding = useContext(BrandingContext);
  return <>{branding?.name}</>;
}
