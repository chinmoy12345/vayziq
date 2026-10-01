"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Play, Share2, ShoppingBag, X, Clipboard, MoreHorizontal, MessageCircle, Send, Mail, Sparkles, Volume2, VolumeX } from "lucide-react";
import ProductVideo from "@/components/product/ProductVideo";

type WatchProductSummary = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  comparePrice: number | null;
  image: string;
  likeCount: number;
  shareCount: number;
  reelTitle?: string;
  reelBadge?: "None" | "Trending" | "New" | "Bestseller" | "Must Have";
  reelCta?: string;
};
type WatchProduct = WatchProductSummary & { videoUrl: string };

type EditorialReel = {
  kind: "editorial";
  id: string;
  title: string;
  category: string;
  videoUrl: string;
  image: string;
  source: string;
  sourceUrl: string;
  product?: WatchProductSummary;
};

type ProductReel = { kind: "product"; id: string; product: WatchProduct };
type Reel = EditorialReel | ProductReel;

const EDITORIAL_REELS: EditorialReel[] = [
  {
    kind: "editorial",
    id: "pexels-saree-demo",
    title: "See the drape in motion",
    category: "Demo clip · Saree",
    videoUrl:
      "https://videos.pexels.com/video-files/7184183/7184183-uhd_2160_3840_25fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "Alena Darmel / Pexels",
    sourceUrl:
      "https://www.pexels.com/video/a-woman-standing-while-looking-at-camera-7184183/",
  },
  {
    kind: "editorial",
    id: "youtube-saree-draping",
    title: "Saree draping",
    category: "YouTube Short · Saree",
    videoUrl: "https://www.youtube.com/shorts/lZySSncN8M0",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "Grooming with Utkarsha",
    sourceUrl: "https://www.youtube.com/watch?v=lZySSncN8M0",
  },
  {
    kind: "editorial",
    id: "youtube-saree-pleats",
    title: "Perfect saree pleats",
    category: "YouTube Short · Saree",
    videoUrl: "https://www.youtube.com/shorts/e6qjusAhnGU",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "Grooming with Utkarsha",
    sourceUrl: "https://www.youtube.com/watch?v=e6qjusAhnGU",
  },
  {
    kind: "editorial",
    id: "pexels-saree-walk",
    title: "Saree walk in soft light",
    category: "Style clip · Saree",
    videoUrl: "https://videos.pexels.com/video-files/8240712/8240712-hd_1080_1920_30fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "Anna Tarazevich / Pexels",
    sourceUrl: "https://www.pexels.com/video/a-woman-walking-8240712/",
  },
  {
    kind: "editorial",
    id: "pexels-red-saree",
    title: "Red saree details",
    category: "Style clip · Saree",
    videoUrl: "https://videos.pexels.com/video-files/9328456/9328456-hd_1080_1920_30fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "cottonbro studio / Pexels",
    sourceUrl: "https://www.pexels.com/video/a-woman-in-traditional-indian-clothing-9328456/",
  },
  {
    kind: "editorial",
    id: "pexels-saree-drape",
    title: "Saree drape in motion",
    category: "Style clip · Saree",
    videoUrl: "https://videos.pexels.com/video-files/8491515/8491515-hd_1080_1920_30fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "Thirdman / Pexels",
    sourceUrl: "https://www.pexels.com/video/a-woman-wearing-a-traditional-clothes-8491515/",
  },
  {
    kind: "editorial",
    id: "pexels-blue-saree-style",
    title: "Blue saree styling",
    category: "Style clip · Saree",
    videoUrl: "https://videos.pexels.com/video-files/10271743/10271743-hd_1080_1920_30fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "A frame in motion / Pexels",
    sourceUrl: "https://www.pexels.com/video/a-woman-talking-while-wearing-a-saree-10271743/",
  },
  {
    kind: "editorial",
    id: "pexels-blue-saree-motion",
    title: "Blue saree in motion",
    category: "Style clip · Saree",
    videoUrl: "https://videos.pexels.com/video-files/10271744/10271744-hd_1080_1920_30fps.mp4",
    image: "/uploads/banners/home-saree-editorial.png",
    source: "A frame in motion / Pexels",
    sourceUrl: "https://www.pexels.com/video/a-woman-dancing-while-wearing-a-saree-10271744/",
  },
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function reelTitle(reel: Reel) {
  return reel.kind === "product" ? reel.product.reelTitle || reel.product.name : (reel.product?.reelTitle || reel.product?.name || reel.title);
}

function reelVideoUrl(reel: Reel) {
  return reel.kind === "product" ? reel.product.videoUrl : reel.videoUrl;
}

function reelPoster(reel: Reel) {
  return reel.kind === "product" ? reel.product.image : reel.image;
}

function reelDestination(reel: Reel) {
  const product = reel.kind === "product" ? reel.product : reel.product;
  if (product) return `/product/${product.slug}`;
  const category = (reel.kind === "editorial" ? reel.category : reel.product.category).toLowerCase();
  if (category.includes("saree")) return "/shop?category=sarees";
  if (category.includes("kurti")) return "/shop?category=kurtis";
  if (category.includes("nightwear")) return "/shop?category=nightwear";
  if (category.includes("men")) return "/men";
  if (category.includes("women")) return "/women";
  return "/shop";
}

export default function WatchAndBuy({ products, editorialProducts = [], viewAll = false }: { products: WatchProduct[]; editorialProducts?: WatchProductSummary[]; viewAll?: boolean }) {
  const reels = useMemo<Reel[]>(
    () => [
      ...products.map((product) => ({
        kind: "product" as const,
        id: `product-${product.id}`,
        product,
      })),
      // Legacy editorial clips remain as an empty-state fallback only. Once a
      // product reel exists, Watch & Buy shows the actual VAYZIQ catalogue.
      ...(products.length ? [] : EDITORIAL_REELS.map((reel, index) => ({ ...reel, product: editorialProducts[index] }))),
    ],
    [products, editorialProducts],
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playingReels, setPlayingReels] = useState<string[]>([]);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [engagementCounts, setEngagementCounts] = useState(() => Object.fromEntries([...products, ...editorialProducts].map((product) => [String(product.id), { likeCount: product.likeCount, shareCount: product.shareCount }])));
  const [shareMessage, setShareMessage] = useState("");
  const [sharingProduct, setSharingProduct] = useState<WatchProductSummary | null>(null);
  const [moreShareOpen, setMoreShareOpen] = useState(false);
  const [activeAudience, setActiveAudience] = useState<"women" | "men">("men");
  const [reelsMuted, setReelsMuted] = useState(true);
  const filteredReels = useMemo(() => {
    const matching = reels.filter((reel) => {
      const category = (reel.kind === "product" ? reel.product.category : reel.product?.category ?? reel.category).toLowerCase();
      return activeAudience === "women" ? category.includes("women") : category.includes("men") && !category.includes("women");
    });
    return matching.length ? matching : reels;
  }, [activeAudience, reels]);
  const visibleReels = viewAll ? filteredReels : reels;
  const activeReel = activeIndex === null ? null : visibleReels[activeIndex];
  const activeProduct = activeReel?.kind === "product" ? activeReel.product : activeReel?.kind === "editorial" ? activeReel.product ?? null : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem("tantuka-watch-buy-likes");
        if (saved) setLikedProducts(JSON.parse(saved) as string[]);
        const savedSound = window.localStorage.getItem("vayziq-watch-buy-muted");
        if (savedSound !== null) setReelsMuted(savedSound !== "false");

      } catch {
        // Keep reactions usable when browser storage is disabled.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleReelSound() {
    setReelsMuted((current) => {
      const next = !current;
      try {
        window.localStorage.setItem("vayziq-watch-buy-muted", String(next));
      } catch {
        // The current session still keeps the selected sound preference.
      }
      return next;
    });
  }

  function engagementVisitorId() {
    const key = "tantuka-engagement-visitor";
    let visitorId = window.localStorage.getItem(key);
    if (!visitorId) {
      visitorId = window.crypto.randomUUID();
      window.localStorage.setItem(key, visitorId);
    }
    return visitorId;
  }

  async function sendEngagement(product: WatchProductSummary, action: "like" | "share", liked?: boolean) {
    try {
      const response = await fetch(`/api/products/${product.id}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, liked, visitorId: engagementVisitorId() }),
      });
      if (!response.ok) return;
      const data = await response.json() as { likeCount: number; shareCount: number };
      setEngagementCounts((current) => ({ ...current, [String(product.id)]: data }));
    } catch {
      // The reel remains usable if engagement tracking is temporarily offline.
    }
  }

  function toggleLike(product: WatchProductSummary) {
    const id = String(product.id);
    const liked = !likedProducts.includes(id);
    const next = liked ? [...likedProducts, id] : likedProducts.filter((item) => item !== id);
    setLikedProducts(next);
    try {
      window.localStorage.setItem("tantuka-watch-buy-likes", JSON.stringify(next));
    } catch {
      // Keep the reaction active for this session when browser storage is unavailable.
    }
    void sendEngagement(product, "like", liked);
  }

  function shareProduct(product: WatchProductSummary) {
    setMoreShareOpen(false);
    setSharingProduct(product);
  }

  function recordProductShare(product: WatchProductSummary) {
    void sendEngagement(product, "share");
  }

  async function copyProductLink(product: WatchProductSummary) {
    const url = `${window.location.origin}/product/${product.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      recordProductShare(product);
      setSharingProduct(null);
      setShareMessage("Product link copied");
      window.setTimeout(() => setShareMessage(""), 2200);
    } catch {
      setShareMessage("Could not copy the product link");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  }

  async function shareViaDevice(product: WatchProductSummary) {
    const url = `${window.location.origin}/product/${product.slug}`;
    if (!navigator.share) {
      await copyProductLink(product);
      return;
    }
    try {
      await navigator.share({ title: product.name, url });
      recordProductShare(product);
      setSharingProduct(null);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setShareMessage("Could not open sharing options");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  }

  function openSocialShare(product: WatchProductSummary, network: "whatsapp" | "x" | "facebook" | "telegram" | "email") {
    const url = `${window.location.origin}/product/${product.slug}`;
    const text = `Have a look at ${product.name}`;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const target = network === "whatsapp"
      ? `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
      : network === "x"
        ? `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        : network === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          : network === "telegram"
            ? `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
            : `mailto:?subject=${encodedText}&body=${encodeURIComponent(`${text} ${url}`)}`;
    window.open(target, "_blank", "noopener,noreferrer");
    recordProductShare(product);
    setSharingProduct(null);
    setMoreShareOpen(false);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    // Desktop cards are previews only; videos start only after an explicit click.
    if (window.matchMedia("(min-width: 768px)").matches) {
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      setPlayingReels((current) => {
        const next = new Set(current);
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.reelId;
          if (!id) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) next.add(id);
          else next.delete(id);
        });
        return [...next];
      });
    }, { root: track, threshold: [0, 0.55] });
    track.querySelectorAll<HTMLElement>("[data-reel-id]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    if (activeIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") moveActive(1);
      if (event.key === "ArrowLeft") moveActive(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // The modal is tied to the active reel index; navigation updates that index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, reels.length]);

  function moveActive(direction: number) {
    if (activeIndex === null || visibleReels.length === 0) return;
    setActiveIndex((activeIndex + direction + visibleReels.length) % visibleReels.length);
  }

  function openReel(index: number, reel: Reel) {
    // On mobile, a reel is a direct shopping discovery surface. It never
    // opens a player modal: the tap takes the shopper to its linked product
    // (or the relevant category for editorial-only clips).
    if (window.matchMedia("(max-width: 767px)").matches) {
      window.location.assign(reelDestination(reel));
      return;
    }
    setActiveIndex(index);
  }

  return (
    <section
      aria-labelledby="watch-buy-title"
      className="watch-buy-desktop bg-white py-8 sm:py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-10">
        <header className={viewAll ? "watch-buy-page-header mb-3 bg-white" : "mb-6 flex items-end justify-between gap-4 sm:mb-8"}>
          <div className={viewAll ? "flex items-end justify-between gap-4 pb-4 pt-5" : ""}>
            <div>
              <h2 id="watch-buy-title" className={`${viewAll ? "text-[30px]" : "mt-2 text-3xl"} font-serif text-[#2B2525] sm:text-4xl`}>Watch &amp; Buy</h2>
              <p className="mt-1 max-w-xl text-sm leading-5 text-[#756565]">Watch a look, then explore the piece and its details.</p>
            </div>
            {viewAll && <Sparkles className="mb-1 h-6 w-6 shrink-0 text-[#f5b400]" aria-hidden="true" />}
          </div>
          {!viewAll && <div className="flex items-center gap-2">
            {!viewAll && (
              <Link href="/watch-buy" className="mr-1 text-xs font-semibold text-[#9F5E5E] underline-offset-4 hover:underline sm:mr-3 sm:text-sm">
                View all
              </Link>
            )}
          <div className={`${viewAll ? "hidden" : "hidden sm:flex"} gap-2`}>
            <button
              type="button"
              aria-label="Scroll videos left"
              onClick={() => trackRef.current?.scrollBy({ left: -520, behavior: "smooth" })}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCCBC7] bg-white text-[#493A39] transition hover:bg-[#F4E9E6]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll videos right"
              onClick={() => trackRef.current?.scrollBy({ left: 520, behavior: "smooth" })}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCCBC7] bg-white text-[#493A39] transition hover:bg-[#F4E9E6]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          </div>}
          {viewAll && <nav className="border-t border-[#eee7dc] py-3" aria-label="Watch and Buy category switch">
            <div className="inline-flex rounded-xl border border-[#e7ded2] bg-white p-1.5 shadow-sm">
              {(["men", "women"] as const).map((audience) => <button key={audience} type="button" onClick={() => { setActiveAudience(audience); setActiveIndex(null); }} className={`min-w-[98px] rounded-lg px-5 py-2.5 text-sm font-bold capitalize transition ${activeAudience === audience ? "bg-[#fbb606] text-black shadow-md" : "text-[#5f5750] hover:bg-[#fff4ce] hover:text-[#111]"}`}>{audience}</button>)}
            </div>
          </nav>}
        </header>

        <div
          ref={trackRef}
          className={viewAll
            ? "watch-reel-feed grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
            : "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-5 [scrollbar-width:thin] [scrollbar-color:#D8C8C4_transparent]"}
        >
          {visibleReels.map((reel, index) => {
            const product = reel.kind === "product" ? reel.product : reel.product ?? null;
            // Keep any previously-observed mobile videos from rendering after a
            // resize to desktop, without scheduling a synchronous effect update.
            const isPlaying = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches && activeIndex === null && playingReels.includes(reel.id);
            const discount = product?.comparePrice && product.comparePrice > product.price
              ? Math.round((1 - product.price / product.comparePrice) * 100)
              : 0;
            return (
              <article
                key={reel.id}
                className={viewAll
                  ? "min-w-0 overflow-hidden rounded-xl border border-[#E8DADA] bg-white shadow-sm"
                  : "w-[min(42vw,190px)] shrink-0 snap-start overflow-hidden rounded-xl border border-[#E8DADA] bg-white shadow-sm sm:w-[205px]"}
              >
                <div className="relative">
                  <button
                    type="button"
                    data-reel-id={reel.id}
                    onClick={() => openReel(index, reel)}
                    aria-label={`Open ${reelTitle(reel)}`}
                    className="group relative block aspect-[9/14] w-full overflow-hidden bg-[#2B2525] text-left"
                  >
                    {isPlaying ? (
                      <ProductVideo
                        url={reelVideoUrl(reel)}
                        title={`${reelTitle(reel)} preview`}
                        poster={reelPoster(reel)}
                        autoPlay
                        loop
                        controls={false}
                        muted={reelsMuted}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={reelPoster(reel)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 42vw, 205px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />
                    {viewAll && (
                      <span className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold text-white ${["bg-red-500", "bg-violet-600", "bg-orange-500", "bg-[#2c241e]"][index % 4]}`}>
                        {product?.reelBadge && product.reelBadge !== "None" ? product.reelBadge : ["🔥 Trending", "New", "Bestseller", "Must Have"][index % 4]}
                      </span>
                    )}
                    {viewAll && product && (
                      <span className="absolute right-2 top-14 flex flex-col items-center gap-2 text-white">
                        <span className="flex flex-col items-center gap-0.5"><Heart className="h-4 w-4 fill-white" /><small className="text-[8px] font-semibold">{product.likeCount || "1.2K"}</small></span>
                        <span className="flex flex-col items-center gap-0.5"><MessageCircle className="h-4 w-4" /><small className="text-[8px] font-semibold">230</small></span>
                        <span className="flex flex-col items-center gap-0.5"><Share2 className="h-4 w-4" /><small className="text-[8px] font-semibold">{product.shareCount || "1.1K"}</small></span>
                      </span>
                    )}

                    {!isPlaying && (
                      <span className="watch-play-overlay absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/35 text-white shadow-lg transition group-hover:scale-105 group-hover:bg-[#B56F6F]">
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        </span>
                      </span>
                    )}
                  </button>
                  {isPlaying && (
                    <button
                      type="button"
                      onClick={toggleReelSound}
                      aria-label={reelsMuted ? "Unmute video" : "Mute video"}
                      aria-pressed={!reelsMuted}
                      className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm md:hidden"
                    >
                      {reelsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  )}

                </div>
                <div className="min-h-[166px] p-3 sm:p-4">
                  {product ? (
                    <>
                      <div className="mt-2 flex items-end gap-2">
                        <div className="relative h-9 w-7 shrink-0 overflow-hidden rounded bg-white/20">
                          <Image src={product.image} alt="" fill sizes="28px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 min-h-0 text-xs font-medium leading-4 text-[#332B2B] sm:text-sm">{reelTitle(reel)}</h3>
                          <span className="text-sm font-semibold text-[#2B2525]">{formatPrice(product.price)}</span>
                        </div>
                      </div>
                      {discount > 0 && !viewAll && (
                        <span className="mt-2 inline-flex rounded bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white">
                          {discount}% off
                        </span>
                      )}
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={() => setActiveIndex(null)}
                        className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#B56F6F] px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9E5B5B] sm:text-[11px]"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span className="watch-buy-cta-label">{product.reelCta || "Shop Now"}</span>
                      </Link>
                    </>
                  ) : (
                    <span className="mt-1 block truncate text-[10px] text-[#817575]">
                      {reel.kind === "editorial" ? reel.source : ""}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {shareMessage && <div role="status" className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 rounded-full bg-[#2B2525] px-4 py-2 text-xs text-white shadow-lg">{shareMessage}</div>}
      {sharingProduct && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSharingProduct(null);
          }}
        >
          <section role="dialog" aria-modal="true" aria-label={`Share ${sharingProduct.name}`} className="w-full max-w-[340px] rounded-2xl border border-[#EEE7E4] bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9F5E5E]">Share product</p>
                <p className="mt-1 truncate text-sm font-medium text-[#332B2B]">{sharingProduct.name}</p>
              </div>
              <button type="button" aria-label="Close share options" onClick={() => { setSharingProduct(null); setMoreShareOpen(false); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#766A68] transition hover:bg-[#F8F1EE]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button type="button" onClick={() => openSocialShare(sharingProduct, "whatsapp")} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] transition hover:bg-[#F8F1EE]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F6EF] text-[#159653]"><MessageCircle className="h-5 w-5" /></span>WhatsApp
              </button>
              <button type="button" onClick={() => openSocialShare(sharingProduct, "x")} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] transition hover:bg-[#F8F1EE]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F1F2] text-[#242424]"><span className="text-lg font-medium">𝕏</span></span>X
              </button>
              <button type="button" onClick={() => void copyProductLink(sharingProduct)} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] transition hover:bg-[#F8F1EE]">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F1F2] text-[#403838]"><Clipboard className="h-5 w-5" /></span>Copy link
              </button>
              <button type="button" onClick={() => setMoreShareOpen(open => !open)} aria-expanded={moreShareOpen} className={`flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] transition ${moreShareOpen ? "bg-[#F8F1EE]" : "hover:bg-[#F8F1EE]"}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F1F2] text-[#403838]"><MoreHorizontal className="h-5 w-5" /></span>More
              </button>
            </div>
            {moreShareOpen && <div className="mt-3 border-t border-[#F0E8E5] pt-3"><p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9F5E5E]">More ways to share</p><div className="grid grid-cols-4 gap-2"><button type="button" onClick={() => openSocialShare(sharingProduct, "facebook")} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] hover:bg-[#F8F1EE]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#EEF2FA] font-semibold text-[#4267B2]">f</span>Facebook</button><button type="button" onClick={() => openSocialShare(sharingProduct, "telegram")} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] hover:bg-[#F8F1EE]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF5FB] text-[#229ED9]"><Send className="h-4 w-4" /></span>Telegram</button><button type="button" onClick={() => openSocialShare(sharingProduct, "email")} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] hover:bg-[#F8F1EE]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F1F2] text-[#625958]"><Mail className="h-4 w-4" /></span>Email</button><button type="button" onClick={() => void shareViaDevice(sharingProduct)} className="flex flex-col items-center gap-2 rounded-xl px-1 py-2 text-[10px] text-[#625958] hover:bg-[#F8F1EE]"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0F1F2] text-[#625958]"><Share2 className="h-4 w-4" /></span>Device</button></div></div>}
          </section>
        </div>
      )}
      {activeReel && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 backdrop-blur-[3px] sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveIndex(null);
          }}
        >
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              aria-label="Previous video"
              onClick={() => moveActive(-1)}
              className="absolute left-1 top-[38%] z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-[#B56F6F] sm:left-[-54px] sm:translate-x-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <section
              role="dialog"
              aria-modal="true"
              aria-label={`${reelTitle(activeReel)} video`}
              className="relative w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-[#201B1B] shadow-2xl sm:w-[min(330px,calc(100vw-48px))] sm:rounded-[18px]"
            >
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setActiveIndex(null)}
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#111]/90 text-white shadow-lg transition hover:bg-[#B56F6F]"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleReelSound}
                aria-label={reelsMuted ? "Unmute video" : "Mute video"}
                aria-pressed={!reelsMuted}
                className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition hover:bg-[#B56F6F]"
              >
                {reelsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#201B1B]">
                <ProductVideo
                  key={reelVideoUrl(activeReel)}
                  url={reelVideoUrl(activeReel)}
                  title={`${reelTitle(activeReel)} video`}
                  poster={reelPoster(activeReel)}
                  autoPlay
                  loop
                  muted={reelsMuted}
                  coverEmbed
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {activeProduct && (
                  <div className="absolute right-3 top-16 z-10 flex flex-col items-center gap-3 text-white">
                    <button type="button" aria-label={likedProducts.includes(String(activeProduct.id)) ? `Unlike ${activeProduct.name}` : `Love ${activeProduct.name}`} aria-pressed={likedProducts.includes(String(activeProduct.id))} onClick={() => toggleLike(activeProduct)} className="flex flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-white transition hover:bg-black/25">
                      <Heart className={`h-5 w-5 ${likedProducts.includes(String(activeProduct.id)) ? "fill-[#D78383] text-[#D78383]" : ""}`} />
                      <span className="text-[10px] font-semibold leading-none">{engagementCounts[String(activeProduct.id)]?.likeCount || activeProduct.likeCount || "1.2K"}</span>
                    </button>
                    <Link href={`/product/${activeProduct.slug}#reviews`} onClick={() => setActiveIndex(null)} aria-label={`Read comments for ${activeProduct.name}`} className="flex flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-white transition hover:bg-black/25">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-[10px] font-semibold leading-none">230</span>
                    </Link>
                    <button type="button" aria-label={`Share ${activeProduct.name}`} onClick={() => void shareProduct(activeProduct)} className="flex flex-col items-center gap-0.5 rounded-md px-1 py-0.5 text-white transition hover:bg-black/25">
                      <Share2 className="h-5 w-5" />
                      <span className="text-[10px] font-semibold leading-none">{engagementCounts[String(activeProduct.id)]?.shareCount || activeProduct.shareCount || "1.1K"}</span>
                    </button>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-12 text-white">
                  {activeProduct ? (
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md border border-white/20 bg-white/10">
                        <Image src={activeProduct.image} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <Link href={`/product/${activeProduct.slug}`} onClick={() => setActiveIndex(null)} className="min-w-0 flex-1 rounded focus:outline-none focus:ring-2 focus:ring-white/80">
                        <h3 className="truncate text-[13px] font-medium leading-4 text-white">{activeProduct.name}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-white">{formatPrice(activeProduct.price)}</span>
                          {activeProduct.comparePrice && activeProduct.comparePrice > activeProduct.price && <span className="text-[9px] text-white/55 line-through">{formatPrice(activeProduct.comparePrice)}</span>}
                        </div>
                      </Link>
                      <Link href={`/product/${activeProduct.slug}`} onClick={() => setActiveIndex(null)} aria-label={`Shop ${activeProduct.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FBB606] text-[#171312] transition hover:bg-white">
                        <ShoppingBag className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : activeReel.kind === "editorial" ? (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#F8C24A]">{activeReel.category}</p>
                      <h3 className="mt-0.5 truncate text-sm font-medium text-white">{activeReel.title}</h3>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
            <button
              type="button"
              aria-label="Next video"
              onClick={() => moveActive(1)}
              className="absolute right-1 top-[38%] z-20 flex h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-[#B56F6F] sm:right-[-54px] sm:translate-x-0"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
