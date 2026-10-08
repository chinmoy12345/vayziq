import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CHANNEL_COOKIE, VISITOR_COOKIE, indiaDay, normalizeChannel, readAttribution } from "@/lib/channel-attribution";
import { getHomepageVisibility } from "@/lib/homepage-settings";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ ok: false }, { status: 403 });
  if ((await getHomepageVisibility()).maintenanceMode) return NextResponse.json({ ok: true });
  const body = await request.json().catch(() => null) as { source?: unknown; campaign?: unknown; referrer?: unknown } | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const siteHost = request.nextUrl.hostname.toLowerCase().replace(/^www\./, "");
  const source = typeof body.source === "string" ? body.source.slice(0, 80) : null;
  const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
  const channel = normalizeChannel(source, referrer, siteHost);
  const campaign = typeof body.campaign === "string" ? body.campaign.trim().slice(0, 120) : "";
  const prior = readAttribution(request.cookies.get(CHANNEL_COOKIE)?.value);
  const attributed = channel === "direct" && prior.channel !== "direct" ? prior : { channel, campaign: campaign || null };
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const visitorId = existing && /^[a-f0-9-]{36}$/.test(existing) ? existing : randomUUID();
  try {
    await prisma.channelVisit.upsert({
      where: { visitorId_day_channel: { visitorId, day: indiaDay(new Date()), channel } },
      update: {}, create: { visitorId, day: indiaDay(new Date()), channel },
    });
  } catch (error) {
    console.error("Channel visit could not be recorded", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(VISITOR_COOKIE, visitorId, { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 365 * 86400 });
  response.cookies.set(CHANNEL_COOKIE, JSON.stringify(attributed), { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 30 * 86400 });
  return response;
}
