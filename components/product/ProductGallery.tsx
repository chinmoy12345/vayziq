"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import ProductImageDialog from "./ProductImageDialog";
import ProgressiveImage from "@/components/ui/ProgressiveImage";

interface ProductGalleryProps {
  productId: number;
  images: string[];
  name: string;
  badge?: string;
  badgeTone?: string;
}

export default function ProductGallery({
  productId,
  images,
  name,
  badge,
  badgeTone,
}: ProductGalleryProps) {
  const [wishlist, setWishlist] = useState(false);
  const [wishAnimating, setWishAnimating] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  const galleryImages =
    images && images.length > 0 ? images : [];

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

  if (galleryImages.length === 0) {
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

      <div className="relative">

        <div className="grid grid-cols-2 gap-[2px] bg-white">

          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => openGallery(index)}
              className="
                group
                relative
                aspect-[4/5]
                overflow-hidden
                bg-[#F8EFEC]
                text-left
                focus:outline-none
              "
              aria-label={`Open ${name} image ${index + 1}`}
            >

              <ProgressiveImage
                src={image}
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

        </div>

        {/* =====================================================
            WISHLIST
        ===================================================== */}

        <button
          type="button"
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
            bg-white/95
            shadow-[0_2px_8px_rgba(0,0,0,0.14)]
            backdrop-blur-sm
            transition-all
            duration-300
            hover:bg-[#B56F6F]
            hover:text-white
            ${wishlist ? "bg-[#B56F6F] text-white hover:bg-[#9f5e5e]" : ""}
          `}
        >
          <Heart
            className={`h-5 w-5 transition ${wishAnimating ? "wishlist-heart-pop" : ""} ${
              wishlist
                ? "fill-current text-white"
                : "text-[#4F4444]"
            }`}
            strokeWidth={1.4}
          />
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

      {isModalOpen && <ProductImageDialog images={galleryImages} name={name} active={activeImage} onChange={setActiveImage} onClose={closeGallery} />}
    </>
  );
}
