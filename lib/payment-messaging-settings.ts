import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import prisma from "@/lib/db";

const SETTINGS_KEY = "payment_messaging_credentials_v1";
type SecretValue = { iv: string; tag: string; value: string };
type ProviderRecord = { enabled: boolean; values: Record<string, SecretValue> };
type CredentialsRecord = { version: 1; twilio?: ProviderRecord; razorpay?: ProviderRecord };
export type TwilioCredentials = { accountSid: string; authToken: string; fromNumber: string };
export type RazorpayCredentials = { keyId: string; keySecret: string };

function key() {
  const source = process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) throw new Error("Set CREDENTIALS_ENCRYPTION_KEY before saving payment or SMS credentials.");
  return createHash("sha256").update(source).digest();
}
function encrypt(value: string): SecretValue {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return { iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), value: encrypted.toString("base64") };
}
function decrypt(secret: SecretValue) {
  const encrypted = Buffer.from(secret.value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(secret.iv, "base64"));
  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function isSecret(value: unknown): value is SecretValue {
  return typeof value === "object" && value !== null
    && typeof (value as SecretValue).iv === "string"
    && typeof (value as SecretValue).tag === "string"
    && typeof (value as SecretValue).value === "string";
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function parseProvider(value: unknown): ProviderRecord | undefined {
  if (!isRecord(value) || typeof value.enabled !== "boolean" || !isRecord(value.values)) return undefined;
  const values = Object.fromEntries(Object.entries(value.values).filter(([, item]) => isSecret(item))) as Record<string, SecretValue>;
  return { enabled: value.enabled, values };
}
function parseRecord(value: unknown): CredentialsRecord {
  if (!isRecord(value)) return { version: 1 };
  return { version: 1, twilio: parseProvider(value.twilio), razorpay: parseProvider(value.razorpay) };
}
async function readRecord() {
  const row = await prisma.storeSetting.findUnique({ where: { key: SETTINGS_KEY }, select: { value: true } });
  return parseRecord(row?.value);
}
async function writeRecord(record: CredentialsRecord) {
  await prisma.storeSetting.upsert({ where: { key: SETTINGS_KEY }, update: { value: record as unknown as Prisma.InputJsonValue }, create: { key: SETTINGS_KEY, value: record as unknown as Prisma.InputJsonValue } });
}
function present(provider: ProviderRecord | undefined, fields: string[]) {
  return Boolean(provider?.enabled && fields.every(field => provider.values[field]));
}
export async function getIntegrationStatus() {
  const record = await readRecord();
  const twilioFromEnvironment = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
  const razorpayFromEnvironment = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const twilioConfigured = present(record.twilio, ["accountSid", "authToken", "fromNumber"]);
  const razorpayConfigured = present(record.razorpay, ["keyId", "keySecret"]);
  return {
    twilio: { enabled: record.twilio?.enabled ?? twilioFromEnvironment, configured: twilioConfigured || (!record.twilio && twilioFromEnvironment), accountSid: twilioConfigured ? "Saved" : twilioFromEnvironment ? "Environment" : "Not set", fromNumber: twilioConfigured ? "Saved" : twilioFromEnvironment ? "Environment" : "Not set" },
    razorpay: { enabled: record.razorpay?.enabled ?? razorpayFromEnvironment, configured: razorpayConfigured || (!record.razorpay && razorpayFromEnvironment), keyId: razorpayConfigured ? "Saved" : razorpayFromEnvironment ? "Environment" : "Not set" },
  };
}

export async function getTwilioCredentials(): Promise<TwilioCredentials | null> {
  const provider = (await readRecord()).twilio;
  if (provider) {
    if (!provider.enabled || !present(provider, ["accountSid", "authToken", "fromNumber"])) return null;
    try { return { accountSid: decrypt(provider.values.accountSid), authToken: decrypt(provider.values.authToken), fromNumber: decrypt(provider.values.fromNumber) }; } catch { return null; }
  }
  const accountSid = process.env.TWILIO_ACCOUNT_SID, authToken = process.env.TWILIO_AUTH_TOKEN, fromNumber = process.env.TWILIO_FROM_NUMBER;
  return accountSid && authToken && fromNumber ? { accountSid, authToken, fromNumber } : null;
}

export async function getRazorpayCredentials(): Promise<RazorpayCredentials | null> {
  const provider = (await readRecord()).razorpay;
  if (provider) {
    if (!provider.enabled || !present(provider, ["keyId", "keySecret"])) return null;
    try { return { keyId: decrypt(provider.values.keyId), keySecret: decrypt(provider.values.keySecret) }; } catch { return null; }
  }
  const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

type UpdateInput = { twilio?: { enabled?: unknown; accountSid?: unknown; authToken?: unknown; fromNumber?: unknown }; razorpay?: { enabled?: unknown; keyId?: unknown; keySecret?: unknown } };
function string(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function updateProvider(current: ProviderRecord | undefined, fields: Record<string, string>, enabled: unknown) {
  const values = { ...(current?.values ?? {}) };
  for (const [field, value] of Object.entries(fields)) if (value) values[field] = encrypt(value);
  return { enabled: enabled === true, values };
}
export async function updateIntegrationCredentials(input: UpdateInput) {
  const record = await readRecord();
  if (input.twilio) {
    const next = updateProvider(record.twilio, { accountSid: string(input.twilio.accountSid, 100), authToken: string(input.twilio.authToken, 200), fromNumber: string(input.twilio.fromNumber, 32) }, input.twilio.enabled);
    if (next.enabled && !present(next, ["accountSid", "authToken", "fromNumber"])) throw new Error("Enter all Twilio credentials before enabling SMS OTP.");
    record.twilio = next;
  }
  if (input.razorpay) {
    const next = updateProvider(record.razorpay, { keyId: string(input.razorpay.keyId, 100), keySecret: string(input.razorpay.keySecret, 200) }, input.razorpay.enabled);
    if (next.enabled && !present(next, ["keyId", "keySecret"])) throw new Error("Enter both Razorpay keys before enabling online payments.");
    record.razorpay = next;
  }
  await writeRecord(record);
  return getIntegrationStatus();
}

