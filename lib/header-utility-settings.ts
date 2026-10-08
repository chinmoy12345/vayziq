import prisma from "@/lib/db";
import { DEFAULT_HEADER_UTILITY, type HeaderUtilitySettings } from "@/lib/header-utility-types";

export { DEFAULT_HEADER_UTILITY } from "@/lib/header-utility-types";
export type { HeaderUtilitySettings } from "@/lib/header-utility-types";

export const HEADER_UTILITY_KEY = "header_utility_links_v1";

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validLocalHref(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !/[\\\r\n]/.test(value) && value.length <= 200;
}

export function parseHeaderUtility(value: unknown): HeaderUtilitySettings {
  if (!record(value)) throw new Error("Invalid header utility settings.");
  const result = { ...DEFAULT_HEADER_UTILITY, currency: { ...DEFAULT_HEADER_UTILITY.currency } };
  for (const key of ["trackOrder", "help"] as const) {
    const input = value[key];
    if (!record(input) || typeof input.visible !== "boolean" || typeof input.label !== "string" || typeof input.href !== "string") throw new Error(`Enter valid ${key === "trackOrder" ? "Track Order" : "Help"} settings.`);
    const label = input.label.trim();
    const href = input.href.trim();
    if (!label || label.length > 32 || !validLocalHref(href)) throw new Error("Use a short label and an internal path beginning with /.");
    result[key] = { visible: input.visible, label, href };
  }
  if (!record(value.currency) || typeof value.currency.visible !== "boolean") throw new Error("Choose whether to show the INR indicator.");
  result.currency.visible = value.currency.visible;
  return result;
}

export async function getHeaderUtility(): Promise<HeaderUtilitySettings> {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: HEADER_UTILITY_KEY }, select: { value: true } });
    return setting ? parseHeaderUtility(setting.value) : DEFAULT_HEADER_UTILITY;
  } catch {
    return DEFAULT_HEADER_UTILITY;
  }
}
