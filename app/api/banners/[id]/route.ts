import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { bannerInput } from "@/lib/banner-input";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: NextRequest, { params }: Context) {
  if (!(await requireAdminPermission("banners","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id); if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid banner." }, { status: 400 });
  const banner = await prisma.banner.findUnique({ where: { id } });
  return NextResponse.json({ success: Boolean(banner), data: banner }, { status: banner ? 200 : 404 });
}
export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await requireAdminPermission("banners","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const id = Number((await params).id); if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid banner." }, { status: 400 });
  try { const data = await bannerInput(await request.json()); const result = await prisma.banner.updateMany({ where: { id }, data }); return NextResponse.json({ success: Boolean(result.count) }, { status: result.count ? 200 : 404 }); }
  catch(error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to save." }, { status: 400 }); }
}
