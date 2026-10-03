import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";

export async function generateMetadata() { return pageSeo("/contact", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Contact Us", description: `Contact ${branding.name} for help with orders, products, delivery, returns or any other shopping questions.`, alternates: { canonical: "/contact" }, openGraph: { title: `Contact Us | ${branding.name}`, description: `Contact ${branding.name} for help with orders, products, delivery, returns or any other shopping questions.`, type: "website", url: "/contact" } };
}

import Link from "next/link";
import VayziqPageBanner from "@/components/store/VayziqPageBanner";

const MailIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M7 3h3l2 5-2 1.5a14 14 0 0 0 4.5 4.5L16 12l5 2v3c0 2-1.5 4-3.5 4C10.5 21 3 13.5 3 6.5 3 4.5 4.5 3 7 3Z" />
  </svg>
);

const MessageIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M4 5h16v11H8l-4 4V5Z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default async function ContactPage() {
  const branding = await getStoreBranding();
  return (
    <div className="vayziq-content-page bg-white text-[#292321]">
      <VayziqPageBanner eyebrow="We're here to help" title="Contact Us" description="Questions about products, delivery or orders? Our support team is ready to help." image="/vayziq/category-women.png" />
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="hidden border-b border-[#eee6e1] bg-[#faf8f6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#b56f6f]">
              We&apos;re Here To Help
            </p>

            <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">
              Contact Us
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#756c67] sm:text-base">
              Have a question about a product, your order or anything else?
              We&apos;d love to hear from you.
            </p>

            <p className="mt-5 text-xs text-[#a09893]">
              We&apos;re happy to assist you with your shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT CARDS
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Email */}
          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <MailIcon />
            </div>

            <h3 className="mt-5 text-sm font-semibold">Email Us</h3>

            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              For general enquiries and support
            </p>

            <a
              href={`mailto:${branding.email}`}
              className="mt-3 block break-all text-sm font-medium text-[#292321] transition hover:text-[#b56f6f]"
            >
              {branding.email}
            </a>
          </div>

          {/* Phone */}
          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <PhoneIcon />
            </div>

            <h3 className="mt-5 text-sm font-semibold">Call Us</h3>

            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Speak directly with our team
            </p>

            <a
              href={`tel:+${branding.phone.replace(/\D/g, "")}`}
              className="mt-3 block text-sm font-medium text-[#292321] transition hover:text-[#b56f6f]"
            >
              {branding.phone}
            </a>
          </div>

          {/* WhatsApp */}
          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <MessageIcon />
            </div>

            <h3 className="mt-5 text-sm font-semibold">WhatsApp</h3>

            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Get quick assistance from our team
            </p>

            <a
              href={`https://wa.me/${branding.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-[#292321] transition hover:text-[#b56f6f]"
            >
              Chat with us
            </a>
          </div>

          {/* Support Hours */}
          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <ClockIcon />
            </div>

            <h3 className="mt-5 text-sm font-semibold">
              Support Hours
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Opening hours
            </p>

            <p className="mt-3 text-sm font-medium text-[#292321]">
              {branding.hours}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FORM + CONTACT DETAILS
      ========================================================== */}
      <section className="border-t border-[#eee6e1] bg-[#faf8f6]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:gap-16">
            {/* =====================================================
                CONTACT FORM
            ====================================================== */}
            <div className="rounded-3xl border border-[#eee6e1] bg-white p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
                Send Us A Message
              </p>

              <h2 className="mt-3 font-serif text-3xl font-medium">
                How can we help?
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#756c67]">
                Fill in the form below and our team will get back to you as
                soon as possible.
              </p>

              {/* No onSubmit here.
                  This page remains a Server Component. */}
              <form
                className="mt-8 space-y-5"
                method="post"
                action="#"
              >
                {/* Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Your Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your name"
                      className="h-12 w-full rounded-xl border border-[#e6ddd8] bg-white px-4 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      className="h-12 w-full rounded-xl border border-[#e6ddd8] bg-white px-4 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                    />
                  </div>
                </div>

                {/* Mobile + Subject */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-medium"
                    >
                      Mobile Number
                    </label>

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Enter mobile number"
                      className="h-12 w-full rounded-xl border border-[#e6ddd8] bg-white px-4 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-sm font-medium"
                    >
                      Subject
                    </label>

                    <select
                      id="subject"
                      name="subject"
                      defaultValue=""
                      className="h-12 w-full rounded-xl border border-[#e6ddd8] bg-white px-4 text-sm text-[#292321] outline-none transition focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>

                      <option value="order">
                        Order Related
                      </option>

                      <option value="product">
                        Product Enquiry
                      </option>

                      <option value="shipping">
                        Shipping &amp; Delivery
                      </option>

                      <option value="return">
                        Return &amp; Exchange
                      </option>

                      <option value="payment">
                        Payment Related
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                {/* Order Number */}
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="mb-2 block text-sm font-medium"
                  >
                    Order Number{" "}
                    <span className="font-normal text-[#aaa19c]">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="orderNumber"
                    name="orderNumber"
                    type="text"
                    placeholder="e.g. ORD-00257"
                    className="h-12 w-full rounded-xl border border-[#e6ddd8] bg-white px-4 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium"
                  >
                    Message
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full resize-none rounded-xl border border-[#e6ddd8] bg-white px-4 py-3 text-sm text-[#292321] outline-none transition placeholder:text-[#aaa19c] focus:border-[#b56f6f] focus:ring-1 focus:ring-[#b56f6f]/20"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#292321] px-6 text-sm font-medium text-white transition hover:bg-[#403936] sm:w-auto"
                >
                  Send Message
                </button>

                <p className="text-xs leading-5 text-[#958b86]">
                  By submitting this form, you agree that we may use the
                  information provided to respond to your enquiry.
                </p>
              </form>
            </div>

            {/* =====================================================
                RIGHT SIDE
            ====================================================== */}
            <div>
              {/* Intro */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
                  Get In Touch
                </p>

                <h2 className="mt-3 font-serif text-3xl font-medium">
                  We&apos;re always happy to help.
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#756c67]">
                  Whether you need help choosing the right product, checking
                  an order, or understanding our return policy, our team is
                  here for you.
                </p>
              </div>

              {/* Store Address */}
              <div className="mt-8 rounded-2xl border border-[#eee6e1] bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
                  <MapPinIcon />
                </div>

                <h3 className="mt-5 text-sm font-semibold">
                  Our Store
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#756c67]">
                  {branding.name}<br /><span className="whitespace-pre-line">{branding.address}</span>{branding.pincode && <><br />{branding.pincode}</>}
                </p>
              </div>

              {/* Support */}
              <div className="mt-5 rounded-2xl border border-[#eee6e1] bg-white p-6">
                <h3 className="text-sm font-semibold">
                  Customer Support
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#756c67]">
                  For order-related questions, please keep your order number
                  ready so that we can assist you faster.
                </p>

                <div className="mt-5 space-y-3">
                  <a
                    href={`mailto:${branding.email}`}
                    className="flex items-center gap-3 text-sm text-[#625a56] transition hover:text-[#b56f6f]"
                  >
                    <MailIcon />
                    <span>{branding.email}</span>
                  </a>

                  <a
                    href={`tel:+${branding.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-3 text-sm text-[#625a56] transition hover:text-[#b56f6f]"
                  >
                    <PhoneIcon />
                    <span>{branding.phone}</span>
                  </a>
                </div>
              </div>

              {/* Helpful Links */}
              <div className="mt-5 rounded-2xl border border-[#eee6e1] bg-white p-6">
                <h3 className="text-sm font-semibold">
                  Helpful Information
                </h3>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/shipping"
                    className="flex items-center justify-between border-b border-[#eee6e1] pb-3 text-sm text-[#625a56] transition hover:text-[#b56f6f]"
                  >
                    <span>Shipping &amp; Delivery</span>
                    <ArrowRightIcon />
                  </Link>

                  <Link
                    href="/returns"
                    className="flex items-center justify-between border-b border-[#eee6e1] pb-3 text-sm text-[#625a56] transition hover:text-[#b56f6f]"
                  >
                    <span>Returns &amp; Exchange</span>
                    <ArrowRightIcon />
                  </Link>

                  <Link
                    href="/privacy"
                    className="flex items-center justify-between text-sm text-[#625a56] transition hover:text-[#b56f6f]"
                  >
                    <span>Privacy Policy</span>
                    <ArrowRightIcon />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          QUICK HELP CTA
      ========================================================== */}
      <section className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#b56f6f]">
          Need Quick Help?
        </p>

        <h2 className="mt-3 font-serif text-2xl font-medium sm:text-3xl">
          Check your order or explore our policies.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#756c67]">
          Find order information, shipping details and our return policy in
          just a few clicks.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account/orders"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#292321] px-6 text-sm font-medium text-white transition hover:bg-[#403936]"
          >
            View My Orders
          </Link>

          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#292321] px-6 text-sm font-medium text-[#292321] transition hover:bg-[#292321] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
