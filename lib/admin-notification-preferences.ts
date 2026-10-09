import prisma from "@/lib/db";

export const ADMIN_NOTIFICATION_PREFERENCES_KEY = "admin_notification_preferences_v1";
export type AdminNotificationPreferences = { orders: boolean; reviews: boolean };
export const DEFAULT_ADMIN_NOTIFICATION_PREFERENCES: AdminNotificationPreferences = { orders: true, reviews: true };

export function parseAdminNotificationPreferences(value: unknown): AdminNotificationPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid notification preferences.");
  const data = value as Record<string, unknown>;
  if (typeof data.orders !== "boolean" || typeof data.reviews !== "boolean") throw new Error("Choose order and review notification settings.");
  return { orders: data.orders, reviews: data.reviews };
}

export async function getAdminNotificationPreferences(): Promise<AdminNotificationPreferences> {
  const row = await prisma.storeSetting.findUnique({ where: { key: ADMIN_NOTIFICATION_PREFERENCES_KEY }, select: { value: true } });
  try { return row ? parseAdminNotificationPreferences(row.value) : DEFAULT_ADMIN_NOTIFICATION_PREFERENCES; }
  catch { return DEFAULT_ADMIN_NOTIFICATION_PREFERENCES; }
}
