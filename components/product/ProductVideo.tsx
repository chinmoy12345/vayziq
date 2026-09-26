import { parseProductVideoUrl } from "@/lib/product-video";

export default function ProductVideo({
  url,
  title,
  poster,
  className = "h-full w-full",
  autoPlay = false,
  controls = true,
  loop = false,
}: {
  url: string;
  title: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
}) {
  const video = parseProductVideoUrl(url);
  if (!video) return null;

  if (video.kind === "file") {
    return (
      <video
        className={className}
        controls={controls}
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={title}
        autoPlay={autoPlay}
        muted={autoPlay}
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
    embedUrl.searchParams.set("mute", "1");
  }
  if (!controls) embedUrl.searchParams.set("controls", "0");
  if (loop) {
    embedUrl.searchParams.set("loop", "1");
    if (embedUrl.hostname.includes("youtube")) {
      embedUrl.searchParams.set("playlist", embedUrl.pathname.split("/").pop() ?? "");
    }
  }

  return (
    <iframe
      className={className}
      src={embedUrl.toString()}
      title={title}
      loading="lazy"
      allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; clipboard-write"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
}
