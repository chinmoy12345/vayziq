import Link from "next/link";
import Image from "next/image";
import type { StoreBranding } from "@/lib/store-branding";

const shopLinks = [
  { name: "Sarees", href: "/sarees" },
  { name: "Kurtis", href: "/kurtis" },
  { name: "Nightwear", href: "/nightwear" },
  { name: "New Arrivals", href: "/shop?sort=newest" },
];

const helpLinks = [
  { name: "Contact Us", href: "/contact" },
  { name: "About Us", href: "/about" },
  { name: "Shipping & Delivery", href: "/shipping" },
  { name: "Returns & Exchange", href: "/returns" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Blog", href: "/blog" },
];

/* =========================================================
   SOCIAL ICONS
========================================================= */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M14 8h3V4h-3c-3.3 0-5 2-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8.5 8.5c.3-.3.6-.3.9 0l.8 1c.2.2.2.5 0 .8l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.3-.2.6-.2.8 0l1 .8c.3.3.3.6 0 .9l-.5.5c-.5.5-1.3.6-2 .3-1.4-.6-3.2-2.4-3.8-3.8-.3-.7-.2-1.5.3-2l.5-.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   FOOTER
========================================================= */

type FooterDisplaySettings = { newsletter: boolean; brand: boolean; shopLinks: boolean; informationLinks: boolean; contact: boolean; bottomBar: boolean };

export default function Footer({ branding, settings }: { branding: StoreBranding; settings: FooterDisplaySettings }) {
  return (
    <footer className="mt-20 bg-[#2B2525] text-[#D8CACA]">

      {/* =====================================================
          FOOTER NEWSLETTER
      ===================================================== */}

      {settings.newsletter && <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">

          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">

            {/* Left */}

            <div>

              <p
                className="
                  mb-2
                  text-[10px]
                  font-semibold
                  tracking-[0.3em]
                  text-[#C58A8A]
                "
              >
                STAY IN TOUCH
              </p>

              <h2
                className="
                  font-serif
                  text-3xl
                  leading-tight
                  text-[#FFFDFC]
                  sm:text-4xl
                "
              >
                Be the first to discover{" "}
                <br className="hidden sm:block" />
                something beautiful.
              </h2>

              <p
                className="
                  mt-4
                  max-w-md
                  text-sm
                  leading-6
                  text-[#A99595]
                "
              >
                Subscribe to receive updates about new collections,
                exclusive offers and special announcements.
              </p>

            </div>

            {/* Newsletter Form */}

            <div className="lg:justify-self-end lg:w-full lg:max-w-lg">

              <form className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="
                    h-12
                    min-h-12
                    w-full
                    min-w-0
                    flex-none
                    rounded-full
                    border
                    border-white/15
                    bg-white/[0.06]
                    px-5
                    text-base
                    text-white
                    outline-none
                    transition
                    placeholder:text-[#8F7D7D]
                    focus:border-[#C58A8A]
                    focus:bg-white/[0.08]
                    sm:flex-1
                    sm:text-sm
                  "
                />

                <button
                  type="submit"
                  className="
                    h-12
                    shrink-0
                    rounded-full
                    bg-[#B56F6F]
                    px-7
                    text-xs
                    font-semibold
                    tracking-[0.12em]
                    text-white
                    transition-all
                    duration-300
                    hover:bg-[#C98282]
                    hover:shadow-lg
                    active:scale-[0.98]
                  "
                >
                  SUBSCRIBE
                </button>

              </form>

            </div>

          </div>

        </div>
      </div>}

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* =================================================
              BRAND
          ================================================= */}

          {settings.brand && <div className="lg:pr-10">

            <Link href="/" className="group inline-flex items-center">
              <Image src={branding.logo} alt={branding.name} width={300} height={100} className="h-auto w-48 object-contain brightness-0 invert transition-opacity group-hover:opacity-80" />
            </Link>

            <p
              className="
                mt-6
                text-sm
                leading-7
                text-[#A99595]
              "
            >
              Timeless fashion, thoughtfully selected for
              everyday elegance and effortless style.
            </p>

            {/* =================================================
                SOCIAL
            ================================================= */}

            <div className="mt-7 flex items-center gap-3">

              <a
                href="#"
                aria-label="Instagram"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  text-[#B9A6A6]
                  transition-all
                  duration-300
                  hover:border-[#B56F6F]
                  hover:bg-[#B56F6F]
                  hover:text-white
                "
              >
                <InstagramIcon />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  text-[#B9A6A6]
                  transition-all
                  duration-300
                  hover:border-[#B56F6F]
                  hover:bg-[#B56F6F]
                  hover:text-white
                "
              >
                <FacebookIcon />
              </a>

              <a
                href="#"
                aria-label="WhatsApp"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  text-[#B9A6A6]
                  transition-all
                  duration-300
                  hover:border-[#B56F6F]
                  hover:bg-[#B56F6F]
                  hover:text-white
                "
              >
                <WhatsAppIcon />
              </a>

            </div>

          </div>}

          {/* =================================================
              SHOP
          ================================================= */}

          {settings.shopLinks && <div>

            <h3
              className="
                mb-6
                text-[10px]
                font-semibold
                tracking-[0.22em]
                text-[#FFFDFC]
              "
            >
              SHOP
            </h3>

            <ul className="space-y-4">

              {shopLinks.map((item) => (
                <li key={item.name}>

                  <Link
                    href={item.href}
                    className="
                      text-sm
                      text-[#A99595]
                      transition-colors
                      duration-200
                      hover:text-[#D99A9A]
                    "
                  >
                    {item.name}
                  </Link>

                </li>
              ))}

            </ul>

          </div>}

          {/* =================================================
              INFORMATION
          ================================================= */}

          {settings.informationLinks && <div>

            <h3
              className="
                mb-6
                text-[10px]
                font-semibold
                tracking-[0.22em]
                text-[#FFFDFC]
              "
            >
              INFORMATION
            </h3>

            <ul className="space-y-4">

              {helpLinks.map((item) => (
                <li key={item.name}>

                  <Link
                    href={item.href}
                    className="
                      text-sm
                      text-[#A99595]
                      transition-colors
                      duration-200
                      hover:text-[#D99A9A]
                    "
                  >
                    {item.name}
                  </Link>

                </li>
              ))}

            </ul>

          </div>}

          {/* =================================================
              CONTACT
          ================================================= */}

          {settings.contact && <div>

            <h3
              className="
                mb-6
                text-[10px]
                font-semibold
                tracking-[0.22em]
                text-[#FFFDFC]
              "
            >
              CONTACT
            </h3>

            <div className="space-y-5 text-sm text-[#A99595]">

              {/* Phone */}

              <p>

                <span
                  className="
                    mb-1
                    block
                    text-[9px]
                    font-medium
                    tracking-[0.15em]
                    text-[#806D6D]
                  "
                >
                  CALL US
                </span>

                <a
                  href={`tel:+${branding.phone.replace(/\D/g, "")}`}
                  className="transition-colors hover:text-[#D99A9A]"
                >
                  {branding.phone}
                </a>

              </p>

              {/* Email */}

              <p>

                <span
                  className="
                    mb-1
                    block
                    text-[9px]
                    font-medium
                    tracking-[0.15em]
                    text-[#806D6D]
                  "
                >
                  EMAIL
                </span>

                <a
                  href={`mailto:${branding.email}`}
                  className="
                    break-all
                    transition-colors
                    hover:text-[#D99A9A]
                  "
                >
                  {branding.email}
                </a>

              </p>

              <p><span className="mb-1 block text-[9px] text-[#806D6D]">ADDRESS</span><span className="whitespace-pre-line">{branding.address}</span>{branding.pincode && <> {branding.pincode}</>}</p>

              {/* Hours */}

              <p>

                <span
                  className="
                    mb-1
                    block
                    text-[9px]
                    font-medium
                    tracking-[0.15em]
                    text-[#806D6D]
                  "
                >
                  HOURS
                </span>

                {branding.hours}

              </p>

            </div>

          </div>}

        </div>

      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      {settings.bottomBar && <div className="border-t border-white/10">

        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-3
            px-5
            py-5
            text-center
            text-[10px]
            text-[#806D6D]
            sm:px-6
            md:flex-row
            md:items-center
            md:justify-between
            md:text-left
            lg:px-8
          "
        >

          <p>
            © {new Date().getFullYear()} {branding.name}.
            All rights reserved.
          </p>

          <p>
            Designed with elegance.
          </p>

        </div>

      </div>}

    </footer>
  );
}
