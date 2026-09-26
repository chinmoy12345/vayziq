import { getStoreBranding } from "@/lib/store-branding";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createOtpChallenge, mobileOtpCookie } from "@/lib/mobileOtp";

export async function POST(request: NextRequest) {
  const { mobile } = await request.json();
  const cleanMobile = String(mobile ?? "").replace(/\D/g, "");

  if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
    return NextResponse.json({ success: false, message: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  const { code, token } = await createOtpChallenge(cleanMobile);
  const cookieStore = await cookies();
  cookieStore.set(mobileOtpCookie, token, {
    httpOnly: true,
    maxAge: 60 * 5,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (sid && authToken && from) {
    const branding = await getStoreBranding();
    const credentials = Buffer.from(`${sid}:${authToken}`).toString("base64");
    const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `+91${cleanMobile}`,
        From: from,
        Body: `Your ${branding.name} verification code is ${code}. It expires in 5 minutes.`,
      }),
    });

    if (!smsResponse.ok) {
      return NextResponse.json({ success: false, message: "We could not send the OTP. Please try again." }, { status: 502 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ success: false, message: "OTP delivery is not configured yet." }, { status: 503 });
  }

  return NextResponse.json({
    success: true,
    message: "OTP sent successfully.",
    ...(process.env.NODE_ENV !== "production" ? { developmentOtp: code } : {}),
  });
}
