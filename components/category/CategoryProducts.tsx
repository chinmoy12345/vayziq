import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/components/product/ProductCard";

interface CategoryProductsProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export default function CategoryProducts({
  products,
  columns = 4,
}: CategoryProductsProps) {
  return (
    <div
      id="category-products"
      className="w-full"
    >
      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <ProductGrid
        products={products}
        columns={columns}
      />

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {products.length === 0 && (
        <div
          className="
            flex
            min-h-[320px]
            items-center
            justify-center
            border
            border-[#E8DADA]
            bg-[#FFFDFC]
          "
        >
          <div className="px-6 text-center">

            <p
              className="
                font-serif
                text-2xl
                text-[#2B2525]
              "
            >
              No products found
            </p>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#8A7777]
              "
            >
              Try changing your filters or search criteria.
            </p>

          </div>
        </div>
      )}
    </div>
  );
}