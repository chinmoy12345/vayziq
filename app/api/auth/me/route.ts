import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getCurrentUser();
  // This endpoint is a session probe used on every storefront load. A guest is
  // an expected state, so respond successfully with a null user rather than
  // producing noisy 401 entries in development and production logs.
  if (!session) return NextResponse.json({ success: true, user: null });
  const user = await prisma.user.findUnique({ where: { id: Number(session.sub) }, select: { id: true, name: true, email: true, mobile: true, status: true } });
  if (!user || user.status !== "active") return NextResponse.json({ success: true, user: null });
  return NextResponse.json({ success: true, user });
}
