import Link from "next/link";
import type { Product } from "@/components/product/ProductCard";
import ProductCard from "@/components/product/ProductCard";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-[#F8F1EF] py-20 sm:py-24">
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
              CURATED FOR YOU
            </p>

            <h2
              className="
                font-serif
                text-3xl
                text-[#2B2525]
                sm:text-4xl
              "
            >
              Featured collection
            </h2>
          </div>

          <Link
            href="/shop"
            className="
              hidden
              text-xs
              font-medium
              tracking-wide
              text-[#6D5B5B]
              transition
              hover:text-[#B56F6F]
              sm:block
            "
          >
            VIEW ALL →
          </Link>

        </div>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4">

          {products.map((product) => <ProductCard key={product.id} product={product} />)}

        </div>

      </div>
    </section>
  );
}
