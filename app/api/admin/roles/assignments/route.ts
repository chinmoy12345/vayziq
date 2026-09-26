import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import prisma from "@/lib/db";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function PUT(request: Request) {
  const actor = await requireSuperAdmin();
  if (!actor) return NextResponse.json({ success: false, message: "Super-admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const userId = Number(body?.userId);
  const roleIds = Array.isArray(body?.roleIds) && body.roleIds.every((id: unknown) => Number.isInteger(id) && Number(id) > 0) ? [...new Set<number>(body.roleIds)] : null;
  if (!Number.isInteger(userId) || userId < 1 || !roleIds) return NextResponse.json({ success: false, message: "Choose valid user roles." }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true, roles: { select: { role: { select: { slug: true } } } } } });
  if (!target) return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
  if (target.status !== "active" && roleIds.length > 0) return NextResponse.json({ success: false, message: "Activate this account before assigning staff roles." }, { status: 400 });
  const roles = await prisma.role.findMany({ where: { id: { in: roleIds } }, select: { id: true, slug: true } });
  if (roles.length !== roleIds.length) return NextResponse.json({ success: false, message: "One or more roles do not exist." }, { status: 400 });
  if (userId !== Number(actor.sub) && roles.some(role => role.slug === "super-admin")) return NextResponse.json({ success: false, message: "Super Admin cannot be assigned to another account here." }, { status: 400 });
  const currentlySuperAdmin = target.roles.some(item => item.role.slug === "super-admin");
  if (currentlySuperAdmin && !roles.some(role => role.slug === "super-admin")) {
    const count = await prisma.userRole.count({ where: { role: { slug: "super-admin" }, user: { status: "active" } } });
    if (count <= 1) return NextResponse.json({ success: false, message: "At least one Super Admin must remain assigned." }, { status: 409 });
  }
  await prisma.$transaction(async tx => {
    await tx.userRole.deleteMany({ where: { userId } });
    if (roleIds.length) await tx.userRole.createMany({ data: roleIds.map(roleId => ({ userId, roleId })) });
  });
  return NextResponse.json({ success: true, roleIds });
}
