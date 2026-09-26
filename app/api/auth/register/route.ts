import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const { name, email, mobile, password } = await request.json();
  const cleanName = String(name ?? "").trim();
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanMobile = String(mobile ?? "").replace(/\D/g, "");
  if (!cleanName || !cleanEmail || !password) return NextResponse.json({ success: false, message: "Name, email, and password are required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || String(password).length < 6) return NextResponse.json({ success: false, message: "Enter a valid email and a password of at least 6 characters." }, { status: 400 });
  try {
    const user = await prisma.user.create({ data: { name: cleanName, email: cleanEmail, mobile: cleanMobile || null, passwordHash: await bcrypt.hash(password, 12) } });
    const cookieStore = await cookies();
    cookieStore.set("access_token", signToken({ sub: String(user.id), email: user.email }), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } }, { status: 201 });
  } catch (error: unknown) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    return NextResponse.json({ success: false, message: code === "P2002" ? "An account with these details already exists." : "Unable to create your account." }, { status: code === "P2002" ? 409 : 500 });
  }
}
