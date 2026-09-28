import { cache } from "react";
import prisma from "@/lib/db";

export type StoreBranding = {
  name: string;
  logo: string;
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  address: string;
  pincode: string;
};

export const DEFAULT_STORE_BRANDING: StoreBranding = {
  name: "Tantuka",
  email: "hello.vayziq@gmail.com",
  phone: "+91 9330755055",
  whatsapp: "+91 9330755055",
  hours: "24*7",
  address: "Mumbai",
  pincode: "",
  logo: "/uploads/branding/tantuka-wordmark-classic.png",
};

const REPLACED_LOGOS = new Set([
  "/uploads/branding/tantuka-logo-v1.png",
  "/uploads/branding/tantuka-logo-v2-horizontal.png",
  "/uploads/branding/tantuka-logo-horizontal.webp",
  "/uploads/branding/tantuka-wordmark.png",
]);

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Store branding must never make the customer-facing site unavailable. */
export const getStoreBranding = cache(async (): Promise<StoreBranding> => {
  try {
    const settings = await prisma.storeSetting.findMany({
      where: { key: { in: ["store_name", "store_logo", "store_email", "store_phone", "store_whatsapp", "store_hours", "store_address", "store_pincode"] } },
      select: { key: true, value: true },
    });
    const values = new Map(settings.map((setting) => [setting.key, setting.value]));

    return {
      email: stringValue(values.get("store_email")) ?? DEFAULT_STORE_BRANDING.email,
      phone: stringValue(values.get("store_phone")) ?? DEFAULT_STORE_BRANDING.phone,
      whatsapp: stringValue(values.get("store_whatsapp")) ?? DEFAULT_STORE_BRANDING.whatsapp,
      hours: stringValue(values.get("store_hours")) ?? DEFAULT_STORE_BRANDING.hours,
      address: stringValue(values.get("store_address")) ?? DEFAULT_STORE_BRANDING.address,
      pincode: stringValue(values.get("store_pincode")) ?? "",
      name: stringValue(values.get("store_name")) ?? DEFAULT_STORE_BRANDING.name,
      logo: (() => {
        const savedLogo = stringValue(values.get("store_logo"));
        return !savedLogo || REPLACED_LOGOS.has(savedLogo) ? DEFAULT_STORE_BRANDING.logo : savedLogo;
      })(),
    };
  } catch {
    return DEFAULT_STORE_BRANDING;
  }
});
