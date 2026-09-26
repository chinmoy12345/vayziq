"use client";

import { useState } from "react";

/* =========================================================
   PROPS
========================================================= */

interface AddToCartProps {
  productId: number | string;
  productName: string;
  price: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
}

/* =========================================================
   BAG ICON
========================================================= */

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M5 8.5h14l-.8 11H5.8L5 8.5Z"
        strokeLinejoin="round"
      />

      <path
        d="M9 9V6a3 3 0 0 1 6 0v3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   ADD TO CART
========================================================= */

export default function AddToCart({
  productId,
  productName,
  price,
  selectedSize,
  selectedColor,
  quantity: initialQuantity = 1,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [added, setAdded] = useState(false);

  /* ---------------------------------------------------------
     Decrease Quantity
  --------------------------------------------------------- */

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  /* ---------------------------------------------------------
     Increase Quantity
  --------------------------------------------------------- */

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  /* ---------------------------------------------------------
     Add To Cart
  --------------------------------------------------------- */

  const handleAddToCart = () => {
    const cartItem = {
      productId,
      productName,
      price,
      quantity,
      size: selectedSize || null,
      color: selectedColor || null,
    };

    /*
     * Temporary demo behaviour.
     *
     * Later this can be replaced with:
     * - Context API
     * - Zustand
     * - Redux
     * - Database / API
     */

    console.log("Added to cart:", cartItem);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  /* ---------------------------------------------------------
     Buy Now
  --------------------------------------------------------- */

  const handleBuyNow = () => {
    const checkoutItem = {
      productId,
      productName,
      price,
      quantity,
      size: selectedSize || null,
      color: selectedColor || null,
    };

    console.log("Buy now:", checkoutItem);

    /*
     * Later:
     * router.push("/checkout");
     */
  };

  return (
    <div className="mt-7">

      {/* =====================================================
          QUANTITY
      ===================================================== */}

      <div className="flex items-center justify-between">

        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-[#4F4444]
          "
        >
          Quantity
        </span>

        <div
          className="
            flex
            h-11
            items-center
            border
            border-[#E8DADA]
            bg-white
          "
        >

          {/* Minus */}

          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="
              flex
              h-full
              w-10
              items-center
              justify-center
              text-[#5A4B4B]
              transition
              hover:bg-[#F5E9E7]
              hover:text-[#B56F6F]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            −
          </button>

          {/* Quantity */}

          <span
            className="
              flex
              w-10
              justify-center
              text-sm
              font-medium
              text-[#3B3333]
            "
          >
            {quantity}
          </span>

          {/* Plus */}

          <button
            type="button"
            onClick={increaseQuantity}
            aria-label="Increase quantity"
            className="
              flex
              h-full
              w-10
              items-center
              justify-center
              text-[#5A4B4B]
              transition
              hover:bg-[#F5E9E7]
              hover:text-[#B56F6F]
            "
          >
            +
          </button>

        </div>
      </div>

      {/* =====================================================
          SELECTED OPTIONS
      ===================================================== */}

      {(selectedSize || selectedColor) && (
        <div
          className="
            mt-4
            rounded-sm
            bg-[#FAF3F1]
            px-4
            py-3
          "
        >
          <div className="flex flex-wrap gap-x-5 gap-y-1">

            {selectedSize && (
              <p className="text-[11px] text-[#7F6D6D]">
                Size:
                <span className="ml-1 font-medium text-[#3B3333]">
                  {selectedSize}
                </span>
              </p>
            )}

            {selectedColor && (
              <p className="text-[11px] text-[#7F6D6D]">
                Color:
                <span className="ml-1 font-medium text-[#3B3333]">
                  {selectedColor}
                </span>
              </p>
            )}

          </div>
        </div>
      )}

      {/* =====================================================
          ADD TO BAG
      ===================================================== */}

      <button
        type="button"
        onClick={handleAddToCart}
        className="
          mt-4
          flex
          h-14
          w-full
          items-center
          justify-center
          gap-2
          bg-[#B56F6F]
          px-6
          text-[11px]
          font-semibold
          tracking-[0.2em]
          text-white
          shadow-sm
          transition-all
          duration-300
          hover:bg-[#9F5E5E]
          hover:shadow-md
          active:scale-[0.99]
        "
      >
        <BagIcon />

        <span>
          {added ? "ADDED TO BAG ✓" : "ADD TO BAG"}
        </span>
      </button>

      {/* =====================================================
          BUY NOW
      ===================================================== */}

      <button
        type="button"
        onClick={handleBuyNow}
        className="
          mt-3
          flex
          h-14
          w-full
          items-center
          justify-center
          border
          border-[#B56F6F]
          bg-[#FFFDFC]
          px-6
          text-[11px]
          font-semibold
          tracking-[0.2em]
          text-[#B56F6F]
          transition-all
          duration-300
          hover:bg-[#F5E9E7]
          active:scale-[0.99]
        "
      >
        BUY IT NOW
      </button>

      {/* =====================================================
          SHIPPING MESSAGE
      ===================================================== */}

      <div className="mt-5 text-center">
        <p className="text-[10px] tracking-wide text-[#9A8888]">
          Free shipping on orders above ₹999
        </p>
      </div>

    </div>
  );
}