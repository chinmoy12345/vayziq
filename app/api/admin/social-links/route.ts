import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import { getSocialLinks, saveSocialLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("settings", "view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ success: true, data: await getSocialLinks() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings", "update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ success: true, data: await saveSocialLinks(await request.json()) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Unable to save social profiles." }, { status: 400 });
  }
}
