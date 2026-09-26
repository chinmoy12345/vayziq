import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
//import { requireAdmin } from "@/lib/auth";

// ==========================================
// GET /api/categories/:id
// Public
// ==========================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    // --------------------------------------
    // ID
    // --------------------------------------

    const { id } = await context.params;

    const categoryId = Number(id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------
    // Find category
    // --------------------------------------

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    // --------------------------------------
    // Not found
    // --------------------------------------

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (category.status !== "active" && !(await requireAdminPermission("categories", "view"))) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    // --------------------------------------
    // Response
    // --------------------------------------

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "GET CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch category.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// PUT /api/categories/:id
// Admin / Super Admin
// ==========================================

export async function PUT(
  request: NextRequest,
  context: {

    params: Promise<{
      id: string;
    }>;
  }
) {
  if (!(await requireAdminPermission("categories","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    // --------------------------------------
    // Authentication
    // --------------------------------------

   /* const user = await requireAdmin();

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

    // --------------------------------------
    // ID
    // --------------------------------------

    const { id } = await context.params;

    const categoryId = Number(id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------
    // Existing category
    // --------------------------------------

    const existing =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------
    // Request body
    // --------------------------------------

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------
    // Name
    // --------------------------------------

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existing.name;

    // --------------------------------------
    // Description
    // --------------------------------------

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : body.description === null
        ? null
        : existing.description;

    // --------------------------------------
    // Image
    // --------------------------------------

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : body.image === null
        ? null
        : existing.image;

    // --------------------------------------
    // Status
    // --------------------------------------

    const status =
      body.status === "inactive"
        ? "inactive"
        : "active";

    // --------------------------------------
    // Featured
    // --------------------------------------

    const featured =
      typeof body.featured === "boolean"
        ? body.featured
        : existing.featured;

    // --------------------------------------
    // Sort Order
    // --------------------------------------

    const sortOrder =
      Number.isInteger(body.sortOrder)
        ? Number(body.sortOrder)
        : existing.sortOrder;

    const parentId = body.parentId === undefined
      ? existing.parentId
      : body.parentId === null || body.parentId === ""
      ? null
      : Number(body.parentId);

    // --------------------------------------
    // Validation
    // --------------------------------------

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

    if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0 || parentId === categoryId)) {
      return NextResponse.json({ success: false, message: "Choose a valid parent category." }, { status: 400 });
    }

    if (parentId !== null) {
      const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { parentId: true } });
      if (!parent || parent.parentId !== null) {
        return NextResponse.json({ success: false, message: "Subcategories can only be one level deep. Choose a top-level category." }, { status: 400 });
      }
      const childCount = await prisma.category.count({ where: { parentId: categoryId } });
      if (childCount > 0) {
        return NextResponse.json({ success: false, message: "This category already has subcategories and must remain a top-level category." }, { status: 400 });
      }
    }

    // --------------------------------------
    // Generate slug
    // --------------------------------------

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

    // --------------------------------------
    // Duplicate slug
    // --------------------------------------

    const duplicate =
      await prisma.category.findFirst({
        where: {
          slug,
          NOT: {
            id: categoryId,
          },
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another category with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------
    // Update category
    // --------------------------------------

    const category =
      await prisma.category.update({
        where: {
          id: categoryId,
        },

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

    // --------------------------------------
    // Response
    // --------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Category updated successfully.",
      category,
    });
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update category.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE /api/categories/:id
// Admin / Super Admin
// ==========================================

export async function DELETE(
  request: NextRequest,
  context: {

    params: Promise<{
      id: string;
    }>;
  }
) {
  if (!(await requireAdminPermission("categories","delete"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    // --------------------------------------
    // Authentication
    // --------------------------------------

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

    // --------------------------------------
    // ID
    // --------------------------------------

    const { id } = await context.params;

    const categoryId = Number(id);

    if (
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------
    // Check category
    // --------------------------------------

    const existing =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------
    // Delete
    // --------------------------------------

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    // --------------------------------------
    // Response
    // --------------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// Slug Generator
// ==========================================

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
