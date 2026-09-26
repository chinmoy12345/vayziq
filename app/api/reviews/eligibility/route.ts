import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { hasPurchasedProduct } from "@/lib/review-eligibility";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!session || !Number.isInteger(userId) || userId < 1) return NextResponse.json({ signedIn: false, eligible: false });
  const productId = Number(request.nextUrl.searchParams.get("productId"));
  if (!Number.isInteger(productId) || productId < 1) return NextResponse.json({ message: "Invalid product." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user || user.status !== "active") return NextResponse.json({ signedIn: false, eligible: false });
  return NextResponse.json({ signedIn: true, eligible: await hasPurchasedProduct(userId, productId) });
}
