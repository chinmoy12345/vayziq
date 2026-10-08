import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { getHeaderUtility, HEADER_UTILITY_KEY, parseHeaderUtility } from "@/lib/header-utility-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: await getHeaderUtility() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const data = parseHeaderUtility(await request.json());
    await prisma.storeSetting.upsert({ where: { key: HEADER_UTILITY_KEY }, create: { key: HEADER_UTILITY_KEY, value: data }, update: { value: data } });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to save header links." }, { status: 400 });
  }
}
