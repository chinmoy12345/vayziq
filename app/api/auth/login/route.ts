import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const { identifier, email, mobile, password, rememberMe } = await request.json();
  const login = String(identifier ?? email ?? mobile ?? "").trim().toLowerCase();
  if (!login || !password) return NextResponse.json({ success: false, message: "Email or mobile number and password are required." }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { OR: [{ email: login }, { mobile: login.replace(/\D/g, "") }] } });
  if (!user || user.status !== "active" || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ success: false, message: "Invalid login details." }, { status: 401 });
  const cookieStore = await cookies();
  cookieStore.set("access_token", signToken({ sub: String(user.id), email: user.email }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7 });
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });
}
