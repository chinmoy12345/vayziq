import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { emptySizeGuide, parseSizeGuide, sizeGuideKey } from "@/lib/size-guide-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await requireAdminPermission("categories", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const categories = await prisma.category.findMany({ select: { id: true, name: true, parentId: true }, orderBy: { name: "asc" } });
  const requestedId = Number(request.nextUrl.searchParams.get("categoryId"));
  const selected = categories.find(category => category.id === requestedId) || categories[0];
  const setting = selected ? await prisma.storeSetting.findUnique({ where: { key: sizeGuideKey(selected.id) }, select: { value: true } }) : null;
  return NextResponse.json({ categories, categoryId: selected?.id ?? null, guide: parseSizeGuide(setting?.value) || emptySizeGuide() }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdminPermission("categories", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const categoryId = Number(body?.categoryId);
  const guide = parseSizeGuide(body?.guide);
  if (!Number.isSafeInteger(categoryId) || categoryId < 1 || !guide) return NextResponse.json({ message: "Use unique size and measurement names. Fill all measurement cells before publishing." }, { status: 400 });
  if (!(await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }))) return NextResponse.json({ message: "Category not found." }, { status: 404 });
  await prisma.storeSetting.upsert({ where: { key: sizeGuideKey(categoryId) }, create: { key: sizeGuideKey(categoryId), value: guide as unknown as Prisma.InputJsonValue }, update: { value: guide as unknown as Prisma.InputJsonValue } });
  revalidatePath("/", "layout");
  return NextResponse.json({ guide, message: guide.enabled ? "Size guide published." : "Size guide saved as draft." });
}
