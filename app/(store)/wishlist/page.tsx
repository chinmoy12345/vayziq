"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/components/product/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("susmita-wishlist") ?? "[]");
    } catch {
      localStorage.removeItem("susmita-wishlist");
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("susmita-wishlist", JSON.stringify(products));
  }, [products]);

  return (
    <main className="min-h-screen bg-[#FFFDFC]">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <section className="border-b border-[#E8DADA] bg-[#F8EFEC]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">

          <p className="mb-3 text-[10px] font-semibold tracking-[0.3em] text-[#B56F6F]">
            YOUR COLLECTION
          </p>

          <h1 className="font-serif text-5xl leading-none text-[#2B2525] sm:text-6xl">
            Wishlist
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-[#756565]">
            Save the pieces you love and come back to them whenever
            you are ready.
          </p>

        </div>
      </section>

      {/* =====================================================
          WISHLIST CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">

        {products.length > 0 ? (
          <>
            {/* TOP BAR */}

            <div className="mb-8 flex items-center justify-between border-b border-[#E8DADA] pb-5">

              <p className="font-serif text-lg italic text-[#4F4444]">
                {products.length}{" "}
                {products.length === 1
                  ? "Item"
                  : "Items"}
              </p>

              <button
                type="button"
                onClick={() => setProducts([])}
                className="
                  text-[10px]
                  font-semibold
                  tracking-[0.15em]
                  text-[#8E7777]
                  transition
                  hover:text-[#B56F6F]
                "
              >
                CLEAR ALL
              </button>

            </div>

            {/* PRODUCTS */}

            <ProductGrid
              products={products}
              columns={4}
            />

            {/* REMOVE NOTE */}

            <div className="mt-8 text-center">
              <p className="text-xs text-[#9A8888]">
                Tap the heart icon on a product to manage your
                wishlist.
              </p>
            </div>
          </>
        ) : (
          /* =================================================
             EMPTY WISHLIST
          ================================================= */

          <div className="flex min-h-[420px] items-center justify-center border border-[#E8DADA] bg-[#FFFDFC]">

            <div className="max-w-md px-6 text-center">

              {/* HEART */}

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8EFEC]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  className="h-7 w-7 text-[#B56F6F]"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mt-6 font-serif text-2xl text-[#2B2525]">
                Your wishlist is empty
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8A7777]">
                Save your favourite pieces here and find them
                easily whenever you are ready to shop.
              </p>

              <Link
                href="/shop"
                className="
                  mt-7
                  inline-flex
                  h-11
                  items-center
                  gap-4
                  bg-[#B56F6F]
                  px-7
                  text-[10px]
                  font-semibold
                  tracking-[0.15em]
                  text-white
                  transition
                  hover:bg-[#9F5E5E]
                "
              >
                EXPLORE COLLECTION
                <span className="text-sm">→</span>
              </Link>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}
