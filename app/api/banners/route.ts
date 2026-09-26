import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";
import { bannerInput } from "@/lib/banner-input";
export const dynamic = "force-dynamic";
export async function GET() {
  if (!(await requireAdminPermission("banners","view"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ success: true, data: await prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { id: "asc" }] }) });
}
export async function POST(request: NextRequest) {
  if (!(await requireAdminPermission("banners","create"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try { const data = await bannerInput(await request.json()); const banner = await prisma.banner.create({ data }); return NextResponse.json({ success: true, data: banner }, { status: 201 }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Unable to save banner." }, { status: 400 }); }
}
export async function PATCH(request: NextRequest) {
  if (!(await requireAdminPermission("banners","update"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (Array.isArray(body.ids)) {
    const ids = body.ids as number[];
    if (!ids.length || ids.some(id => !Number.isSafeInteger(id)) || new Set(ids).size !== ids.length) return NextResponse.json({ message: "Invalid slide order." }, { status: 400 });
    const banners = await prisma.banner.findMany({ where: { id: { in: ids } }, select: { placement: true } });
    if (banners.length !== ids.length || new Set(banners.map(banner => banner.placement)).size !== 1) return NextResponse.json({ message: "Reorder banners from the same placement only." }, { status: 400 });
    await prisma.$transaction(ids.map((id,sortOrder) => prisma.banner.update({ where: { id }, data: { sortOrder } })));
  } else {
    if (!Number.isInteger(body.id) || typeof body.active !== "boolean") return NextResponse.json({ message: "Invalid banner." }, { status: 400 });
    await prisma.banner.updateMany({ where: { id: body.id }, data: { active: body.active } });
  }
  return NextResponse.json({ success: true });
}
export async function DELETE(request: NextRequest) {
  if (!(await requireAdminPermission("banners","delete"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await request.json(); if (!Number.isInteger(id)) return NextResponse.json({ message: "Invalid banner." }, { status: 400 });
  await prisma.banner.deleteMany({ where: { id } }); return NextResponse.json({ success: true });
}
