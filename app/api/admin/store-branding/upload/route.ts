import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const imageExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  if (!(await requireAdminPermission("settings","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !imageExtensions[file.type]) {
      return NextResponse.json({ success: false, message: "Upload a PNG, JPG or WEBP logo." }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: "Logo image must be 2 MB or smaller." }, { status: 400 });
    }

    const directory = path.join(process.cwd(), "public", "uploads", "branding");
    await mkdir(directory, { recursive: true });
    const filename = `logo-${Date.now()}-${crypto.randomUUID()}${imageExtensions[file.type]}`;
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ success: true, image: `/uploads/branding/${filename}` }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Logo upload failed." }, { status: 500 });
  }
}
