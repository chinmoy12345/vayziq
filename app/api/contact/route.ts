import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: false, message: "Contact form is not configured." }, { status: 501 });
}
