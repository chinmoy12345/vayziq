import Link from "next/link";
import type { Product } from "@/components/product/ProductCard";
import ProductCard from "@/components/product/ProductCard";

export default function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#FFFDFC] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADING
        ===================================================== */}

        <div className="mb-10 text-center sm:mb-12">

          <p
            className="
              mb-3
              text-[10px]
              font-semibold
              tracking-[0.3em]
              text-[#B56F6F]
            "
          >
            JUST IN
          </p>

          <h2
            className="
              font-serif
              text-3xl
              text-[#2B2525]
              sm:text-4xl
            "
          >
            New arrivals
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-lg
              text-sm
              leading-6
              text-[#7A6969]
            "
          >
            Fresh styles carefully selected for the new season.
          </p>

        </div>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-x-4
            gap-y-10
            sm:gap-x-5
            sm:gap-y-12
            lg:grid-cols-4
          "
        >

          {products.map((product) => <ProductCard key={product.id} product={{ ...product, badge: "NEW" }} />)}

        </div>

        {/* =====================================================
            DISCOVER ALL
        ===================================================== */}

        <div className="mt-12 text-center">

          <Link
            href="/shop"
            className="
              inline-flex
              h-12
              items-center
              justify-center
              rounded-full
              border
              border-[#D8BDB9]
              bg-[#FFFDFC]
              px-8
              text-[10px]
              font-semibold
              tracking-[0.16em]
              text-[#5A4B4B]
              transition-all
              duration-300
              hover:border-[#B56F6F]
              hover:bg-[#B56F6F]
              hover:text-white
            "
          >
            DISCOVER ALL
          </Link>

        </div>

      </div>
    </section>
  );
}
