"use client";

import { useEffect, useRef, useState } from "react";
import ProductImageDialog from "./ProductImageDialog";
import ProductVideo from "./ProductVideo";
import ProgressiveImage from "@/components/ui/ProgressiveImage";
import WishlistHeart from "@/components/icons/WishlistHeart";

interface ProductGalleryProps {
  productId: number;
  images: Array<string | { src: string; color?: string }>;
  initialColor?: string;
  name: string;
  badge?: string;
  badgeTone?: string;
  videoUrl?: string | null;
  videoPoster?: string | null;
}

export default function ProductGallery({
  productId,
  images,
  initialColor,
  name,
  badge,
  badgeTone,
  videoUrl,
  videoPoster,
}: ProductGalleryProps) {
  const [wishlist, setWishlist] = useState(false);
  const [wishAnimating, setWishAnimating] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [slide, setSlide] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  const [activeColor, setActiveColor] = useState(initialColor ?? "");
  const normalizedImages = (images ?? []).map((image) => typeof image === "string" ? { src: image, color: undefined } : image);
  const colorImages = activeColor ? normalizedImages.filter((image) => image.color?.toLowerCase() === activeColor.toLowerCase()) : [];
  const galleryImages = colorImages.length ? colorImages : normalizedImages;

  useEffect(() => {
    const changeColor = (event: Event) => {
      const detail = (event as CustomEvent<{ productId: number; color: string }>).detail;
      if (detail?.productId !== productId) return;
      setActiveColor(detail.color);
      setActiveImage(0);
      setSlide(0);
      track.current?.scrollTo({ left: 0, behavior: "smooth" });
    };
    window.addEventListener("vayziq:product-color", changeColor);
    return () => window.removeEventListener("vayziq:product-color", changeColor);
  }, [productId]);

  useEffect(() => {
    const loadWishlist = async () => {
      const response = await fetch("/api/account/wishlist");
      if (!response.ok) return;
      const data = await response.json() as { productIds: number[] };
      setWishlist(data.productIds.includes(productId));
    };
    void loadWishlist();
  }, [productId]);

  const toggleWishlist = async () => {
    const nextValue = !wishlist;
    setWishlist(nextValue);
    setWishAnimating(true);
    window.setTimeout(() => setWishAnimating(false), 450);
    const response = await fetch(nextValue ? "/api/account/wishlist" : `/api/account/wishlist?productId=${productId}`, {
      method: nextValue ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      ...(nextValue ? { body: JSON.stringify({ productId }) } : {}),
    });
    if (!response.ok) {
      setWishlist(!nextValue);
      if (response.status === 401) window.dispatchEvent(new Event("vayziq:open-auth"));
      const data = await response.json().catch(() => null) as { message?: string } | null;
      setWishlistMessage(response.status === 401 ? "Please sign in to save products to your wishlist." : data?.message || "Wishlist could not be updated. Please try again.");
      window.setTimeout(() => setWishlistMessage(null), 3200);
      return;
    }
    setWishlistMessage(nextValue ? "Added to your wishlist" : "Removed from your wishlist");
    window.setTimeout(() => setWishlistMessage(null), 2600);
  };

  /*
   * ---------------------------------------------------------
   * OPEN MODAL
   * ---------------------------------------------------------
   */

  const openGallery = (index: number) => {
    setActiveImage(index);
    setIsModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------
   */

  const closeGallery = () => {
    setIsModalOpen(false);
  };

  if (galleryImages.length === 0 && !videoUrl) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[#F8EFEC]">
        <p className="text-sm text-[#8A7777]">
          Product image unavailable
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =====================================================
          PRODUCT IMAGE GRID
      ===================================================== */}

      <div className="relative overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-[#ece8e4] sm:p-2 sm:shadow-[0_16px_45px_rgba(25,20,18,0.05)]">

        <div ref={track} onScroll={(event) => {
          const element = event.currentTarget;
          setSlide(Math.round(element.scrollLeft / element.clientWidth));
        }} className={`flex snap-x snap-mandatory overflow-x-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:gap-2 ${galleryImages.length + (videoUrl ? 1 : 0) === 1 ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>

          {galleryImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => openGallery(index)}
              className="
                group
                relative
                w-full shrink-0 snap-center
                aspect-[4/5]
                overflow-hidden
                bg-[#F8EFEC]
                text-left
                focus-visible:outline-2 focus-visible:outline-offset-[-4px]
              "
              aria-label={`Open ${name} image ${index + 1}`}
            >

              <ProgressiveImage
                src={image.src}
                alt={`${name} - Image ${index + 1}`}
                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.025]
                "
              />

              {/* =================================================
                  BADGE
              ================================================= */}

              {index === 0 && badge && (
                <span
                  className={`
                    pointer-events-none
                    absolute
                    left-4
                    top-4
                    z-10
                    rounded-full border border-white/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm
                    ${badgeTone === "new" ? "bg-violet-600 text-white" : badgeTone === "sale" ? "bg-orange-500 text-white" : badgeTone === "popular" ? "bg-rose-500 text-white" : badgeTone === "neutral" ? "bg-slate-100 text-slate-700" : "bg-[#292321] text-white"}
                  `}
                >
                  {badge}
                </span>
              )}

            </button>
          ))}

          {videoUrl && (
            <div className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden bg-[#171312]" aria-label={`${name} product video`}>
              <ProductVideo
                url={videoUrl}
                title={`${name} product video`}
                poster={videoPoster || galleryImages[0]?.src}
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">Product video</span>
            </div>
          )}

        </div>
        {galleryImages.length + (videoUrl ? 1 : 0) > 1 && <div className="flex justify-center gap-1 py-3 lg:hidden" aria-label="Product media">
          {Array.from({ length: galleryImages.length + (videoUrl ? 1 : 0) }, (_, index) => <button key={index} type="button" aria-label={index < galleryImages.length ? `Show image ${index + 1}` : "Show product video"} aria-current={slide === index ? "true" : undefined} onClick={() => track.current?.scrollTo({ left: index * track.current.clientWidth, behavior: "smooth" })} className="grid h-7 w-7 place-items-center"><span className={`h-1.5 rounded-full transition-all ${slide === index ? "w-5 bg-black" : "w-1.5 bg-gray-300"}`} /></button>)}
        </div>}

        {/* =====================================================
            WISHLIST
        ===================================================== */}

        <button
          type="button"
          data-wishlist-button
          onClick={() => void toggleWishlist()}
          aria-label={
            wishlist
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          aria-pressed={wishlist}
          className={`
            absolute
            right-2.5
            top-2.5
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/80
            shadow-[0_2px_8px_rgba(0,0,0,0.14)]
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-[#B56F6F]
            hover:text-white
            ${wishlist ? "bg-[#B56F6F] text-white hover:bg-[#9f5e5e]" : "bg-white/95 text-[#5A4B4B]"}
          `}
        >
          <span className={wishAnimating ? "wishlist-heart-pop" : undefined}><WishlistHeart active={wishlist} /></span>
        </button>

      </div>

      {wishlistMessage && (
        <p role="status" className="wishlist-toast fixed bottom-5 right-5 z-[90] rounded-full bg-[#2B2525] px-4 py-3 text-sm font-medium text-white shadow-xl">
          {wishlistMessage}
        </p>
      )}

      {/* =====================================================
          FULL SCREEN IMAGE MODAL
      ===================================================== */}

      {isModalOpen && <ProductImageDialog images={galleryImages.map((image) => image.src)} name={name} active={activeImage} onChange={setActiveImage} onClose={closeGallery} />}
    </>
  );
}
