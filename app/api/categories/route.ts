import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ======================================================
// GET /api/categories
// Public API
//
// Examples:
//
// /api/categories
// /api/categories?status=active
// /api/categories?status=inactive
// /api/categories?featured=true
// /api/categories?featured=false
// /api/categories?search=saree
// ======================================================

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const status =
      searchParams.get("status");

    const featuredParam =
      searchParams.get("featured");

    const search =
      searchParams.get("search");

    const canViewAll = await requireAdminPermission("categories", "view");
    const where: {
      status?: "active" | "inactive";
      featured?: boolean;
      name?: {
        contains: string;
        mode: "insensitive";
      };
    } = {};

    // --------------------------------------------------
    // Status filter
    // --------------------------------------------------

    if (canViewAll && (status === "active" || status === "inactive")) {
      where.status = status;
    } else if (!canViewAll) {
      where.status = "active";
    }

    // --------------------------------------------------
    // Featured filter
    // --------------------------------------------------

    if (featuredParam === "true") {
      where.featured = true;
    }

    if (featuredParam === "false") {
      where.featured = false;
    }

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    // --------------------------------------------------
    // Fetch categories
    // --------------------------------------------------

    const categories =
      await prisma.category.findMany({
        where,
        include: { parent: { select: { id: true, name: true, slug: true } } },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch categories.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// POST /api/categories
// Admin / Super Admin only
// ======================================================

export async function POST(
  request: NextRequest
) {
  if (!(await requireAdminPermission("categories","create"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    // --------------------------------------------------
    // Authentication
    // --------------------------------------------------

    /*const user = await requireAdmin();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }*/

    // --------------------------------------------------
    // Request body
    // --------------------------------------------------

    const body = await request.json();

    // --------------------------------------------------
    // Name
    // --------------------------------------------------

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    // --------------------------------------------------
    // Description
    // --------------------------------------------------

    const description =
      typeof body.description === "string" &&
      body.description.trim()
        ? body.description.trim()
        : null;

    // --------------------------------------------------
    // Image
    // --------------------------------------------------

    const image =
      typeof body.image === "string" &&
      body.image.trim()
        ? body.image.trim()
        : null;

    // --------------------------------------------------
    // Status
    // --------------------------------------------------

    const status =
      body.status === "inactive"
        ? "inactive"
        : "active";

    // --------------------------------------------------
    // Featured
    // --------------------------------------------------

    const featured =
      typeof body.featured === "boolean"
        ? body.featured
        : false;

    // --------------------------------------------------
    // Sort order
    // --------------------------------------------------

    const sortOrder =
      Number.isInteger(body.sortOrder)
        ? body.sortOrder
        : 0;

    const parentId = body.parentId == null || body.parentId === ""
      ? null
      : Number(body.parentId);

    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0)) {
      return NextResponse.json({ success: false, message: "Choose a valid parent category." }, { status: 400 });
    }

    if (parentId !== null) {
      const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { parentId: true } });
      if (!parent || parent.parentId !== null) {
        return NextResponse.json({ success: false, message: "Subcategories can only be one level deep. Choose a top-level category." }, { status: 400 });
      }
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name cannot exceed 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // Generate slug from name
    // --------------------------------------------------

    const slug = createSlug(name);

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate a valid URL slug.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // Duplicate slug check
    // --------------------------------------------------

    const existing =
      await prisma.category.findUnique({
        where: {
          slug,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------
    // Create category
    // --------------------------------------------------

    const category =
      await prisma.category.create({
        data: {
          name,
          slug,
          description,
          image,
          status,
          featured,
          sortOrder,
          parentId,
        },
      });

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Category created successfully.",
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create category.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// SLUG GENERATOR
// ======================================================

function createSlug(
  value: string
): string {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}
