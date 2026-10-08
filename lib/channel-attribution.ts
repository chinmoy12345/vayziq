export const CHANNEL_COOKIE = "vayziq_channel";
export const VISITOR_COOKIE = "vayziq_visitor";

const channelAliases: Record<string, string> = {
  fb: "facebook", facebook: "facebook", instagram: "instagram", ig: "instagram",
  google: "google", googleads: "google", adwords: "google", g: "google",
  youtube: "youtube", yt: "youtube", bing: "bing", microsoft: "bing",
  whatsapp: "whatsapp", wa: "whatsapp", tiktok: "tiktok",
  email: "email", newsletter: "email", pinterest: "pinterest",
};

export function normalizeChannel(utmSource: string | null, referrer: string | null, siteHost: string): string {
  const source = utmSource?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  if (source) return channelAliases[source] ?? source;
  if (referrer) {
    try {
      const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
      if (host === siteHost || host.endsWith(`.${siteHost}`)) return "direct";
      if (/(^|\.)facebook\.|(^|\.)fb\.|(^|\.)l\.facebook\./.test(host)) return "facebook";
      if (/(^|\.)instagram\./.test(host)) return "instagram";
      if (/(^|\.)google\./.test(host)) return "google";
      if (/(^|\.)youtube\./.test(host)) return "youtube";
      if (/(^|\.)bing\./.test(host)) return "bing";
      if (/(^|\.)pinterest\./.test(host)) return "pinterest";
      if (/(^|\.)tiktok\./.test(host)) return "tiktok";
      return "referral";
    } catch { /* Invalid referrer is treated as direct. */ }
  }
  return "direct";
}

export function indiaDay(date: Date): string {
  return new Date(date.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

export function readAttribution(value: string | undefined): { channel: string; campaign: string | null } {
  if (!value) return { channel: "direct", campaign: null };
  try {
    const parsed = JSON.parse(value) as { channel?: unknown; campaign?: unknown };
    const channel = typeof parsed.channel === "string" && /^[a-z0-9_-]{1,40}$/.test(parsed.channel) ? parsed.channel : "direct";
    const campaign = typeof parsed.campaign === "string" ? parsed.campaign.slice(0, 120) : null;
    return { channel, campaign };
  } catch { return { channel: "direct", campaign: null }; }
}
