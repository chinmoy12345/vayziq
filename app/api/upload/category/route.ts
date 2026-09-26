import { requireAdminPermission } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  if (!(await requireAdminPermission("categories","create"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No image file provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size cannot exceed 5 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };

    const extension = extensionMap[file.type];

    const randomName = crypto
      .randomBytes(12)
      .toString("hex");

    const fileName = `category-${randomName}.${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "categories"
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const filePath = path.join(
      uploadDirectory,
      fileName
    );

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/categories/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        image: imageUrl,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CATEGORY IMAGE UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      {
        status: 500,
      }
    );
  }
}