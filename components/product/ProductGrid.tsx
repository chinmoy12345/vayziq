import ProductCard, {
  Product,
} from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function ProductGrid({
  products,
  columns = 3,
  className = "",
}: ProductGridProps) {
  const gridColumns = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center border border-[#E8DADA] bg-[#FFFDFC]">
        <div className="text-center">
          <p className="font-serif text-xl text-[#3B3333]">
            No products found
          </p>

          <p className="mt-2 text-sm text-[#9A8888]">
            Try changing your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        grid
        ${gridColumns[columns]}
        ${className}
        gap-x-4
        gap-y-10
        sm:gap-x-5
        sm:gap-y-12
      `}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}
