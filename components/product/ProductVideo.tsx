import { parseProductVideoUrl } from "@/lib/product-video";

export default function ProductVideo({
  url,
  title,
  poster,
  className = "h-full w-full",
  autoPlay = false,
  controls = true,
  loop = false,
  muted,
  coverEmbed = false,
}: {
  url: string;
  title: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  /** When omitted, autoplay videos start muted for browser compatibility. */
  muted?: boolean;
  /** Crop hosted embeds to fill a vertical reel frame without pillarboxing. */
  coverEmbed?: boolean;
}) {
  const video = parseProductVideoUrl(url);
  if (!video) return null;
  const shouldMute = muted ?? autoPlay;

  if (video.kind === "file") {
    return (
      <video
        className={className}
        controls={controls}
        playsInline
        preload={autoPlay ? "auto" : "metadata"}
        poster={poster}
        aria-label={title}
        autoPlay={autoPlay}
        muted={shouldMute}
        loop={loop}
      >
        <source src={video.sourceUrl} />
        Your browser does not support HTML video.
      </video>
    );
  }

  const embedUrl = new URL(video.embedUrl!);
  if (autoPlay) {
    embedUrl.searchParams.set("autoplay", "1");
  }
  embedUrl.searchParams.set("mute", shouldMute ? "1" : "0");
  if (!controls) embedUrl.searchParams.set("controls", "0");
  if (loop) {
    embedUrl.searchParams.set("loop", "1");
    if (embedUrl.hostname.includes("youtube")) {
      embedUrl.searchParams.set("playlist", embedUrl.pathname.split("/").pop() ?? "");
    }
  }

  return (
    <iframe
      className={coverEmbed ? `${className} !left-1/2 !top-1/2 !h-full !w-[180%] !-translate-x-1/2 !-translate-y-1/2` : className}
      src={embedUrl.toString()}
      title={title}
      loading="lazy"
      allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; clipboard-write"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
