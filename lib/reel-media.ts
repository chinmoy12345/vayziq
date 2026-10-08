export const MAX_REEL_VIDEO_BYTES = 30 * 1024 * 1024;
export const MAX_REEL_POSTER_BYTES = 5 * 1024 * 1024;

export type ReelMediaKind = "video" | "poster";

export function reelMediaExtension(kind: ReelMediaKind, mimeType: string): string | null {
  if (kind === "video") return { "video/mp4": "mp4", "video/webm": "webm" }[mimeType] ?? null;
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[mimeType] ?? null;
}

export function validReelMediaBytes(kind: ReelMediaKind, mimeType: string, bytes: Uint8Array) {
  if (!reelMediaExtension(kind, mimeType)) return false;
  if (kind === "video") {
    if (mimeType === "video/mp4") return bytes.length >= 12 && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp";
    return bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  }
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  return bytes.length >= 12 && String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
}
