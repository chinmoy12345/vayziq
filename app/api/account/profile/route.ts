import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentUser(); const id = Number(session?.sub);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true, mobile: true } });
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getCurrentUser(); const id = Number(session?.sub);
  if (!Number.isInteger(id)) return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  const { name, email } = await request.json();
  const cleanName = String(name ?? "").trim(); const cleanEmail = String(email ?? "").trim().toLowerCase();
  if (!cleanName || !/^\S+@\S+\.\S+$/.test(cleanEmail)) return NextResponse.json({ message: "Enter a valid name and email address." }, { status: 400 });
  try { const user = await prisma.user.update({ where: { id }, data: { name: cleanName, email: cleanEmail }, select: { name: true, email: true, mobile: true } }); return NextResponse.json({ user }); }
  catch { return NextResponse.json({ message: "This email address is already in use." }, { status: 409 }); }
}
