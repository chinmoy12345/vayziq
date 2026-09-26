import { cache } from "react";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import prisma from "@/lib/db";

export const DELIVERY_ZIP_SETTING_KEY = "delivery_zip_settings";
export type DeliveryZipSettings = { enabled: boolean; zipCodes: string[] };
const DEFAULT_SETTINGS: DeliveryZipSettings = { enabled: false, zipCodes: [] };

export const getDeliveryZipSettings = cache(async (): Promise<DeliveryZipSettings> => {
  try {
    const row = await prisma.storeSetting.findUnique({ where: { key: DELIVERY_ZIP_SETTING_KEY }, select: { value: true } });
    const value = row?.value;
    if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_SETTINGS;
    const saved = value as Prisma.JsonObject;
    const zipCodes = Array.isArray(saved.zipCodes)
      ? [...new Set(saved.zipCodes.filter((zip): zip is string => typeof zip === "string" && /^[1-9]\d{5}$/.test(zip)))].sort()
      : [];
    return { enabled: typeof saved.enabled === "boolean" ? saved.enabled : false, zipCodes };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function isDeliveryZipAllowed(zipCode: string) {
  const settings = await getDeliveryZipSettings();
  return !settings.enabled || settings.zipCodes.includes(zipCode);
}
