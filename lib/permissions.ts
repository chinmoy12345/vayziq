import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

/**
 * Get currently logged-in user ID from JWT cookie
 */
async function getCurrentUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("access_token")?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

/**
 * Check whether current user has a permission
 *
 * Example:
 *
 * hasPermission("categories", "view")
 * hasPermission("categories", "create")
 * hasPermission("products", "delete")
 */
export async function hasPermission(
  module: string,
  action: string
): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return false;
    }

    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, roles: { select: { role: { select: { slug: true } } } } },
    });
    if (!account || account.status !== "active") return false;
    if (account.roles.some(({ role }) => role.slug === "super-admin")) return true;

    const permission =
      await prisma.rolePermission.findFirst({
        where: {
          role: {
            users: {
              some: {
                userId,
              },
            },
          },
          permission: {
            module,
            action,
          },
        },
      });

    return !!permission;
  } catch (error) {
    console.error(
      "HAS PERMISSION ERROR:",
      error
    );

    return false;
  }
}

/**
 * Require permission
 *
 * Returns true if permission exists.
 * Returns false if user is not authorized.
 */
export async function requirePermission(
  module: string,
  action: string
): Promise<boolean> {
  return hasPermission(module, action);
}

/**
 * Check multiple permissions
 *
 * ALL permissions must exist.
 */
export async function hasAllPermissions(
  permissions: Array<{
    module: string;
    action: string;
  }>
): Promise<boolean> {
  for (const permission of permissions) {
    const allowed = await hasPermission(
      permission.module,
      permission.action
    );

    if (!allowed) {
      return false;
    }
  }

  return true;
}

/**
 * Check multiple permissions
 *
 * ANY ONE permission is enough.
 */
export async function hasAnyPermission(
  permissions: Array<{
    module: string;
    action: string;
  }>
): Promise<boolean> {
  for (const permission of permissions) {
    const allowed = await hasPermission(
      permission.module,
      permission.action
    );

    if (allowed) {
      return true;
    }
  }

  return false;
}