"use client";

import { useCallback, useState } from "react";

type ProgressiveImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

/**
 * Keeps dynamic upload URLs compatible while giving product images a stable,
 * lightweight loading state instead of a spinner.
 */
export default function ProgressiveImage(props: ProgressiveImageProps) {
  return <ProgressiveImageContent key={props.src} {...props} />;
}

function ProgressiveImageContent({
  src,
  alt,
  className = "",
  loading = "lazy",
}: ProgressiveImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageRef = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#F8EFEC]">
      {!loaded && !failed && <span aria-hidden="true" className="absolute inset-0 animate-[shimmer_1.35s_infinite] bg-gradient-to-r from-[#F3E8E5] via-[#FFFDFC] to-[#F3E8E5] bg-[length:200%_100%] motion-reduce:animate-none" />}
      {failed && <span className="sr-only">{alt}: Image unavailable</span>}
      {/* Dynamic database image paths may be local uploads or externally hosted. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={src} alt={alt} loading={loading} decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} style={{ opacity: loaded && !failed ? 1 : 0 }} className={`${className} relative text-transparent transition-opacity duration-300 motion-reduce:transition-none`} />
    </div>
  );
}
