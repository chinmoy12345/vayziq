import Link from "next/link";
import { ArrowLeft, ShoppingBag, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] bg-[#FFFDFC]">
      <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-6 py-20">
        <div className="w-full max-w-2xl text-center">

          {/* Small Label */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-[#DCC5C5]" />

            <span className="text-[10px] font-semibold tracking-[0.3em] text-[#B56F6F]">
              THE SUSMITA COLLECTION
            </span>

            <span className="h-px w-10 bg-[#DCC5C5]" />
          </div>

          {/* 404 */}
          <div className="relative">
            <p className="font-serif text-[120px] leading-none text-[#F1E2E0] sm:text-[180px]">
              404
            </p>

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="mt-4 font-serif text-3xl italic text-[#2B2525] sm:text-4xl">
                Oops!
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-4 font-serif text-3xl text-[#2B2525] sm:text-4xl">
            This page has wandered away.
          </h1>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#756565]">
            The page you are looking for may have been moved, removed,
            or is no longer available.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">

            <Link
              href="/"
              className="inline-flex h-12 w-full items-center justify-center gap-3 bg-[#B56F6F] px-7 text-[10px] font-semibold tracking-[0.16em] text-white transition hover:bg-[#9F5E5E] sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
              BACK TO HOME
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-12 w-full items-center justify-center gap-3 border border-[#DCC5C5] bg-white px-7 text-[10px] font-semibold tracking-[0.16em] text-[#4F4444] transition hover:border-[#B56F6F] hover:text-[#B56F6F] sm:w-auto"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.7} />
              SHOP COLLECTION
            </Link>

          </div>

          {/* Quick Links */}
          <div className="mt-12 border-t border-[#E8DADA] pt-7">
            <p className="mb-4 text-[10px] font-semibold tracking-[0.2em] text-[#9A7777]">
              EXPLORE
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
              <Link
                href="/sarees"
                className="text-xs text-[#5E5050] transition hover:text-[#B56F6F]"
              >
                Sarees
              </Link>

              <Link
                href="/kurtis"
                className="text-xs text-[#5E5050] transition hover:text-[#B56F6F]"
              >
                Kurtis
              </Link>

              <Link
                href="/nightwear"
                className="text-xs text-[#5E5050] transition hover:text-[#B56F6F]"
              >
                Nightwear
              </Link>

              <Link
                href="/shop"
                className="text-xs text-[#5E5050] transition hover:text-[#B56F6F]"
              >
                Shop All
              </Link>

              <Link
                href="/contact"
                className="text-xs text-[#5E5050] transition hover:text-[#B56F6F]"
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