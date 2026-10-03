import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import { StoreName } from "@/components/StoreBranding";
import type { Metadata } from "next";

export async function generateMetadata() { return pageSeo("/about", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "About Us", description: `Learn about ${branding.name}, our approach to streetwear for men, women and unisex wardrobes, and the thoughtful collections we bring together.`, alternates: { canonical: "/about" }, openGraph: { title: `About Us | ${branding.name}`, description: `Learn about ${branding.name}, our approach to streetwear for men, women and unisex wardrobes, and the thoughtful collections we bring together.`, type: "website", url: "/about" } };
}

import Link from "next/link";
import VayziqPageBanner from "@/components/store/VayziqPageBanner";

const HeartIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
  </svg>
);

const SparkleIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
    <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M12 3 20 6v5c0 5.2-3.3 8.7-8 10-4.7-1.3-8-4.8-8-10V6l8-3Z" />
    <path d="m8.5 12 2.3 2.3 4.7-4.8" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="mt-0.5 h-5 w-5 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="vayziq-content-page bg-white text-[#292321]">
      <VayziqPageBanner eyebrow="Our Story" title="About VAYZIQ" description="Premium everyday wear made to move freely and live boldly." image="/vayziq/hero-paired-v2.png" />
      {/* Hero */}
      <section className="hidden border-b border-[#eee6e1] bg-[#faf8f6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#b56f6f]">
              Our Story
            </p>

            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
              About Us
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#756c67] sm:text-base">
              Welcome to <StoreName /> — a thoughtfully curated
              destination for elegant, comfortable and timeless women&apos;s
              fashion.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#eee5df]">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f6eee9] via-[#eee0d9] to-[#e7d4ce]">
                <div className="text-center">
                  <div className="font-serif text-7xl text-[#b56f6f]/30">
                    S
                  </div>

                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8f7770]">
                    <StoreName />
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 rounded-2xl border border-[#eee6e1] bg-white px-6 py-5 shadow-sm sm:-right-5">
              <p className="font-serif text-xl text-[#b56f6f]">
                Elegance
              </p>
              <p className="mt-1 text-xs text-[#958b86]">
                Made for every woman
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
              Who We Are
            </p>

            <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">
              Fashion that feels beautiful, effortless and personal.
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-[#625a56]">
              <p>
                <StoreName /> is built around a simple idea — fashion
                should make you feel confident, comfortable and beautifully
                yourself.
              </p>

              <p>
                We bring together carefully selected styles across{" "}
                <strong className="font-medium text-[#292321]">
                  Men, Women and Unisex
                </strong>
                , combining timeless designs with everyday comfort.
              </p>

              <p>
                From traditional occasions to everyday moments at home, we
                aim to offer pieces that fit naturally into your wardrobe and
                your lifestyle.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[#292321] px-6 text-sm font-medium text-white transition hover:bg-[#403936]"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-[#eee6e1] bg-[#faf8f6]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
              What Matters To Us
            </p>

            <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
              Our Values
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#756c67]">
              Every part of our collection is guided by a few simple
              principles.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-[#eee6e1] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                <HeartIcon />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                Curated With Care
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#756c67]">
                We carefully select styles that balance beauty, comfort and
                everyday wearability.
              </p>
            </div>

            <div className="rounded-2xl border border-[#eee6e1] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                <SparkleIcon />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                Timeless Style
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#756c67]">
                Our goal is to offer designs that feel special today and
                remain beautiful season after season.
              </p>
            </div>

            <div className="rounded-2xl border border-[#eee6e1] bg-white p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                <ShieldIcon />
              </div>

              <h3 className="mt-5 text-base font-semibold">
                Customer First
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#756c67]">
                We believe in transparent service, thoughtful packaging and
                a shopping experience you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
            Discover Your Style
          </p>

          <h2 className="mt-3 font-serif text-3xl font-medium sm:text-4xl">
            Made for Every Occasion
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Link
            href="/men"
            className="group rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-7 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b56f6f]">
              Collection 01
            </p>

            <h3 className="mt-3 font-serif text-2xl">Men</h3>

            <p className="mt-3 text-sm leading-6 text-[#756c67]">
              Street-ready essentials, relaxed fits and everyday
              moments.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#292321]">
              Explore Men
              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>

          <Link
            href="/women"
            className="group rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-7 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b56f6f]">
              Collection 02
            </p>

            <h3 className="mt-3 font-serif text-2xl">Women</h3>

            <p className="mt-3 text-sm leading-6 text-[#756c67]">
              Expressive streetwear and comfortable fits for
              everyday style.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#292321]">
              Explore Women
              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>

          <Link
            href="/shop"
            className="group rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-7 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b56f6f]">
              Collection 03
            </p>

            <h3 className="mt-3 font-serif text-2xl">Unisex</h3>

            <p className="mt-3 text-sm leading-6 text-[#756c67]">
              Versatile everyday streetwear made to style
              your way.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#292321]">
              Explore Unisex
              <span className="transition group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </div>
      </section>

      {/* Promise */}
      <section className="border-t border-[#eee6e1] bg-[#292321] text-white">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d9aaa3]">
            Our Promise
          </p>

          <h2 className="mt-4 font-serif text-3xl font-medium sm:text-4xl">
            Because you deserve to feel beautiful every day.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65">
            We&apos;re committed to continuously improving our collection and
            creating a shopping experience that feels as thoughtful as the
            products we offer.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            <div className="flex gap-3 text-sm text-white/80">
              <CheckIcon />
              <span>Thoughtfully selected collections</span>
            </div>

            <div className="flex gap-3 text-sm text-white/80">
              <CheckIcon />
              <span>Comfort-focused styles</span>
            </div>

            <div className="flex gap-3 text-sm text-white/80">
              <CheckIcon />
              <span>Careful order packaging</span>
            </div>

            <div className="flex gap-3 text-sm text-white/80">
              <CheckIcon />
              <span>Customer-focused service</span>
            </div>
          </div>

          <Link
            href="/shop"
            className="mt-9 inline-flex h-11 items-center justify-center rounded-lg bg-white px-7 text-sm font-medium text-[#292321] transition hover:bg-[#f5efeb]"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 lg:px-10 lg:py-16">
        <h2 className="font-serif text-2xl font-medium sm:text-3xl">
          Have a question?
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#756c67]">
          We&apos;d love to hear from you. Get in touch with our team for any
          questions about our products or your order.
        </p>

        <Link
          href="/contact"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-[#292321] px-6 text-sm font-medium text-[#292321] transition hover:bg-[#292321] hover:text-white"
        >
          Contact Us
        </Link>
      </section>
    </div>
  );
}
