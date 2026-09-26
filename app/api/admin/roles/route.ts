import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const catalog = [
  ["admin", "access", "Access Admin"],
  ["dashboard", "view", "View Dashboard"],
  ["orders", "cancel", "Cancel orders"],
  ...["products", "categories", "orders", "inventory", "suppliers", "customers", "coupons", "banners", "reviews", "settings", "roles", "permissions", "blog", "brands", "storefront", "returns", "delivery-zips", "audit"].flatMap(module => [
    [module, "view", "View " + module],
    [module, "create", "Create " + module],
    [module, "update", "Update " + module],
    [module, "delete", "Delete " + module],
  ]),
] as const;

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function cleanRole(value: unknown) {
  if (!isRecord(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const slug = typeof value.slug === "string" ? value.slug.trim().toLowerCase() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const permissionIds = value.permissionIds;
  if (!name || name.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100 || description.length > 500 ||
      !Array.isArray(permissionIds) || permissionIds.some(id => !Number.isInteger(id) || id < 1)) return null;
  return { name, slug, description: description || null, permissionIds: [...new Set(permissionIds as number[])] };
}

export async function GET() {
  if (!(await requireSuperAdmin())) return NextResponse.json({ success: false, message: "Super-admin access required." }, { status: 403 });
  await Promise.all(catalog.map(([module, action, name]) => prisma.permission.upsert({
    where: { module_action: { module, action } }, update: { name }, create: { module, action, name },
  })));
  const [roles, permissions, users] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" }, include: { permissions: { select: { permissionId: true } }, _count: { select: { users: true } } } }),
    prisma.permission.findMany({ orderBy: [{ module: "asc" }, { action: "asc" }] }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 500, select: { id: true, name: true, email: true, status: true, roles: { select: { roleId: true, role: { select: { slug: true } } } } } }),
  ]);
  return NextResponse.json({
    success: true,
    permissions,
    roles: roles.map(role => ({ id: role.id, name: role.name, slug: role.slug, description: role.description, permissionIds: role.slug === "super-admin" ? permissions.map(permission => permission.id) : role.permissions.map(item => item.permissionId), assignedUsers: role._count.users })),
    users: users.map(user => ({ id: user.id, name: user.name, email: user.email, status: user.status, roleIds: user.roles.map(item => item.roleId), isSuperAdmin: user.roles.some(item => item.role.slug === "super-admin") })),
  });
}
export async function POST(request: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ success: false, message: "Super-admin access required." }, { status: 403 });
  const role = cleanRole(await request.json().catch(() => null));
  if (!role) return NextResponse.json({ success: false, message: "Enter a name, valid slug and permission selection." }, { status: 400 });
  if (role.slug === "super-admin") return NextResponse.json({ success: false, message: "This role slug is reserved." }, { status: 400 });
  const permissionCount = await prisma.permission.count({ where: { id: { in: role.permissionIds } } });
  if (permissionCount !== role.permissionIds.length) return NextResponse.json({ success: false, message: "Some selected permissions are invalid." }, { status: 400 });
  try {
    const created = await prisma.$transaction(async tx => {
      const value = await tx.role.create({ data: { name: role.name, slug: role.slug, description: role.description } });
      if (role.permissionIds.length) await tx.rolePermission.createMany({ data: role.permissionIds.map(permissionId => ({ roleId: value.id, permissionId })) });
      return value;
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch { return NextResponse.json({ success: false, message: "A role with that URL slug may already exist." }, { status: 409 }); }
}
export async function PATCH(request: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ success: false, message: "Super-admin access required." }, { status: 403 });
  const body = await request.json().catch(() => null) as unknown;
  const id = isRecord(body) ? body.id : null;
  const role = cleanRole(body);
  if (!Number.isInteger(id) || Number(id) < 1 || !role) return NextResponse.json({ success: false, message: "Invalid role details." }, { status: 400 });
  const existing = await prisma.role.findUnique({ where: { id: Number(id) } });
  if (!existing) return NextResponse.json({ success: false, message: "Role not found." }, { status: 404 });
  if (role.slug === "super-admin" && existing.slug !== "super-admin") return NextResponse.json({ success: false, message: "This role slug is reserved." }, { status: 400 });
  if (existing.slug === "super-admin") return NextResponse.json({ success: false, message: "The built-in Super Admin role cannot be modified." }, { status: 400 });
  const permissionCount = await prisma.permission.count({ where: { id: { in: role.permissionIds } } });
  if (permissionCount !== role.permissionIds.length) return NextResponse.json({ success: false, message: "Some selected permissions are invalid." }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async tx => {
      const value = await tx.role.update({ where: { id: Number(id) }, data: { name: role.name, slug: role.slug, description: role.description } });
      await tx.rolePermission.deleteMany({ where: { roleId: value.id } });
      if (role.permissionIds.length) await tx.rolePermission.createMany({ data: role.permissionIds.map(permissionId => ({ roleId: value.id, permissionId })) });
      return value;
    });
    return NextResponse.json({ success: true, data: updated });
  } catch { return NextResponse.json({ success: false, message: "That role slug may already be in use." }, { status: 409 }); }
}
export async function DELETE(request: Request) {
  if (!(await requireSuperAdmin())) return NextResponse.json({ success: false, message: "Super-admin access required." }, { status: 403 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ success: false, message: "Invalid role." }, { status: 400 });
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) return NextResponse.json({ success: false, message: "Role not found." }, { status: 404 });
  if (role.slug === "super-admin") return NextResponse.json({ success: false, message: "The Super Admin role cannot be removed." }, { status: 400 });
  if (await prisma.userRole.count({ where: { roleId: id } })) return NextResponse.json({ success: false, message: "Remove this role from assigned users before deleting it." }, { status: 409 });
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId: id } }),
    prisma.role.delete({ where: { id } }),
  ]);
  return NextResponse.json({ success: true });
}
