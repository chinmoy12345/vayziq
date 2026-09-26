import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

// Addresses are account-specific and must never be evaluated during static build.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!Number.isInteger(userId)) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] });
  return NextResponse.json({ success: true, addresses });
}

export async function POST(request: NextRequest) {
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  if (!Number.isInteger(userId)) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const mobile = String(body.mobile ?? "").replace(/\D/g, "");
  const line1 = String(body.line1 ?? "").trim();
  const city = String(body.city ?? "").trim();
  const state = String(body.state ?? "").trim();
  const postalCode = String(body.postalCode ?? "").replace(/\D/g, "");
  if (!fullName || !/^[6-9]\d{9}$/.test(mobile) || !line1 || !city || !state || !/^\d{6}$/.test(postalCode)) return NextResponse.json({ success: false, message: "Please complete a valid delivery address." }, { status: 400 });
  const hasAddress = await prisma.address.count({ where: { userId } });
  const address = await prisma.address.create({ data: { userId, fullName, mobile, line1, line2: String(body.line2 ?? "").trim() || null, city, state, postalCode, isDefault: hasAddress === 0 } });
  return NextResponse.json({ success: true, address }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getCurrentUser(); const userId = Number(session?.sub);
  const body = await request.json(); const id = Number(body.id);
  if (!Number.isInteger(userId) || !Number.isInteger(id)) return NextResponse.json({ success: false, message: "Unauthenticated." }, { status: 401 });
  const fullName = String(body.fullName ?? "").trim(); const mobile = String(body.mobile ?? "").replace(/\D/g, ""); const line1 = String(body.line1 ?? "").trim(); const city = String(body.city ?? "").trim(); const state = String(body.state ?? "").trim(); const postalCode = String(body.postalCode ?? "").replace(/\D/g, "");
  if (!fullName || !/^[6-9]\d{9}$/.test(mobile) || !line1 || !city || !state || !/^\d{6}$/.test(postalCode)) return NextResponse.json({ success: false, message: "Please complete a valid delivery address." }, { status: 400 });
  const address = await prisma.address.updateMany({ where: { id, userId }, data: { fullName, mobile, line1, line2: String(body.line2 ?? "").trim() || null, city, state, postalCode } });
  if (!address.count) return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
  return NextResponse.json({ success: true });
}
