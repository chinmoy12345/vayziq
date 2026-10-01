"use client";

import { useState } from "react";
import PriceRangeFields from "./PriceRangeFields";

export interface FilterOption {
  name: string;
  slug?: string;
  count?: number;
}

export interface ColorOption {
  name: string;
  value: string;
}

export interface CategoryFilterConfig {
  categories?: FilterOption[];
  subcategories?: FilterOption[];
  fabrics?: FilterOption[];
  sizes?: FilterOption[];
  occasions?: FilterOption[];
  colors?: ColorOption[];
}

interface CategoryFiltersProps {
  filters: CategoryFilterConfig;
  selectedCategories?: string[];
  minPrice?: number;
  maxPrice?: number;
  defaultMaxPrice?: number;
  onCategoriesChange?: (categories: string[]) => void;
  onPriceChange?: (min: number, max: number) => void;
  selectedSizes?: string[];
  selectedColors?: string[];
  onSizesChange?: (sizes: string[]) => void;
  onColorsChange?: (colors: string[]) => void;
  showCategories?: boolean;
  showFabrics?: boolean;
  showOccasions?: boolean;
  embedded?: boolean;
}

export default function CategoryFilters({
  filters,
  selectedCategories: controlledCategories,
  minPrice: controlledMinPrice,
  maxPrice: controlledMaxPrice,
  defaultMaxPrice = 5000,
  onCategoriesChange,
  onPriceChange,
  selectedSizes: controlledSizes,
  selectedColors: controlledColors,
  onSizesChange,
  onColorsChange,
  showCategories = true,
  showFabrics = true,
  showOccasions = true,
  embedded = false,
}: CategoryFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [selectedFabrics, setSelectedFabrics] =
    useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  const [selectedOccasions, setSelectedOccasions] =
    useState<string[]>([]);

  const [selectedColors, setSelectedColors] =
    useState<string[]>([]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const activeCategories = controlledCategories ?? selectedCategories;
  const activeMinPrice = controlledMinPrice ?? minPrice;
  const activeMaxPrice = controlledMaxPrice ?? maxPrice;
  const activeSizes = controlledSizes ?? selectedSizes;
  const activeColors = controlledColors ?? selectedColors;

  function toggleValue(
    value: string,
    selected: string[],
    setSelected: (value: string[]) => void
  ) {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  }

  function clearAll() {
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedSizes([]);
    setSelectedOccasions([]);
    setSelectedColors([]);
    setMinPrice(0);
    setMaxPrice(defaultMaxPrice);
    onCategoriesChange?.([]);
    onPriceChange?.(0, defaultMaxPrice);
    onSizesChange?.([]);
    onColorsChange?.([]);
  }

  return (
    <>
      {/* =====================================================
          MOBILE FILTER BUTTON
      ===================================================== */}

      {!embedded && <button
        type="button"
        onClick={() => setMobileOpen((current) => !current)}
        className="
          mb-5
          flex
          h-11
          w-full
          items-center
          justify-between
          border
          border-[#e3e3e3]
          bg-white
          px-4
          text-[10px]
          font-semibold
          tracking-[0.12em]
          text-[#111]
          transition
          hover:border-[#111]
          hover:text-[#111]
          lg:hidden
        "
      >
        <span>FILTERS</span>

        <span className="text-base text-[#b77e00]">
          {mobileOpen ? "−" : "+"}
        </span>
      </button>}

      {/* =====================================================
          FILTER SIDEBAR
      ===================================================== */}

      <aside
        className={`
          max-h-[65dvh] overflow-y-auto overscroll-contain
          [scrollbar-gutter:stable] lg:max-h-[calc(100dvh-7rem)]
          border
          border-[#e3e3e3]
          bg-white
          ${embedded ? "block" : `lg:block ${mobileOpen ? "block" : "hidden"}`}
        `}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            sticky top-0 z-10 bg-white
            flex
            items-center
            justify-between
            border-b
            border-[#e3e3e3]
            px-4
            py-4
          "
        >
          <h2
            className="
              font-sans font-extrabold
              text-lg
              text-[#111]
            "
          >
            Filters
          </h2>

          <button
            type="button"
            onClick={clearAll}
            className="
              text-[9px]
              font-semibold
              tracking-[0.12em]
              text-[#777]
              transition
              hover:text-[#b77e00]
            "
          >
            CLEAR ALL
          </button>
        </div>

        <div className="px-4">

          {/* =================================================
              CATEGORY
          ================================================= */}

          {showCategories && ((filters.subcategories?.length ?? 0) > 0 || (filters.categories?.length ?? 0) > 0) && (
            <div className="border-b border-[#e3e3e3] py-5">
              <h3 className="mb-4 font-sans text-sm font-extrabold text-[#111]">{filters.subcategories?.length ? "Shop by category" : "Category"}</h3>
              <div className="space-y-2">
                {(filters.subcategories ?? filters.categories ?? []).map((item) => {
                  const key = item.slug ?? item.name;
                  const categoryItems = filters.subcategories ?? filters.categories ?? [];
                  const allCategoryKey = categoryItems.find((entry) => entry.name.startsWith("All "))?.slug;
                  const isAllCategory = item.name.startsWith("All ");
                  const checked = isAllCategory ? activeCategories.length === 0 || activeCategories.includes(key) : activeCategories.includes(key);
                  return <label key={key} className={`flex cursor-pointer items-center justify-between gap-3 rounded-md py-2 text-xs text-[#5F5252] transition hover:bg-[#F8F3F0] ${item.name.startsWith("All ") ? "px-2.5 font-medium" : "px-2"}`}>
                    <span className="flex items-center gap-2.5"><input type="checkbox" checked={checked} onChange={() => {
                      if (isAllCategory) { setSelectedCategories([]); onCategoriesChange?.([]); return; }
                      const withoutAll = allCategoryKey ? activeCategories.filter((value) => value !== allCategoryKey) : activeCategories;
                      const next = withoutAll.includes(key) ? withoutAll.filter((value) => value !== key) : [...withoutAll, key];
                      setSelectedCategories(next); onCategoriesChange?.(next);
                    }} className="h-4 w-4 accent-[#111]" /><span>{item.name}</span></span>
                    {item.count !== undefined && <span className="text-[11px] tabular-nums text-[#A18E8E]">{item.count}</span>}
                  </label>;
                })}
              </div>
            </div>
          )}

          {/* =================================================
              PRICE
          ================================================= */}

          <div className="border-b border-[#e3e3e3] py-5">

            <h3
              className="
                mb-5
                font-sans
                text-sm
                font-semibold
                text-[#111]
              "
            >
              Price Range
            </h3>

            <PriceRangeFields min={activeMinPrice} max={activeMaxPrice} maxLimit={defaultMaxPrice} onChange={(min, max) => { setMinPrice(min); setMaxPrice(max); onPriceChange?.(min, max); }} />
          </div>

          {/* =================================================
              FABRIC
          ================================================= */}

          {showFabrics && filters.fabrics &&
            filters.fabrics.length > 0 && (
              <div className="border-b border-[#e3e3e3] py-5">

                <h3
                  className="
                    mb-4
                    font-sans
                    text-sm
                    font-semibold
                    text-[#111]
                  "
                >
                  Fabric
                </h3>

                <div className="space-y-3">

                  {filters.fabrics.map((item) => (
                    <label
                      key={item.name}
                      className="
                        flex
                        cursor-pointer
                        items-center
                        justify-between
                        gap-3
                        text-xs
                        text-[#5F5252]
                      "
                    >
                      <span className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(
                            item.name
                          )}
                          onChange={() =>
                            toggleValue(
                              item.name,
                              selectedFabrics,
                              setSelectedFabrics
                            )
                          }
                          className="
                            h-4
                            w-4
                            rounded
                            border-[#CDBBBB]
                            accent-[#111]
                          "
                        />

                        <span>{item.name}</span>

                      </span>

                      {item.count !== undefined && (
                        <span className="text-[#A18E8E]">
                          ({item.count})
                        </span>
                      )}
                    </label>
                  ))}

                </div>
              </div>
            )}

          {/* =================================================
              SIZE
          ================================================= */}

          {filters.sizes &&
            filters.sizes.length > 0 && (
              <div className="border-b border-[#e3e3e3] py-5">

                <h3
                  className="
                    mb-4
                    font-sans
                    text-sm
                    font-semibold
                    text-[#111]
                  "
                >
                  Size
                </h3>

                <div className="flex flex-wrap gap-2">

                  {filters.sizes.map((item) => {
                    const active = activeSizes.includes(
                      item.name
                    );

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() =>
                          toggleValue(
                            item.name,
                            activeSizes,
                            (next) => { setSelectedSizes(next); onSizesChange?.(next); }
                          )
                        }
                        className={`
                          min-w-[42px]
                          border
                          px-3
                          py-2
                          text-[10px]
                          transition
                          ${
                            active
                              ? "border-[#111] bg-[#111] text-white"
                              : "border-[#e3e3e3] bg-white text-[#333] hover:border-[#111] hover:text-[#111]"
                          }
                        `}
                      >
                        {item.name}
                      </button>
                    );
                  })}

                </div>
              </div>
            )}

          {/* =================================================
              COLOR
          ================================================= */}

          {filters.colors &&
            filters.colors.length > 0 && (
              <div className="border-b border-[#e3e3e3] py-5">

                <h3
                  className="
                    mb-4
                    font-sans
                    text-sm
                    font-semibold
                    text-[#111]
                  "
                >
                  Color
                </h3>

                <div className="grid grid-cols-2 gap-3">

                  {filters.colors.map((color) => {
                    const active =
                      activeColors.includes(color.name);

                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() =>
                          toggleValue(
                            color.name,
                            activeColors,
                            (next) => { setSelectedColors(next); onColorsChange?.(next); }
                          )
                        }
                        className={`
                          flex
                          items-center
                          gap-2
                          text-left
                          text-xs
                          text-[#5F5252]
                          ${
                            active
                              ? "font-semibold text-[#111]"
                              : ""
                          }
                        `}
                      >

                        <span
                          className={`
                            h-4
                            w-4
                            rounded-full
                            border
                            ${
                              active
                                ? "border-[#111] ring-2 ring-[#fbb606]/50"
                                : "border-[#d6d6d6]"
                            }
                          `}
                          style={{
                            backgroundColor: color.value,
                          }}
                        />

                        <span>
                          {color.name}
                        </span>

                      </button>
                    );
                  })}

                </div>
              </div>
            )}

          {/* =================================================
              OCCASION
          ================================================= */}

          {showOccasions && filters.occasions &&
            filters.occasions.length > 0 && (
              <div className="py-5">

                <h3
                  className="
                    mb-4
                    font-sans
                    text-sm
                    font-semibold
                    text-[#111]
                  "
                >
                  Occasion
                </h3>

                <div className="space-y-3">

                  {filters.occasions.map((item) => (
                    <label
                      key={item.name}
                      className="
                        flex
                        cursor-pointer
                        items-center
                        justify-between
                        gap-3
                        text-xs
                        text-[#5F5252]
                      "
                    >

                      <span className="flex items-center gap-2">

                        <input
                          type="checkbox"
                          checked={selectedOccasions.includes(
                            item.name
                          )}
                          onChange={() =>
                            toggleValue(
                              item.name,
                              selectedOccasions,
                              setSelectedOccasions
                            )
                          }
                          className="
                            h-4
                            w-4
                            rounded
                            border-[#CDBBBB]
                            accent-[#111]
                          "
                        />

                        <span>{item.name}</span>

                      </span>

                      {item.count !== undefined && (
                        <span className="text-[#A18E8E]">
                          ({item.count})
                        </span>
                      )}

                    </label>
                  ))}

                </div>
              </div>
            )}

        </div>
      </aside>
    </>
  );
}
