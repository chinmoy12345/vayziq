import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

const SETTINGS_KEY = "checkout_provider_v1";

export type CheckoutProvider = "native" | "shiprocket";
export type CheckoutProviderSettings = { provider: CheckoutProvider };

const defaults: CheckoutProviderSettings = { provider: "native" };

function isProvider(value: unknown): value is CheckoutProvider {
  return value === "native" || value === "shiprocket";
}

export async function getCheckoutProviderSettings(): Promise<CheckoutProviderSettings> {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: SETTINGS_KEY }, select: { value: true } });
    const value = setting?.value;
    if (typeof value === "object" && value !== null && !Array.isArray(value) && isProvider((value as Record<string, unknown>).provider)) {
      return { provider: (value as Record<string, CheckoutProvider>).provider };
    }
  } catch {
    // Native checkout remains the safe default when settings are unavailable.
  }
  return { ...defaults };
}

export async function updateCheckoutProviderSettings(provider: unknown): Promise<CheckoutProviderSettings> {
  if (!isProvider(provider)) throw new Error("Choose either Native checkout or Shiprocket Checkout.");
  const settings = { provider } satisfies CheckoutProviderSettings;
  await prisma.storeSetting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: settings as Prisma.InputJsonValue },
    create: { key: SETTINGS_KEY, value: settings as Prisma.InputJsonValue },
  });
  return settings;
}
