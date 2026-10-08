import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { MAX_REEL_POSTER_BYTES, MAX_REEL_VIDEO_BYTES, reelMediaExtension, validReelMediaBytes, type ReelMediaKind } from "@/lib/reel-media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdminPermission("storefront", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    if ((kind !== "video" && kind !== "poster") || !(file instanceof File)) return NextResponse.json({ message: "Select a video or poster file." }, { status: 400 });
    const mediaKind = kind as ReelMediaKind;
    const extension = reelMediaExtension(mediaKind, file.type);
    const max = mediaKind === "video" ? MAX_REEL_VIDEO_BYTES : MAX_REEL_POSTER_BYTES;
    if (!extension || file.size === 0 || file.size > max) return NextResponse.json({ message: mediaKind === "video" ? "Upload an MP4 or WebM video up to 30 MB." : "Upload a JPG, PNG or WebP poster up to 5 MB." }, { status: 400 });
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validReelMediaBytes(mediaKind, file.type, bytes)) return NextResponse.json({ message: "The file content does not match its format." }, { status: 400 });
    const media = await prisma.reelMedia.create({ data: { mimeType: file.type, data: bytes, size: bytes.length }, select: { id: true } });
    return NextResponse.json({ url: `/api/reel-media/${media.id}.${extension}` });
  } catch {
    return NextResponse.json({ message: "Upload failed. Please try again." }, { status: 500 });
  }
}
