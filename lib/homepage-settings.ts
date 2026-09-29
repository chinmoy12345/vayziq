import { cache } from "react";
import prisma from "@/lib/db";

export const HOMEPAGE_VISIBILITY_DEFAULTS = {
  customerReviews: true,
  newArrivals: true,
  watchAndBuy: true,
  featuredCollection: true,
  offerZone: true,
  newsletter: true,
  trendingNow: false,
  trendingCategories: false,
  shopByMood: false,
  trustBenefits: false,
  footerNewsletter: true,
  footerBrand: true,
  footerShopLinks: true,
  footerInformationLinks: true,
  footerContact: true,
  footerBottomBar: true,
  productCardRating: true,
  productCardCarousel: true,
  productDetailRating: true,
  productDetailOffers: true,
  productDetailVideo: true,
  productDetailDelivery: true,
  productDetailDescription: true,
  productDetailReviews: true,
  productDetailRelated: true,
  cartPageHeader: true,
  cartItemCount: true,
  cartClearButton: true,
  cartSaveForLater: true,
  cartOffers: true,
  cartShippingMessage: true,
  cartTrustBenefits: true,
} as const;

export type HomepageVisibility = { [Key in keyof typeof HOMEPAGE_VISIBILITY_DEFAULTS]: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const getHomepageVisibility = cache(async (): Promise<HomepageVisibility> => {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: "homepage_visibility" }, select: { value: true } });
    const value: unknown = setting?.value;
    if (!isRecord(value)) return { ...HOMEPAGE_VISIBILITY_DEFAULTS };
    return Object.fromEntries(Object.entries(HOMEPAGE_VISIBILITY_DEFAULTS).map(([key, fallback]) => [key, typeof value[key] === "boolean" ? value[key] : fallback])) as HomepageVisibility;
  } catch {
    return { ...HOMEPAGE_VISIBILITY_DEFAULTS };
  }
});
