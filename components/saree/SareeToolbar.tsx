"use client";

interface SareeToolbarProps {
  productCount?: number;
}

export default function SareeToolbar({
  productCount = 42,
}: SareeToolbarProps) {
  return (
    <div
      className="
        mb-5
        flex
        flex-col
        gap-4
        border-b
        border-[#E8DADA]
        pb-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* =====================================================
          PRODUCT COUNT
      ===================================================== */}

      <div>
        <p
          className="
            font-serif
            text-lg
            italic
            text-[#4F4444]
            sm:text-xl
          "
        >
          {productCount} Products
        </p>
      </div>

      {/* =====================================================
          RIGHT CONTROLS
      ===================================================== */}

      <div className="flex items-center justify-between gap-3 sm:justify-end">

        {/* Mobile Filter */}

        <button
          type="button"
          className="
            flex
            h-10
            items-center
            gap-2
            border
            border-[#E8DADA]
            bg-[#FFFDFC]
            px-4
            text-[10px]
            font-semibold
            tracking-[0.12em]
            text-[#5A4B4B]
            transition
            hover:border-[#B56F6F]
            hover:text-[#B56F6F]
            lg:hidden
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M4 6h16M7 12h10M10 18h4"
              strokeLinecap="round"
            />
          </svg>

          FILTER
        </button>

        {/* =================================================
            SORT
        ================================================= */}

        <div className="flex items-center gap-2">

          <label
            htmlFor="saree-sort"
            className="
              hidden
              text-[10px]
              font-medium
              text-[#6D5B5B]
              sm:block
            "
          >
            Sort by
          </label>

          <div className="relative">

            <select
              id="saree-sort"
              defaultValue="featured"
              className="
                h-10
                min-w-[145px]
                appearance-none
                border
                border-[#E8DADA]
                bg-[#FFFDFC]
                px-4
                pr-9
                text-xs
                text-[#4F4444]
                outline-none
                transition
                focus:border-[#B56F6F]
                sm:min-w-[155px]
              "
            >
              <option value="featured">
                Featured
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="popular">
                Most Popular
              </option>
            </select>

            {/* Select Arrow */}

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-[#8E7777]
              "
              aria-hidden="true"
            >
              <path
                d="m7 9 5 5 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

          </div>

        </div>

      </div>

    </div>
  );
}