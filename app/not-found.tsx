import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] bg-[#fbfbfb]">
      <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl text-center">

          {/* Small Label */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-[#fbb606]" />

            <span className="text-[10px] font-bold tracking-[0.3em] text-[#b77e00]">
              VAYZIQ
            </span>

            <span className="h-px w-10 bg-[#fbb606]" />
          </div>

          {/* 404 */}
          <div className="relative">
            <p className="text-[120px] font-black leading-none tracking-[-.08em] text-[#fff1c8] sm:text-[180px]">
              404
            </p>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="mt-4 text-3xl font-extrabold text-[#111] sm:text-4xl">
                Oops!
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
            This page is not available.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#756565]">
            The page you are looking for may have been moved, removed, or no longer exists.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#fbb606] px-7 text-[10px] font-bold tracking-[0.16em] text-[#111] transition hover:bg-[#e8a900] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
              BACK TO HOME
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#dedede] bg-white px-7 text-[10px] font-bold tracking-[0.16em] text-[#222] transition hover:border-[#fbb606] sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.7} />
              SHOP COLLECTION
            </Link>

          </div>

          {/* Quick Links */}
          <div className="mt-12 border-t border-[#e8e8e8] pt-7">
            <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#777]">
              EXPLORE
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              <Link
                href="/men"
                className="text-xs text-[#444] transition hover:text-[#b77e00]"
              >
                Men
              </Link>

              <Link
                href="/women"
                className="text-xs text-[#444] transition hover:text-[#b77e00]"
              >
                Women
              </Link>

              <Link
                href="/shop?sort=newest"
                className="text-xs text-[#444] transition hover:text-[#b77e00]"
              >
                New Arrivals
              </Link>

              <Link
                href="/shop"
                className="text-xs text-[#444] transition hover:text-[#b77e00]"
              >
                Shop All
              </Link>

              <Link
                href="/contact"
                className="text-xs text-[#444] transition hover:text-[#b77e00]"
              >
                Contact
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
