import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/components/product/ProductCard";

const sareeProducts: Product[] = [
  {
    id: 101,
    name: "Floral Print Georgette Saree",
    category: "Saree",
    price: "₹1,299",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    badge: "NEW",
    rating: 4.5,
    reviews: 24,
  },
  {
    id: 102,
    name: "Elegant Silk Saree",
    category: "Saree",
    price: "₹2,499",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    rating: 4.8,
    reviews: 18,
  },
  {
    id: 103,
    name: "Traditional Banarasi Saree",
    category: "Saree",
    price: "₹3,199",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    badge: "BESTSELLER",
    rating: 4.9,
    reviews: 32,
  },
  {
    id: 104,
    name: "Embroidered Organza Saree",
    category: "Saree",
    price: "₹2,299",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    rating: 4.6,
    reviews: 16,
  },
  {
    id: 105,
    name: "Cotton Daily Wear Saree",
    category: "Saree",
    price: "₹999",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    rating: 4.5,
    reviews: 12,
  },
  {
    id: 106,
    name: "Chiffon Party Wear Saree",
    category: "Saree",
    price: "₹1,799",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    badge: "NEW",
    rating: 4.7,
    reviews: 20,
  },
  {
    id: 107,
    name: "Pastel Linen Saree",
    category: "Saree",
    price: "₹1,499",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    rating: 4.6,
    reviews: 14,
  },
  {
    id: 108,
    name: "Festive Designer Saree",
    category: "Saree",
    price: "₹2,999",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=90",
    rating: 4.8,
    reviews: 28,
  },
];

export default function SareeProducts() {
  return (
    <section id="saree-products" className="bg-[#FFFDFC]">

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <ProductGrid
        products={sareeProducts}
        columns={4}
      />

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div className="mt-12 flex items-center justify-center gap-2">

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

        {/* Page 4 */}

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
          4
        </button>

        {/* Page 5 */}

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
          5
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

        {/* Page 8 */}

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

    </section>
  );
}