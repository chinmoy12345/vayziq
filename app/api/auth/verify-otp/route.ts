import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { signToken } from "@/lib/jwt";
import { mobileOtpCookie, verifyOtpChallenge } from "@/lib/mobileOtp";

export async function POST(request: NextRequest) {
  const { mobile, otp } = await request.json();
  const cleanMobile = String(mobile ?? "").replace(/\D/g, "");
  const cleanOtp = String(otp ?? "").replace(/\D/g, "");
  const cookieStore = await cookies();

  if (!/^[6-9]\d{9}$/.test(cleanMobile) || !/^\d{6}$/.test(cleanOtp)) {
    return NextResponse.json({ success: false, message: "Enter a valid mobile number and 6-digit OTP." }, { status: 400 });
  }

  if (!(await verifyOtpChallenge(cookieStore.get(mobileOtpCookie)?.value, cleanMobile, cleanOtp))) {
    return NextResponse.json({ success: false, message: "OTP is invalid or has expired." }, { status: 401 });
  }

  let user = await prisma.user.findUnique({ where: { mobile: cleanMobile } });
  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          name: `Customer ${cleanMobile.slice(-4)}`,
          email: `mobile-${cleanMobile}@account.susmitas.local`,
          mobile: cleanMobile,
          passwordHash: await bcrypt.hash(randomUUID(), 12),
        },
      });
    } catch {
      return NextResponse.json({ success: false, message: "We could not create your account. Please try again." }, { status: 409 });
    }
  }

  if (!user || user.status !== "active") {
    return NextResponse.json({ success: false, message: "No active account was found for this number." }, { status: 404 });
  }

  cookieStore.delete(mobileOtpCookie);
  cookieStore.set("access_token", signToken({ sub: String(user.id), email: user.email }), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile } });
}
