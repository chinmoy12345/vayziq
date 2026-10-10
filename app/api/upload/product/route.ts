import { requireAdminPermission } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  if (!(await requireAdminPermission("products","create")) && !(await requireAdminPermission("products","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });

  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    // 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must be less than 5MB.",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "products"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const extension =
      file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
        ? ".png"
        : ".webp";

    const filename =
      `${Date.now()}-${crypto.randomUUID()}` +
      extension;

    const filePath = path.join(
      uploadDir,
      filename
    );

    const bytes = await file.arrayBuffer();

    await fs.writeFile(
      filePath,
      Buffer.from(bytes)
    );

    const imageUrl =
      `/uploads/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      image: imageUrl,
    });
  } catch (error) {
    console.error(
      "PRODUCT UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}