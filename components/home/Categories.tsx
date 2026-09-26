import Link from "next/link";
import type { Category } from "@/lib/generated/prisma-suppliers";
import ProgressiveImage from "@/components/ui/ProgressiveImage";

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <section className="bg-[#FFFDFC] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="mb-10 flex items-end justify-between sm:mb-12">

          <div>
            <p
              className="
                mb-3
                text-[10px]
                font-semibold
                tracking-[0.3em]
                text-[#B56F6F]
              "
            >
              SHOP BY CATEGORY
            </p>

            <h2
              className="
                font-serif
                text-3xl
                text-[#2B2525]
                sm:text-4xl
              "
            >
              Find your style
            </h2>
          </div>

          {/* Desktop View All */}

          <Link
            href="/shop"
            className="
              hidden
              text-xs
              font-medium
              tracking-wide
              text-[#6D5B5B]
              transition-colors
              duration-200
              hover:text-[#B56F6F]
              sm:block
            "
          >
            VIEW ALL →
          </Link>

        </div>

        {/* =====================================================
            CATEGORIES
        ===================================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/${category.slug}`}
              className="
                group
                relative
                flex
                min-h-[400px]
                flex-col
                justify-between
                overflow-hidden
                bg-[#EAD8D4]
                sm:min-h-[460px]
              "
            >

              {/* =================================================
                  CATEGORY IMAGE
              ================================================= */}

              <ProgressiveImage
                src={category.image ?? "/logo.png"}
                alt={category.name}
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  object-center
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-105
                "
              />

              {/* =================================================
                  SOFT OVERLAY
              ================================================= */}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />

              {/* =================================================
                  TOP NUMBER
              ================================================= */}

              <div className="relative z-10 flex items-center justify-between p-7">

                <span
                  className="
                    text-[10px]
                    font-medium
                    tracking-[0.2em]
                    text-white/85
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className="
                    h-px
                    w-10
                    bg-white/40
                  "
                />

              </div>

              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="relative z-10 mt-auto p-7">

                <div className="flex items-end justify-between gap-4">

                  <div>

                    <h3
                      className="
                        font-serif
                        text-3xl
                        text-white
                        sm:text-4xl
                      "
                    >
                      {category.name}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-[220px]
                        text-xs
                        leading-5
                        text-white/90
                      "
                    >
                      {category.description}
                    </p>

                  </div>

                  {/* =================================================
                      ARROW
                  ================================================= */}

                  <span
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FFFDFC]
                      text-sm
                      text-[#5A4B4B]
                      shadow-sm
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:bg-[#B56F6F]
                      group-hover:text-white
                    "
                  >
                    →
                  </span>

                </div>

              </div>

            </Link>
          ))}

        </div>

        {/* =====================================================
            MOBILE VIEW ALL
        ===================================================== */}

        <div className="mt-7 sm:hidden">

          <Link
            href="/shop"
            className="
              text-xs
              font-medium
              tracking-wide
              text-[#6D5B5B]
              transition-colors
              duration-200
              hover:text-[#B56F6F]
            "
          >
            VIEW ALL COLLECTIONS →
          </Link>

        </div>

      </div>
    </section>
  );
}
