import { cache } from "react";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import prisma from "@/lib/db";

const STORE_MENU_KEY = "storefront_menu";
const EXCLUDED_CATEGORY_SLUGS = ["shop", "account", "product", "cart", "checkout", "login", "register", "search", "wishlist", "about", "contact", "privacy", "returns", "shipping", "offers", "api", "admin"];

export type MenuCategory = { id: number; name: string; slug: string };
export type StoreMenuSettings = { enabled: boolean; home: boolean; watchBuy: boolean; shop: boolean; newArrivals: boolean; categories: boolean; deals: boolean; categoryIds: number[] };

export const getMenuSelectableCategories = cache(async (): Promise<MenuCategory[]> => prisma.category.findMany({
  where: { status: "active", parentId: null, slug: { notIn: EXCLUDED_CATEGORY_SLUGS } },
  select: { id: true, name: true, slug: true },
  orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
}));

export const getStoreMenuSettings = cache(async (): Promise<StoreMenuSettings> => {
  const [categories, setting] = await Promise.all([
    getMenuSelectableCategories(),
    prisma.storeSetting.findUnique({ where: { key: STORE_MENU_KEY }, select: { value: true } }),
  ]);
  const value = setting?.value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { enabled: true, home: true, watchBuy: true, shop: true, newArrivals: true, categories: true, deals: true, categoryIds: categories.map(category => category.id) };
  const saved = value as Prisma.JsonObject;
  const validIds = new Set(categories.map(category => category.id));
  const categoryIds = Array.isArray(saved.categoryIds)
    ? saved.categoryIds.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && validIds.has(id))
    : categories.map(category => category.id);
  return { enabled: typeof saved.enabled === "boolean" ? saved.enabled : true, home: typeof saved.home === "boolean" ? saved.home : true, watchBuy: typeof saved.watchBuy === "boolean" ? saved.watchBuy : true, shop: typeof saved.shop === "boolean" ? saved.shop : true, newArrivals: typeof saved.newArrivals === "boolean" ? saved.newArrivals : true, categories: typeof saved.categories === "boolean" ? saved.categories : true, deals: typeof saved.deals === "boolean" ? saved.deals : true, categoryIds };
});

export { STORE_MENU_KEY };
