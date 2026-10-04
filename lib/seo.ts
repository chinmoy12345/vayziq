import { cache } from "react";
import type { Metadata } from "next";
import prisma from "@/lib/db";
import { SEO_DEFAULTS, protectedSeoPath, type SeoEntry } from "./seo-config";
export const SITE_URL = "https://vayziq.com";
export const getSeoEntries = cache(async () => {
  try {
    const rows = await prisma.storeSetting.findMany({ where: { key: { startsWith: "seo:" } } });
    return Object.fromEntries(rows.map(row => [row.key.slice(4), row.value as unknown as SeoEntry]));
  } catch {
    // Metadata must fall back to the brand defaults while an offline build has no database.
    return {} as Record<string, SeoEntry>;
  }
});
export async function pageSeo(path: string, fallback: Metadata = {}): Promise<Metadata> {
  const entry = (await getSeoEntries())[path];
  const defaults = SEO_DEFAULTS[path];
  const fallbackTitle = typeof fallback.title === "string" ? fallback.title : "Streetwear | Vayziq";
  const title = entry?.title || defaults?.[0] || (fallbackTitle.includes("Vayziq") ? fallbackTitle : `${fallbackTitle} | Vayziq`);
  const description = entry?.description || defaults?.[1] || fallback.description || SEO_DEFAULTS["/"][1];
  const canonical = entry?.canonical || path;
  const noindex = protectedSeoPath(path) || entry?.noindex || (typeof fallback.robots === "object" && fallback.robots?.index === false);
  const images = entry?.image ? [{ url: entry.image }] : fallback.openGraph?.images;
  return { ...fallback, title: { absolute: title }, description, alternates: { canonical },
    robots: { index: !noindex, follow: true },
    openGraph: { type: "website", ...fallback.openGraph, siteName: "Vayziq", title, description, url: canonical, ...(images ? { images } : {}) },
    twitter: { ...fallback.twitter, card: "summary_large_image", title, description, ...(entry?.image ? { images: [entry.image] } : {}) },
  };
}
