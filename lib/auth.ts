import { cookies } from "next/headers";
import { verifyToken, type AppJwtPayload } from "@/lib/jwt";
import prisma from "@/lib/db";

export async function getCurrentUser(): Promise<AppJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    return token ? verifyToken(token) : null;
  } catch { return null; }
}

async function getAuthorizationContext(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      status: true,
      roles: {
        select: {
          role: {
            select: {
              slug: true,
              permissions: { select: { permission: { select: { module: true, action: true } } } },
            },
          },
        },
      },
    },
  });
}

function hasGrant(
  roles: NonNullable<Awaited<ReturnType<typeof getAuthorizationContext>>>["roles"],
  module: string,
  action: string,
) {
  return roles.some(({ role }) => role.permissions.some(({ permission }) => permission.module === module && permission.action === action));
}

export async function requireAdmin(): Promise<AppJwtPayload | null> {
  const user = await getCurrentUser();
  const userId = Number(user?.sub);
  if (!user || !Number.isInteger(userId) || userId < 1) return null;
  const account = await getAuthorizationContext(userId);
  if (!account || account.status !== "active") return null;
  const isSuperAdmin = account.roles.some(({ role }) => role.slug === "super-admin");
  return isSuperAdmin || hasGrant(account.roles, "admin", "access") ? user : null;
}

export async function requireSuperAdmin(): Promise<AppJwtPayload | null> {
  const user = await getCurrentUser();
  const userId = Number(user?.sub);
  if (!user || !Number.isInteger(userId) || userId < 1) return null;
  const role = await prisma.userRole.findFirst({
    where: { userId, user: { is: { status: "active" } }, role: { slug: "super-admin" } },
    select: { id: true },
  });
  return role ? user : null;
}

export async function requireAdminPermission(module: string, action: string): Promise<AppJwtPayload | null> {
  const user = await getCurrentUser();
  const userId = Number(user?.sub);
  if (!user || !Number.isInteger(userId) || userId < 1) return null;
  const account = await getAuthorizationContext(userId);
  if (!account || account.status !== "active") return null;
  const isSuperAdmin = account.roles.some(({ role }) => role.slug === "super-admin");
  if (isSuperAdmin) return user;
  if (!hasGrant(account.roles, "admin", "access")) return null;
  return hasGrant(account.roles, module, action) ? user : null;
}
