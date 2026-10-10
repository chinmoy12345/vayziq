import prisma from "@/lib/db";
export const SALE_COUNTDOWN_KEY = "product_sale_countdown";
export type SaleCountdownSettings = { enabled: boolean; endsAt: string };
export const DEFAULT_SALE_COUNTDOWN: SaleCountdownSettings = { enabled: false, endsAt: "" };
export async function getSaleCountdownSettings(): Promise<SaleCountdownSettings> {
  const row = await prisma.storeSetting.findUnique({ where: { key: SALE_COUNTDOWN_KEY }, select: { value: true } });
  const value = row?.value as Record<string, unknown> | null;
  return { enabled: typeof value?.enabled === "boolean" ? value.enabled : false, endsAt: typeof value?.endsAt === "string" ? value.endsAt : "" };
}