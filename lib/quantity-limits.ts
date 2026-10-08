import prisma from "@/lib/db";

export const QUANTITY_LIMITS_KEY = "purchase_quantity_limits";
export const DEFAULT_QUANTITY_LIMITS = { min: 1, max: 10 };

export function validQuantityLimits(min: unknown, max: unknown) {
  return Number.isInteger(min) && Number.isInteger(max) && Number(min) >= 1 && Number(max) <= 1000 && Number(min) <= Number(max);
}

export async function getGlobalQuantityLimits() {
  const setting = await prisma.storeSetting.findUnique({ where: { key: QUANTITY_LIMITS_KEY } });
  const value = setting?.value as { min?: unknown; max?: unknown } | null;
  return validQuantityLimits(value?.min, value?.max)
    ? { min: Number(value?.min), max: Number(value?.max) }
    : DEFAULT_QUANTITY_LIMITS;
}

export function effectiveQuantityLimits(product: { minOrderQuantity?: number | null; maxOrderQuantity?: number | null }, global: { min: number; max: number }) {
  return { min: product.minOrderQuantity ?? global.min, max: product.maxOrderQuantity ?? global.max };
}

export function parseQuantityOverride(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 1000 ? number : undefined;
}
