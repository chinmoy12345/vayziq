import { type NextRequest } from "next/server";
import { feedCredentialsValid, feedRequiresAuth, getMetaFeeds, renderMetaFeed } from "@/lib/meta-product-feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();
function denied(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now(); const value = attempts.get(ip);
  if (value && value.resetAt > now && value.count >= 12) return new Response("Too many authentication attempts.", { status: 429, headers: { "Retry-After": "900" } });
  attempts.set(ip, { count: value && value.resetAt > now ? value.count + 1 : 1, resetAt: now + 15 * 60_000 });
  return new Response("Authentication required.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Vayziq Meta Product Feed", charset="UTF-8"', "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  const feed = slug ? (await getMetaFeeds()).find(candidate => candidate.slug === slug && candidate.active) : undefined;
  if (!feed) return denied(request);
  if (!feedRequiresAuth(feed)) {
    const xml = await renderMetaFeed(feed);
    return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex, nofollow" } });
  }
  if (!(await feedCredentialsValid(feed, request.headers.get("authorization")))) return denied(request);
  const xml = await renderMetaFeed(feed);
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "private, max-age=0, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
