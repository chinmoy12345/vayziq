import { cache } from "react";
import prisma from "@/lib/db";

export type SocialPlatform = "facebook" | "instagram" | "youtube";
export type SocialLink = { url: string; visible: boolean };
export type SocialLinks = Record<SocialPlatform, SocialLink>;
export const SOCIAL_PLATFORMS: SocialPlatform[] = ["facebook", "instagram", "youtube"];
const KEY = "footer_social_links_v1";

const empty = (): SocialLinks => ({
  facebook: { url: "", visible: false },
  instagram: { url: "", visible: false },
  youtube: { url: "", visible: false },
});

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validSocialUrl(platform: SocialPlatform, value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    const allowed: Record<SocialPlatform, string[]> = {
      facebook: ["facebook.com", "fb.com"],
      instagram: ["instagram.com"],
      youtube: ["youtube.com", "youtu.be"],
    };
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (url.protocol !== "https:" || !allowed[platform].includes(hostname) || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function parseSocialLinks(value: unknown): SocialLinks {
  const result = empty();
  if (!record(value)) return result;
  for (const platform of SOCIAL_PLATFORMS) {
    const item = value[platform];
    if (!record(item)) continue;
    const url = validSocialUrl(platform, typeof item.url === "string" ? item.url : "");
    result[platform] = { url: url ?? "", visible: item.visible === true && Boolean(url) };
  }
  return result;
}

export const getSocialLinks = cache(async (): Promise<SocialLinks> => {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: KEY }, select: { value: true } });
    return parseSocialLinks(setting?.value);
  } catch {
    return empty();
  }
});

export async function saveSocialLinks(value: unknown): Promise<SocialLinks> {
  if (!record(value)) throw new Error("Enter social profile settings.");
  const result = empty();
  for (const platform of SOCIAL_PLATFORMS) {
    const item = value[platform];
    if (!record(item)) throw new Error(`Enter valid ${platform} settings.`);
    const raw = typeof item.url === "string" ? item.url.trim() : "";
    if (raw.length > 500) throw new Error(`${platform} URL is too long.`);
    const url = validSocialUrl(platform, raw);
    if (url === null) throw new Error(`Enter a secure ${platform} profile URL.`);
    if (item.visible === true && !url) throw new Error(`Add the ${platform} URL before showing it in the footer.`);
    result[platform] = { url, visible: item.visible === true };
  }
  await prisma.storeSetting.upsert({
    where: { key: KEY },
    update: { value: result },
    create: { key: KEY, value: result },
  });
  return result;
}
