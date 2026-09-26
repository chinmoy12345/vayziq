import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const KEY = "product_brands";
type Brand = { id: string; name: string; slug: string; description: string; logo: string; active: boolean };
function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function normalize(value: unknown): Brand | null {
  if (!record(value) || typeof value.id !== "string" || !value.id || value.id.length > 100 ||
    typeof value.name !== "string" || !value.name.trim() || value.name.length > 100 ||
    typeof value.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) || value.slug.length > 120 ||
    typeof value.description !== "string" || value.description.length > 500 ||
    typeof value.logo !== "string" || value.logo.length > 500 ||
    typeof value.active !== "boolean" || (value.logo && !(value.logo.startsWith("/uploads/") || /^https:\/\//i.test(value.logo)))) return null;
  return { id: value.id, name: value.name.trim(), slug: value.slug, description: value.description.trim(), logo: value.logo, active: value.active };
}
export async function GET() {
  if (!(await requireAdminPermission("brands","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const setting = await prisma.storeSetting.findUnique({ where: { key: KEY }, select: { value: true } });
  const brands = Array.isArray(setting?.value) ? setting.value.map(normalize).filter((brand): brand is Brand => brand !== null) : [];
  return NextResponse.json({ success: true, data: brands });
}
export async function PUT(request: Request) {
  if (!(await requireAdminPermission("brands","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as unknown;
  if (!record(body) || !Array.isArray(body.brands) || body.brands.length > 500) return NextResponse.json({ success: false, message: "Provide a valid list of up to 500 brands." }, { status: 400 });
  const brands = body.brands.map(normalize);
  if (brands.some(brand => brand === null)) return NextResponse.json({ success: false, message: "Each brand needs a name, valid URL slug and supported logo path." }, { status: 400 });
  const valid = brands as Brand[];
  if (new Set(valid.map(brand => brand.id)).size !== valid.length || new Set(valid.map(brand => brand.slug)).size !== valid.length) return NextResponse.json({ success: false, message: "Brand IDs and URL slugs must be unique." }, { status: 400 });
  const value = valid as unknown as Prisma.InputJsonValue;
  await prisma.storeSetting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  return NextResponse.json({ success: true, data: valid });
}