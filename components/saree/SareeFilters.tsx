"use client";

import { useState } from "react";
import PriceRangeFields from "@/components/category/PriceRangeFields";

const categories = [
  { name: "All Sarees", count: 42 },
  { name: "Everyday Wear", count: 12 },
  { name: "Festive Wear", count: 10 },
  { name: "Wedding Sarees", count: 8 },
  { name: "Party Wear", count: 12 },
];

const fabrics = [
  { name: "Cotton", count: 12 },
  { name: "Silk", count: 10 },
  { name: "Georgette", count: 8 },
  { name: "Chiffon", count: 6 },
  { name: "Organza", count: 4 },
  { name: "Linen", count: 2 },
];

const colors = [
  { name: "Red", value: "#C62828" },
  { name: "Pink", value: "#E85D75" },
  { name: "Green", value: "#16805B" },
  { name: "Blue", value: "#2856A3" },
  { name: "Yellow", value: "#E5A91A" },
  { name: "Black", value: "#222222" },
  { name: "White", value: "#FFFFFF" },
  { name: "Purple", value: "#76518C" },
];

const occasions = [
  { name: "Casual", count: 12 },
  { name: "Festive", count: 10 },
  { name: "Wedding", count: 8 },
  { name: "Party", count: 12 },
];

export default function SareeFilters() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("All Sarees");

  const [selectedFabrics, setSelectedFabrics] =
    useState<string[]>([]);

  const [selectedColors, setSelectedColors] =
    useState<string[]>([]);

  const [selectedOccasions, setSelectedOccasions] =
    useState<string[]>([]);

  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(5000);

  function toggleValue(
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function clearAll() {
    setSelectedCategory("All Sarees");
    setSelectedFabrics([]);
    setSelectedColors([]);
    setSelectedOccasions([]);
    setMinPrice(500);
    setMaxPrice(5000);
  }

  return (
    <>
      {/* =====================================================
          MOBILE FILTER BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
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
          text-xs
          font-semibold
          tracking-[0.12em]
          text-[#3B3333]
          lg:hidden
        "
      >
        <span>
          FILTERS
        </span>

        <span className="text-[#B56F6F]">
          {mobileOpen ? "−" : "+"}
        </span>
      </button>

      {/* =====================================================
          FILTER SIDEBAR
      ===================================================== */}

      <aside
        className={`
          border
          border-[#E8DADA]
          bg-[#FFFDFC]
          lg:block
          ${mobileOpen ? "block" : "hidden"}
        `}
      >

        {/* ===================================================
            FILTER HEADER
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#E8DADA]
            px-4
            py-4
          "
        >
          <h2
            className="
              font-serif
              text-lg
              text-[#2B2525]
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
              text-[#9A7777]
              transition-colors
              hover:text-[#B56F6F]
            "
          >
            CLEAR ALL
          </button>
        </div>

        <div className="px-4">

          {/* =================================================
              CATEGORY
          ================================================= */}

          <div className="border-b border-[#E8DADA] py-5">

            <h3
              className="
                mb-4
                font-serif
                text-sm
                font-semibold
                text-[#2B2525]
              "
            >
              Category
            </h3>

            <div className="space-y-3">

              {categories.map((category) => (
                <label
                  key={category.name}
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
                      type="radio"
                      name="category"
                      checked={
                        selectedCategory === category.name
                      }
                      onChange={() =>
                        setSelectedCategory(category.name)
                      }
                      className="
                        h-4
                        w-4
                        accent-[#B56F6F]
                      "
                    />

                    <span>
                      {category.name}
                    </span>

                  </span>

                  <span className="text-[#A18E8E]">
                    ({category.count})
                  </span>

                </label>
              ))}

            </div>

          </div>

          {/* =================================================
              PRICE RANGE
          ================================================= */}

          <div className="border-b border-[#E8DADA] py-5">

            <h3
              className="
                mb-5
                font-serif
                text-sm
                font-semibold
                text-[#2B2525]
              "
            >
              Price Range
            </h3>

            <PriceRangeFields min={minPrice} max={maxPrice} maxLimit={5000} onChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }} />
          </div>

          {/* =================================================
              FABRIC
          ================================================= */}

          <div className="border-b border-[#E8DADA] py-5">

            <h3
              className="
                mb-4
                font-serif
                text-sm
                font-semibold
                text-[#2B2525]
              "
            >
              Fabric
            </h3>

            <div className="space-y-3">

              {fabrics.map((fabric) => (
                <label
                  key={fabric.name}
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
                        fabric.name
                      )}
                      onChange={() =>
                        toggleValue(
                          fabric.name,
                          selectedFabrics,
                          setSelectedFabrics
                        )
                      }
                      className="
                        h-4
                        w-4
                        rounded
                        border-[#CDBBBB]
                        accent-[#B56F6F]
                      "
                    />

                    <span>
                      {fabric.name}
                    </span>

                  </span>

                  <span className="text-[#A18E8E]">
                    ({fabric.count})
                  </span>

                </label>
              ))}

            </div>

          </div>

          {/* =================================================
              COLOR
          ================================================= */}

          <div className="border-b border-[#E8DADA] py-5">

            <h3
              className="
                mb-4
                font-serif
                text-sm
                font-semibold
                text-[#2B2525]
              "
            >
              Color
            </h3>

            <div className="space-y-2.5">

              {colors.map((color) => (
                <label
                  key={color.name}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-3
                    text-xs
                    text-[#5F5252]
                  "
                >

                  <input
                    type="checkbox"
                    checked={selectedColors.includes(
                      color.name
                    )}
                    onChange={() =>
                      toggleValue(
                        color.name,
                        selectedColors,
                        setSelectedColors
                      )
                    }
                    className="
                      h-4
                      w-4
                      accent-[#B56F6F]
                    "
                  />

                  <span
                    className="
                      h-4
                      w-4
                      rounded-full
                      border
                      border-[#D6C7C7]
                      shadow-sm
                    "
                    style={{
                      backgroundColor: color.value,
                    }}
                  />

                  <span>
                    {color.name}
                  </span>

                </label>
              ))}

            </div>

          </div>

          {/* =================================================
              OCCASION
          ================================================= */}

          <div className="py-5">

            <h3
              className="
                mb-4
                font-serif
                text-sm
                font-semibold
                text-[#2B2525]
              "
            >
              Occasion
            </h3>

            <div className="space-y-3">

              {occasions.map((occasion) => (
                <label
                  key={occasion.name}
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
                        occasion.name
                      )}
                      onChange={() =>
                        toggleValue(
                          occasion.name,
                          selectedOccasions,
                          setSelectedOccasions
                        )
                      }
                      className="
                        h-4
                        w-4
                        rounded
                        border-[#CDBBBB]
                        accent-[#B56F6F]
                      "
                    />

                    <span>
                      {occasion.name}
                    </span>

                  </span>

                  <span className="text-[#A18E8E]">
                    ({occasion.count})
                  </span>

                </label>
              ))}

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}