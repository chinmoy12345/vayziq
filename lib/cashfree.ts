import { createHmac, timingSafeEqual } from "crypto";
import type { CashfreeCredentials } from "@/lib/payment-messaging-settings";

export const CASHFREE_API_VERSION = "2025-01-01";
export function cashfreeBaseUrl(mode: CashfreeCredentials["mode"]) {
  return mode === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
}
export async function cashfreeRequest<T>(credentials: CashfreeCredentials, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${cashfreeBaseUrl(credentials.mode)}${path}`, {
    ...init,
    headers: { "x-client-id": credentials.appId, "x-client-secret": credentials.secretKey, "x-api-version": CASHFREE_API_VERSION, Accept: "application/json", "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Cashfree API returned ${response.status}.`);
  return response.json() as Promise<T>;
}
export function verifyCashfreeWebhook(rawBody: string, timestamp: string | null, signature: string | null, secret: string) {
  if (!timestamp || !signature || !/^\d+$/.test(timestamp)) return false;
  const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  const provided = Buffer.from(signature, "base64");
  const calculated = Buffer.from(expected, "base64");
  return provided.length === calculated.length && timingSafeEqual(provided, calculated);
}
export type CashfreeOrder = { order_id: string; order_status: string; order_amount: number; order_currency: string; payment_session_id?: string };
export type CashfreePayment = { cf_payment_id: string | number; payment_status: string; payment_amount: number; payment_currency: string };
