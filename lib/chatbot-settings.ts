import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

const KEY = "shopping_chatbot_v1";
export type ChatbotConfig = { enabled: boolean; name: string; greeting: string; model: string; knowledge: string };
export const CHATBOT_DEFAULTS: ChatbotConfig = { enabled: true, name: "Arya", greeting: "Hi! I’m {name}, your shopping assistant. What can I help you find?", model: "gpt-4.1-mini", knowledge: "" };
type Secret = { iv: string; tag: string; data: string };
function encryptionKey() {
  const source = process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) throw new Error("Configure CREDENTIALS_ENCRYPTION_KEY before saving an API key.");
  return createHash("sha256").update(source).digest();
}
function encryptKey(value: string): Secret {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return { iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") };
}
function decrypt(secret: Secret) {
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(secret.iv, "base64"));
  cipher.setAuthTag(Buffer.from(secret.tag, "base64"));
  return Buffer.concat([cipher.update(Buffer.from(secret.data, "base64")), cipher.final()]).toString("utf8");
}
export async function getChatbotSettings(database: Pick<Prisma.TransactionClient, "storeSetting"> = prisma) {
  const row = await database.storeSetting.findUnique({ where: { key: KEY }, select: { value: true } });
  const stored = row?.value && typeof row.value === "object" && !Array.isArray(row.value) ? row.value as Record<string, unknown> : {};
  const config: ChatbotConfig = { ...CHATBOT_DEFAULTS };
  for (const field of ["name", "greeting", "model", "knowledge"] as const) if (typeof stored[field] === "string") config[field] = stored[field];
  if (typeof stored.enabled === "boolean") config.enabled = stored.enabled;
  const secret = stored.apiKey && typeof stored.apiKey === "object" ? stored.apiKey as unknown as Secret : undefined;
  return { config, secret, configured: Boolean(secret || process.env.OPENAI_API_KEY) };
}
export async function getChatbotApiKey(secret?: Secret) { return secret ? decrypt(secret) : process.env.OPENAI_API_KEY || ""; }
export async function saveChatbotSettings(config: ChatbotConfig, apiKey: string, removeKey: boolean, database: Pick<Prisma.TransactionClient, "storeSetting"> = prisma) {
  const current = await getChatbotSettings(database);
  const secret = apiKey ? encryptKey(apiKey) : removeKey ? undefined : current.secret;
  const value = { ...config, ...(secret ? { apiKey: secret } : {}) };
  await database.storeSetting.upsert({ where: { key: KEY }, create: { key: KEY, value: value as unknown as Prisma.InputJsonValue }, update: { value: value as unknown as Prisma.InputJsonValue } });
  return { config, configured: Boolean(secret || process.env.OPENAI_API_KEY) };
}
