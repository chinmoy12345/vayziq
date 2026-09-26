import Link from "next/link";

export default function SareeHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8EFEC]">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HERO
        ===================================================== */}

        <div className="grid min-h-[360px] md:min-h-[390px] lg:grid-cols-2">

          {/* ===================================================
              LEFT CONTENT
          =================================================== */}

          <div
            className="
              relative
              z-10
              flex
              items-center
              px-6
              py-14
              sm:px-10
              lg:px-12
              xl:px-16
            "
          >

            {/* Decorative Line */}

            <div
              className="
                absolute
                left-6
                top-8
                h-px
                w-14
                bg-[#B56F6F]
                sm:left-10
                lg:left-12
                xl:left-16
              "
            />

            <div className="max-w-xl">

              {/* Label */}

              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  tracking-[0.3em]
                  text-[#B56F6F]
                "
              >
                THE SAREE EDIT
              </p>

              {/* Heading */}

              <h1
                className="
                  font-serif
                  text-5xl
                  leading-[0.95]
                  text-[#2B2525]
                  sm:text-6xl
                  lg:text-[64px]
                "
              >
                Sarees
              </h1>

              {/* Sub Heading */}

              <p
                className="
                  mt-3
                  max-w-md
                  font-serif
                  text-xl
                  leading-tight
                  text-[#3B3333]
                  sm:text-2xl
                "
              >
                Timeless elegance,
                <br />
                beautifully draped.
              </p>

              {/* Description */}

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-[#756565]
                "
              >
                From everyday grace to festive glamour,
                explore our exclusive saree collection
                designed for every you.
              </p>

              {/* CTA */}

              <Link
                href="#saree-products"
                className="
                  mt-7
                  inline-flex
                  h-11
                  items-center
                  gap-4
                  bg-[#B56F6F]
                  px-6
                  text-[10px]
                  font-semibold
                  tracking-[0.15em]
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#9F5E5E]
                  hover:shadow-lg
                "
              >
                SHOP SAREES

                <span className="text-sm">
                  →
                </span>
              </Link>

            </div>
          </div>

          {/* ===================================================
              RIGHT IMAGE
          =================================================== */}

          <div
            className="
              relative
              min-h-[330px]
              overflow-hidden
              md:min-h-[390px]
            "
          >

            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=90"
              alt="Saree collection"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
              "
            />

            {/* Image Overlay */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-[#F8EFEC]/30
                via-transparent
                to-[#3B2525]/10
              "
            />

            {/* =================================================
                SIDE TEXT
            ================================================= */}

            <div
              className="
                absolute
                right-6
                top-1/2
                hidden
                -translate-y-1/2
                sm:right-8
                md:block
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  text-center
                "
              >

                <span
                  className="
                    font-serif
                    text-lg
                    italic
                    text-[#3B3333]
                  "
                >
                  Sarees
                </span>

                <span
                  className="
                    mt-1
                    font-serif
                    text-lg
                    italic
                    text-[#3B3333]
                  "
                >
                  for every
                </span>

                <span
                  className="
                    font-serif
                    text-lg
                    italic
                    text-[#3B3333]
                  "
                >
                  story
                </span>

                <span
                  className="
                    mt-5
                    h-px
                    w-10
                    bg-[#8F6D6D]
                  "
                />

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}