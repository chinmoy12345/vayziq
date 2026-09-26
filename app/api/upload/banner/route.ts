import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
export async function POST(request: Request) {
  if (!(await requireAdminPermission("banners","create"))) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || file.size > 2 * 1024 * 1024 || !["image/png","image/jpeg","image/webp"].includes(file.type)) return NextResponse.json({ message: "Upload a JPG, PNG or WebP image up to 2 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const valid = file.type === "image/png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : file.type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP";
  if (!valid) return NextResponse.json({ message: "Invalid image file." }, { status: 400 });
  // Persisted with the banner in PostgreSQL: works on read-only serverless hosts.
  return NextResponse.json({ image: `data:${file.type};base64,${bytes.toString("base64")}` });
}
