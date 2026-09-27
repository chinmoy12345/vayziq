"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownUp, SlidersHorizontal, X } from "lucide-react";
import CategoryFilters, {
  CategoryFilterConfig,
} from "./CategoryFilters";

import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/components/product/ProductCard";

interface CategoryListingProps {
  products: Product[];
  filters: CategoryFilterConfig;
  productCount?: number;
  initialCategorySlug?: string;
  showFullFilters?: boolean;
  showProductFilters?: boolean;
}

type SortOption =
  | "featured"
  | "newest"
  | "price-low"
  | "price-high"
  | "popular";

const PRODUCTS_PER_BATCH = 12;

export default function CategoryListing({
  products,
  filters,
  productCount,
  initialCategorySlug,
  showFullFilters = false,
  showProductFilters = false,
}: CategoryListingProps) {
  const defaultMaxPrice = Math.max(0, ...products.map(product => Math.ceil(extractPrice(product.price))));
  const filtersEnabled = showFullFilters || showProductFilters;
  const [sortBy, setSortBy] =
    useState<SortOption>("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => { const category = [...(filters.subcategories ?? []), ...(filters.categories ?? [])].find(item => item.slug === initialCategorySlug && initialCategorySlug); return category?.slug ? [category.slug] : []; });
  const [priceRange, setPriceRange] = useState({ min: 0, max: defaultMaxPrice });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_BATCH);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     SORT PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => !filtersEnabled ? products : products.filter((product) => {
    const price = extractPrice(product.price);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.categorySlug ?? product.category) || Boolean(product.parentCategorySlug && selectedCategories.includes(product.parentCategorySlug));
    const matchesSize = selectedSizes.length === 0 || selectedSizes.some((size) => product.filterValues?.sizes.includes(size));
    const matchesColor = selectedColors.length === 0 || selectedColors.some((color) => product.filterValues?.colors.includes(color));
    return matchesCategory && matchesSize && matchesColor && price >= priceRange.min && price <= priceRange.max;
  }), [filtersEnabled, products, priceRange, selectedCategories, selectedColors, selectedSizes]);

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return items.sort(
          (a, b) =>
            extractPrice(a.price) -
            extractPrice(b.price)
        );

      case "price-high":
        return items.sort(
          (a, b) =>
            extractPrice(b.price) -
            extractPrice(a.price)
        );

      case "newest":
        return items.reverse();

      case "popular":
        return items.sort(
          (a, b) =>
            (b.rating ?? 0) -
            (a.rating ?? 0)
        );

      case "featured":
      default:
        return items;
    }
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= sortedProducts.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisibleCount((count) => Math.min(count + PRODUCTS_PER_BATCH, sortedProducts.length));
      },
      { rootMargin: "320px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, sortedProducts.length]);

  const visibleProducts = sortedProducts.slice(0, visibleCount);

  const totalProducts = selectedCategories.length === 0 && priceRange.min === 0 && priceRange.max === defaultMaxPrice && selectedSizes.length === 0 && selectedColors.length === 0 ? (productCount ?? products.length) : filteredProducts.length;

  return (
    <section
      id="category-products"
      className={`bg-[#FFFDFC] ${showFullFilters ? "shop-category-listing" : ""}`}
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-5
          py-8
          sm:px-6
          sm:py-10
          lg:px-8
        "
      >

        {/* =====================================================
            MOBILE FILTER BUTTON
        ===================================================== */}

        {filtersEnabled && <button
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="product-filter-sidebar"
          onClick={() =>
            setMobileFiltersOpen(
              (current) => !current
            )
          }
          className="
            hidden
            mb-5
            flex
            h-11
            w-full
            items-center
            justify-between
            border
            border-[#E8DADA]
            bg-[#FFFDFC]
            px-4
            text-[10px]
            font-semibold
            tracking-[0.12em]
            text-[#3B3333]
            transition
            hover:border-[#B56F6F]
            hover:text-[#B56F6F]
            lg:hidden
          "
        >
          <span>FILTERS</span>

          <span className="text-base text-[#B56F6F]">
            {mobileFiltersOpen ? "−" : "+"}
          </span>
        </button>}

        {/* =====================================================
            MAIN LISTING
        ===================================================== */}

        <div
          className={filtersEnabled ? "grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]" : "block"}
        >

          {/* ===================================================
              SIDEBAR
          =================================================== */}

          {filtersEnabled && <aside
            id="product-filter-sidebar"
            className={`
              ${
                mobileFiltersOpen
                  ? "fixed inset-0 z-[180] block overflow-y-auto bg-white p-5"
                  : "hidden lg:block"
              }
              lg:sticky
              lg:top-24
              lg:z-auto
              lg:self-start
              lg:overflow-visible
              lg:bg-transparent
              lg:p-0
            `}
          >
            <div className="mb-4 flex items-center justify-between lg:hidden"><p className="text-lg font-extrabold text-[#111]">Filters</p><button type="button" onClick={() => setMobileFiltersOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f7f7] text-[#111]" aria-label="Close filters"><X className="h-5 w-5" /></button></div>
            <CategoryFilters
              filters={filters}
              selectedCategories={selectedCategories}
              minPrice={priceRange.min}
              maxPrice={priceRange.max}
              defaultMaxPrice={defaultMaxPrice}
              onCategoriesChange={(categories) => { setSelectedCategories(categories); setVisibleCount(PRODUCTS_PER_BATCH); }}
              onPriceChange={(min, max) => { setPriceRange({ min, max }); setVisibleCount(PRODUCTS_PER_BATCH); }}
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              onSizesChange={(sizes) => { setSelectedSizes(sizes); setVisibleCount(PRODUCTS_PER_BATCH); }}
              onColorsChange={(colors) => { setSelectedColors(colors); setVisibleCount(PRODUCTS_PER_BATCH); }}
              showCategories={showFullFilters || Boolean(filters.subcategories?.length)}
              showFabrics={showFullFilters}
              showOccasions={showFullFilters}
              embedded
            />
          </aside>}

          {/* ===================================================
              PRODUCTS
          =================================================== */}

          <div className="min-w-0">

            {/* =================================================
                TOOLBAR
            ================================================= */}

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

              {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min !== 0 || priceRange.max !== defaultMaxPrice) && <div className="mb-5 flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] font-semibold tracking-[0.12em] text-[#7E6B6B]">FILTERED BY</span>{selectedCategories.map((item) => <FilterChip key={item} label={[...(filters.subcategories ?? []), ...(filters.categories ?? [])].find(option => option.slug === item)?.name ?? item} onRemove={() => setSelectedCategories((current) => current.filter((value) => value !== item))} />)}{selectedSizes.map((item) => <FilterChip key={`size-${item}`} label={`Size: ${item}`} onRemove={() => setSelectedSizes((current) => current.filter((value) => value !== item))} />)}{selectedColors.map((item) => <FilterChip key={`color-${item}`} label={item} onRemove={() => setSelectedColors((current) => current.filter((value) => value !== item))} />)}{(priceRange.min !== 0 || priceRange.max !== defaultMaxPrice) && <FilterChip label={`₹${priceRange.min} – ₹${priceRange.max}`} onRemove={() => setPriceRange({ min: 0, max: defaultMaxPrice })} />}<button type="button" onClick={() => { setSelectedCategories([]); setSelectedSizes([]); setSelectedColors([]); setPriceRange({ min: 0, max: defaultMaxPrice }); }} className="ml-1 text-[10px] font-semibold tracking-wide text-[#B56F6F] hover:underline">CLEAR ALL</button></div>}

              {/* Product Count */}

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
                  {totalProducts} Products
                </p>
              </div>

              {/* Sort */}

              <div className="hidden items-center gap-2 sm:flex">

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
                    onChange={(event) => {
                      setSortBy(event.target.value as SortOption);
                      setVisibleCount(PRODUCTS_PER_BATCH);
                    }}
                    className="
                      h-10
                      min-w-[155px]
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

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            <ProductGrid products={visibleProducts} columns={4} className={showFullFilters ? "shop-product-grid" : undefined} />

            {sortedProducts.length === 0 && <div className="border border-dashed border-[#E8DADA] bg-white px-6 py-16 text-center"><p className="font-serif text-xl text-[#3B3333]">No products found</p><p className="mt-2 text-sm text-[#8A7777]">Try adjusting your filters.</p><button className="mt-5 text-xs font-semibold tracking-wide text-[#B56F6F] hover:underline" onClick={() => { setSelectedCategories([]); setPriceRange({ min: 0, max: defaultMaxPrice }); setSelectedSizes([]); setSelectedColors([]); }} type="button">CLEAR FILTERS</button></div>}

            <div ref={loadMoreRef} className="flex min-h-20 items-center justify-center" aria-live="polite">
              {visibleCount < sortedProducts.length ? <span className="text-xs tracking-wide text-[#8A7777]">Loading more products…</span> : sortedProducts.length > PRODUCTS_PER_BATCH ? <span className="text-xs tracking-wide text-[#8A7777]">You&apos;ve reached the end of the collection.</span> : null}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className="
                hidden
                mt-12
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {/* Previous */}

              <button
                type="button"
                aria-label="Previous page"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#E8DADA]
                  bg-[#FFFDFC]
                  text-sm
                  text-[#8A7777]
                  transition
                  hover:border-[#B56F6F]
                  hover:text-[#B56F6F]
                "
              >
                ‹
              </button>

              {/* Page 1 */}

              <button
                type="button"
                aria-current="page"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#B56F6F]
                  bg-[#B56F6F]
                  text-xs
                  font-medium
                  text-white
                "
              >
                1
              </button>

              {/* Page 2 */}

              <button
                type="button"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#E8DADA]
                  bg-[#FFFDFC]
                  text-xs
                  text-[#5F5252]
                  transition
                  hover:border-[#B56F6F]
                  hover:text-[#B56F6F]
                "
              >
                2
              </button>

              {/* Page 3 */}

              <button
                type="button"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#E8DADA]
                  bg-[#FFFDFC]
                  text-xs
                  text-[#5F5252]
                  transition
                  hover:border-[#B56F6F]
                  hover:text-[#B56F6F]
                "
              >
                3
              </button>

              {/* Dots */}

              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  text-xs
                  text-[#9A8888]
                "
              >
                ...
              </span>

              {/* Last */}

              <button
                type="button"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#E8DADA]
                  bg-[#FFFDFC]
                  text-xs
                  text-[#5F5252]
                  transition
                  hover:border-[#B56F6F]
                  hover:text-[#B56F6F]
                "
              >
                8
              </button>

              {/* Next */}

              <button
                type="button"
                aria-label="Next page"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  border
                  border-[#E8DADA]
                  bg-[#FFFDFC]
                  text-sm
                  text-[#5F5252]
                  transition
                  hover:border-[#B56F6F]
                  hover:text-[#B56F6F]
                "
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>
      {filtersEnabled && <><div className="h-16 lg:hidden" aria-hidden="true" />
        {mobileSortOpen && <div className="fixed inset-x-3 bottom-[76px] z-[170] rounded-xl border border-[#e8e8e8] bg-white p-2 shadow-2xl lg:hidden" role="dialog" aria-label="Sort products">{([['featured', 'Featured'], ['newest', 'Newest'], ['price-low', 'Price: Low to High'], ['price-high', 'Price: High to Low'], ['popular', 'Most Popular']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setSortBy(value); setVisibleCount(PRODUCTS_PER_BATCH); setMobileSortOpen(false); }} className={`flex min-h-11 w-full items-center rounded-lg px-4 text-left text-sm ${sortBy === value ? "bg-[#fff1c8] font-bold text-[#111]" : "text-[#333] hover:bg-[#f7f7f7]"}`}>{label}</button>)}</div>}
        <div className="fixed inset-x-0 bottom-0 z-[165] flex h-[68px] border-t border-[#e8e8e8] bg-white shadow-[0_-5px_18px_rgba(0,0,0,.09)] lg:hidden"><button type="button" onClick={() => setMobileSortOpen(open => !open)} className="flex flex-1 items-center justify-center gap-2 border-r border-[#e8e8e8] text-sm font-bold text-[#111]"><ArrowDownUp className="h-5 w-5 text-[#b77e00]" />Sort<span className="text-[10px] font-normal text-[#777]">{sortBy === "featured" ? "Featured" : sortBy === "newest" ? "Newest" : sortBy === "price-low" ? "Low to High" : sortBy === "price-high" ? "High to Low" : "Popular"}</span></button><button type="button" onClick={() => { setMobileFiltersOpen(true); setMobileSortOpen(false); }} className="flex flex-1 items-center justify-center gap-2 text-sm font-bold text-[#111]"><SlidersHorizontal className="h-5 w-5 text-[#b77e00]" />Filter</button></div>
      </>}
    </section>
  );
}

/* =========================================================
   PRICE HELPER
========================================================= */

function extractPrice(price: string) {
  const numericValue = price
    .replace(/[₹,\s]/g, "")
    .replace(/[^\d.]/g, "");

  const parsed = Number(numericValue);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 rounded-full border border-[#DCCACA] bg-[#F8EFEC] px-3 py-1.5 text-xs text-[#5F5252] transition hover:border-[#B56F6F] hover:text-[#B56F6F]">{label}<span aria-hidden="true">×</span></button>;
}
