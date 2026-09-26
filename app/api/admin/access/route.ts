import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await requireAdmin();
  const userId = Number(user?.sub);
  if (!user || !Number.isInteger(userId)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const assignments = await prisma.userRole.findMany({
    where: { userId, user: { is: { status: "active" } } },
    select: {
      role: {
        select: {
          slug: true,
          permissions: {
            select: { permission: { select: { module: true, action: true } } },
          },
        },
      },
    },
  });
  const isSuperAdmin = assignments.some(({ role }) => role.slug === "super-admin");
  const permissions = [...new Set(assignments.flatMap(({ role }) => role.permissions.map(({ permission }) => `${permission.module}.${permission.action}`)))];
  return NextResponse.json({ success: true, isSuperAdmin, permissions });
}
