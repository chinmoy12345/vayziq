import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getStoreBranding } from "@/lib/store-branding";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdminPermission("settings","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  return NextResponse.json({ success: true, data: await getStoreBranding() });
}

export async function PUT(request: Request) {
  if (!(await requireAdminPermission("settings","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const logo = typeof body?.logo === "string" ? body.logo.trim() : "";
  if (!name || name.length > 80 || !logo || !logo.startsWith("/uploads/")) {
    return NextResponse.json({ success: false, message: "Provide a store name and upload a valid logo image." }, { status: 400 });
  }

  const contact: Record<string, string> = {};
  for (const field of ["email", "phone", "whatsapp", "hours", "address", "pincode"]) {
    if (body?.[field] === undefined) continue;
    const value = typeof body[field] === "string" ? body[field].trim() : "";
    if ((!value && field !== "pincode") || value.length > (field === "address" ? 1000 : 200)
      || (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      || (["phone", "whatsapp"].includes(field) && (!/^[+\d\s()-]+$/.test(value) || !/^\d{10,15}$/.test(value.replace(/\D/g, ""))))
      || (field === "pincode" && value && !/^\d{6}$/.test(value))) {
      return NextResponse.json({ success: false, message: "Please provide a valid " + field + "." }, { status: 400 });
    }
    contact[field] = value;
  }
  await prisma.$transaction([
    ...Object.entries(contact).map(([field, value]) => prisma.storeSetting.upsert({ where: { key: "store_" + field }, update: { value }, create: { key: "store_" + field, value } })),
    prisma.storeSetting.upsert({ where: { key: "store_name" }, update: { value: name }, create: { key: "store_name", value: name } }),
    prisma.storeSetting.upsert({ where: { key: "store_logo" }, update: { value: logo }, create: { key: "store_logo", value: logo } }),
  ]);

  revalidatePath("/", "layout");
  return NextResponse.json({ success: true, data: { name, logo, ...contact } });
}
