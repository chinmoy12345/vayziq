export type ProductVideoSource = {
  kind: "file" | "youtube" | "vimeo";
  sourceUrl: string;
  embedUrl?: string;
};

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

export function parseProductVideoUrl(value: unknown): ProductVideoSource | null {
  const sourceUrl = typeof value === "string" ? value.trim() : "";
  if (!sourceUrl) return null;

  if (/^\/uploads\/products\/[a-zA-Z0-9._-]+\.(mp4|webm|ogg)$/i.test(sourceUrl)) {
    return { kind: "file", sourceUrl };
  }
  if (/^\/api\/reel-media\/[0-9a-f-]+\.(mp4|webm)$/i.test(sourceUrl)) {
    return { kind: "file", sourceUrl };
  }

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.has(host)) {
    const id = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
    if (!id || !/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return null;
    return {
      kind: "youtube",
      sourceUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    };
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|$)/)?.[1];
    if (!id) return null;
    return {
      kind: "vimeo",
      sourceUrl,
      embedUrl: `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0`,
    };
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: "file", sourceUrl };
  return null;
}
