import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { REELS_SETTING_KEY, type StoreReel } from "@/lib/reels";
import { parseProductVideoUrl } from "@/lib/product-video";

const badges = ["None", "Trending", "New", "Bestseller", "Must Have"] as const;
function validReel(value: unknown): value is StoreReel {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const r = value as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.title === "string" && r.title.length <= 120 && typeof r.videoUrl === "string" && r.videoUrl.length <= 3000 && (!r.videoUrl || Boolean(parseProductVideoUrl(r.videoUrl))) && typeof r.poster === "string" && r.poster.length <= 3000 && badges.includes(r.badge as StoreReel["badge"]) && (r.productId === null || typeof r.productId === "number") && typeof r.cta === "string" && typeof r.description === "string" && typeof r.enabled === "boolean" && typeof r.sortOrder === "number";
}
export async function GET() {
  if (!(await requireAdminPermission("storefront", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const { getStoreReels } = await import("@/lib/reels");
  const products = await prisma.product.findMany({ where: { status: "active" }, select: { id: true, name: true, videoUrl: true, images: { take: 1, orderBy: { sortOrder: "asc" }, select: { image: true } } }, orderBy: { name: "asc" }, take: 300 });
  return NextResponse.json({ reels: await getStoreReels(), products: products.map(p => ({ id: p.id, name: p.name, videoUrl: p.videoUrl, image: p.images[0]?.image ?? "" })) });
}
export async function PUT(request: Request) {
  if (!(await requireAdminPermission("storefront", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as { reels?: unknown } | null;
  if (!body || !Array.isArray(body.reels) || body.reels.length > 100 || !body.reels.every(validReel)) return NextResponse.json({ message: "Check each reel's title, media, badge and sort order." }, { status: 400 });
  await prisma.storeSetting.upsert({ where: { key: REELS_SETTING_KEY }, update: { value: body.reels as unknown as Prisma.InputJsonValue }, create: { key: REELS_SETTING_KEY, value: body.reels as unknown as Prisma.InputJsonValue } });
  return NextResponse.json({ reels: body.reels });
}
