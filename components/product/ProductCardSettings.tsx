"use client";

import { createContext, useContext } from "react";
import type { HomepageVisibility } from "@/lib/homepage-settings";

export type ProductCardSettings = Pick<HomepageVisibility, "productCardRating" | "productCardCarousel">;

const ProductCardSettingsContext = createContext<ProductCardSettings>({ productCardRating: true, productCardCarousel: true });

export function ProductCardSettingsProvider({ settings, children }: { settings: ProductCardSettings; children: React.ReactNode }) {
  return <ProductCardSettingsContext.Provider value={settings}>{children}</ProductCardSettingsContext.Provider>;
}

export function useProductCardSettings() {
  return useContext(ProductCardSettingsContext);
}
