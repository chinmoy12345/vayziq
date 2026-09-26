"use client";

export type SortOption =
  | "featured"
  | "newest"
  | "price-low"
  | "price-high"
  | "popular";

interface CategoryToolbarProps {
  productCount: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export default function CategoryToolbar({
  productCount,
  sortBy,
  onSortChange,
}: CategoryToolbarProps) {
  return (
    <div
      className="
        mb-6
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
          SORT
      ===================================================== */}

      <div className="flex items-center gap-2">

        <label
          htmlFor="category-sort"
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
            id="category-sort"
            value={sortBy}
            onChange={(event) =>
              onSortChange(
                event.target.value as SortOption
              )
            }
            className="
              h-10
              min-w-[155px]
              appearance-none
              border
              border-[#E8DADA]
              bg-[#FFFDFC]
              px-4
              pr-10
              text-xs
              text-[#4F4444]
              outline-none
              transition
              hover:border-[#D7B9B9]
              focus:border-[#B56F6F]
              focus:ring-2
              focus:ring-[#B56F6F]/10
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

          {/* =================================================
              CUSTOM ARROW
          ================================================= */}

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
  );
}