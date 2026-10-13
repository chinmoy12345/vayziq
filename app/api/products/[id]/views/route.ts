import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { recordProductView, VIEW_PREFIX } from "@/lib/product-views";

export const runtime = "nodejs";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  const productId = Number((await params).id);
  const body = await request.json().catch(() => null);
  if (!Number.isSafeInteger(productId) || productId < 1 || typeof body?.visitorId !== "string" || !UUID.test(body.visitorId) || typeof body?.visitId !== "string" || !UUID.test(body.visitId)) {
    return NextResponse.json({ message: "Invalid view." }, { status: 400 });
  }
  try {
    const product = await prisma.product.findFirst({ where: { id: productId, status: "active", category: { status: "active" } }, select: { id: true } });
    if (!product) return NextResponse.json({ message: "Product not found." }, { status: 404 });
    const now = new Date();
    // Keep retry tokens for a day; stale presence never contributes to the count.
    await prisma.storeSetting.deleteMany({ where: { key: { startsWith: `${VIEW_PREFIX}visit_` }, updatedAt: { lt: new Date(now.getTime() - 86_400_000) } } });
    await prisma.storeSetting.deleteMany({ where: { key: { startsWith: `${VIEW_PREFIX}active_` }, updatedAt: { lt: new Date(now.getTime() - 86_400_000) } } });
    const activeViewers = await prisma.$transaction(tx => recordProductView(tx, productId, body.visitorId, body.visitId, now));
    return NextResponse.json({ activeViewers }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "View tracking is temporarily unavailable." }, { status: 503 });
  }
}
