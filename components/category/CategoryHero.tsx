import Link from "next/link";

interface CategoryHeroProps {
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  image: string;
  href?: string;
}

export default function CategoryHero({
  title,
  eyebrow,
  subtitle,
  description,
  image,
  href = "#category-products",
}: CategoryHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#F8EFEC]">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HERO GRID
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

            {/* Decorative Top Line */}

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

              {/* =================================================
                  EYEBROW
              ================================================= */}

              <p
                className="
                  mb-4
                  text-[10px]
                  font-semibold
                  tracking-[0.3em]
                  text-[#B56F6F]
                "
              >
                {eyebrow}
              </p>

              {/* =================================================
                  TITLE
              ================================================= */}

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
                {title}
              </h1>

              {/* =================================================
                  SUBTITLE
              ================================================= */}

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
                {subtitle}
              </p>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-[#756565]
                "
              >
                {description}
              </p>

              {/* =================================================
                  CTA
              ================================================= */}

              <Link
                href={href}
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
                SHOP {title.toUpperCase()}

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
              src={image}
              alt={`${title} collection`}
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
                DECORATIVE SIDE TEXT
            ================================================= */}

            <div
              className="
                absolute
                right-6
                top-1/2
                hidden
                -translate-y-1/2
                md:block
                lg:right-8
              "
            >
              <div className="flex flex-col items-center text-center">

                <span
                  className="
                    font-serif
                    text-lg
                    italic
                    text-[#3B3333]
                  "
                >
                  {title}
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