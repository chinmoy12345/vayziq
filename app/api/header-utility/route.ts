import { NextResponse } from "next/server";
import { getHeaderUtility } from "@/lib/header-utility-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ data: await getHeaderUtility() }, { headers: { "Cache-Control": "no-store" } });
}
