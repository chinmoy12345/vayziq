import { cache } from "react";
import prisma from "@/lib/db";

export const REELS_SETTING_KEY = "watch_buy_reels";
export type StoreReel = { id: string; title: string; videoUrl: string; poster: string; badge: "None" | "Trending" | "New" | "Bestseller" | "Must Have"; productId: number | null; cta: string; description: string; enabled: boolean; sortOrder: number };
export const emptyReel = (): StoreReel => ({ id: crypto.randomUUID(), title: "", videoUrl: "", poster: "", badge: "None", productId: null, cta: "Shop Now", description: "", enabled: true, sortOrder: 1 });
const demoReels: StoreReel[] = [
  { id: "demo-elegant-look", title: "Elegant Everyday Look", videoUrl: "", poster: "/vayziq/category-women.png", badge: "Trending", productId: null, cta: "Shop Now", description: "Modern everyday style.", enabled: true, sortOrder: 1 },
  { id: "demo-oversized-hoodie", title: "Oversized Hoodie", videoUrl: "", poster: "/vayziq/category-women.png", badge: "New", productId: null, cta: "Shop Now", description: "Relaxed layers for every day.", enabled: true, sortOrder: 2 },
  { id: "demo-essential-joggers", title: "Essential Joggers", videoUrl: "", poster: "/vayziq/category-men.png", badge: "Bestseller", productId: null, cta: "Shop Now", description: "Comfort made to move.", enabled: true, sortOrder: 3 },
  { id: "demo-essential-tee", title: "Women’s Essential Tee", videoUrl: "", poster: "/vayziq/fashion-grid.png", badge: "None", productId: null, cta: "Shop Now", description: "A clean everyday essential.", enabled: true, sortOrder: 4 },
  { id: "demo-daily-carry", title: "Daily Carry Cap", videoUrl: "", poster: "/vayziq/fashion-grid.png", badge: "None", productId: null, cta: "Shop Now", description: "The finishing touch.", enabled: false, sortOrder: 5 },
];

export const getStoreReels = cache(async (): Promise<StoreReel[]> => {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: REELS_SETTING_KEY } });
    const rows = Array.isArray(setting?.value) ? setting.value : demoReels;
    return rows.flatMap((row): StoreReel[] => {
      if (!row || typeof row !== "object" || Array.isArray(row)) return [];
      const value = row as Record<string, unknown>;
      if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.videoUrl !== "string") return [];
      return [{ id: value.id, title: value.title, videoUrl: value.videoUrl, poster: typeof value.poster === "string" ? value.poster : "", badge: ["None", "Trending", "New", "Bestseller", "Must Have"].includes(value.badge as string) ? value.badge as StoreReel["badge"] : "None", productId: typeof value.productId === "number" ? value.productId : null, cta: typeof value.cta === "string" ? value.cta : "Shop Now", description: typeof value.description === "string" ? value.description : "", enabled: value.enabled !== false, sortOrder: typeof value.sortOrder === "number" ? value.sortOrder : 1 }];
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  } catch { return []; }
});
