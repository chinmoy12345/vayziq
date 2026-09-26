import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

async function userId() {
  const session = await getCurrentUser();
  const id = Number(session?.sub);
  return Number.isInteger(id) ? id : null;
}

export async function GET() {
  const id = await userId();
  if (!id) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  const entries = await prisma.wishlistItem.findMany({ where: { userId: id }, select: { productId: true } });
  return NextResponse.json({ success: true, productIds: entries.map((entry) => entry.productId) });
}

export async function POST(request: NextRequest) {
  const id = await userId();
  const productId = Number((await request.json()).productId);
  if (!id) return NextResponse.json({ success: false, message: "Please sign in to save products." }, { status: 401 });
  if (!Number.isInteger(productId)) return NextResponse.json({ success: false, message: "Invalid product." }, { status: 400 });
  await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: id, productId } }, create: { userId: id, productId }, update: {} });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const id = await userId();
  const productId = Number(new URL(request.url).searchParams.get("productId"));
  if (!id) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  await prisma.wishlistItem.deleteMany({ where: { userId: id, productId } });
  return NextResponse.json({ success: true });
}
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
