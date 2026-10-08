import prisma from "@/lib/db";
import { reelMediaExtension } from "@/lib/reel-media";

export const runtime = "nodejs";
type Context = { params: Promise<{ file: string }> };

async function serve(request: Request, { params }: Context, head = false) {
  const { file } = await params;
  const match = /^([0-9a-f]{8}-[0-9a-f-]{27,})\.(mp4|webm|jpg|png|webp)$/.exec(file);
  if (!match) return new Response(null, { status: 404 });
  const media = await prisma.reelMedia.findUnique({ where: { id: match[1] } });
  if (!media) return new Response(null, { status: 404 });
  const kind = media.mimeType.startsWith("video/") ? "video" : "poster";
  if (reelMediaExtension(kind, media.mimeType) !== match[2]) return new Response(null, { status: 404 });
  const bytes = Buffer.from(media.data);
  const common = { "Content-Type": media.mimeType, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" };
  const range = request.headers.get("range");
  if (range && kind === "video") {
    const parts = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!parts) return new Response(null, { status: 416, headers: { ...common, "Content-Range": `bytes */${bytes.length}` } });
    const start = Number(parts[1]);
    const end = parts[2] ? Math.min(Number(parts[2]), bytes.length - 1) : bytes.length - 1;
    if (start >= bytes.length || end < start) return new Response(null, { status: 416, headers: { ...common, "Content-Range": `bytes */${bytes.length}` } });
    const slice = bytes.subarray(start, end + 1);
    return new Response(head ? null : new Uint8Array(slice), { status: 206, headers: { ...common, "Content-Range": `bytes ${start}-${end}/${bytes.length}`, "Content-Length": String(slice.length) } });
  }
  return new Response(head ? null : new Uint8Array(bytes), { headers: { ...common, "Content-Length": String(bytes.length) } });
}

export async function GET(request: Request, context: Context) { return serve(request, context); }
export async function HEAD(request: Request, context: Context) { return serve(request, context, true); }
