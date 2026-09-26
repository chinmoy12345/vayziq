import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    // ==============================
    // Read request body
    // ==============================

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const rememberMe =
      body.rememberMe === true;

    // ==============================
    // Validate input
    // ==============================

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // ==============================
    // Find user + RBAC
    // ==============================

    const user = await prisma.user.findUnique({
      where: {
        email,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // ==============================
    // User not found
    // ==============================

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Check account status
    // ==============================

    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account is inactive.",
        },
        { status: 403 }
      );
    }

    // ==============================
    // Verify password
    // ==============================

    const passwordValid =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // ==============================
    // Dynamic RBAC check
    //
    // Required permission:
    //
    // module = admin
    // action = access
    // ==============================

    const canAccessAdmin =
      user.roles.some(
        (userRole) => userRole.role.slug === "super-admin" ||
          userRole.role.permissions.some(
            (rolePermission) =>
              rolePermission.permission.module ===
                "admin" &&
              rolePermission.permission.action ===
                "access"
          )
      );

    // ==============================
    // Admin access denied
    // ==============================

    if (!canAccessAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You are not authorized to access the admin panel.",
        },
        { status: 403 }
      );
    }

    // ==============================
    // Create JWT
    //
    // No role is stored in JWT.
    // RBAC is checked from database.
    // ==============================

    const token = signToken({
      sub: user.id.toString(),
      email: user.email,
    });

    // ==============================
    // Set HttpOnly Cookie
    // ==============================

    const cookieStore = await cookies();

    const maxAge = rememberMe
      ? 60 * 60 * 24 * 30
      : 60 * 60 * 24;

    cookieStore.set(
      "access_token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        path: "/",

        maxAge,
      }
    );

    // ==============================
    // Get assigned roles
    // ==============================

    const roles = user.roles.map(
      (userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        slug: userRole.role.slug,
      })
    );

    // ==============================
    // Success response
    // ==============================

    return NextResponse.json(
      {
        success: true,

        message:
          "Admin login successful.",

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          status: user.status,
          roles,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
