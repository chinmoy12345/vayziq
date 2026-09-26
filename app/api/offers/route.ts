import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { couponAvailable, publicOffer } from "@/lib/coupons";
export const dynamic = "force-dynamic";
export async function GET() {
  const coupons = await prisma.coupon.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ offers: coupons.filter(coupon => couponAvailable(coupon)).map(publicOffer) }, { headers: { "Cache-Control": "no-store" } });
}
