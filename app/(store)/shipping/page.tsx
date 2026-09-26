import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Shipping & Delivery", description: `Find delivery estimates, shipping charges and order delivery information for ${branding.name} purchases across India.`, alternates: { canonical: "/shipping" }, openGraph: { title: `Shipping & Delivery | ${branding.name}`, description: `Find delivery estimates, shipping charges and order delivery information for ${branding.name} purchases across India.`, type: "website", url: "/shipping" } };
}

import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

const TruckIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M3 6h11v10H3z" />
    <path d="M14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="19" r="2" />
    <circle cx="18" cy="19" r="2" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-7 w-7"
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
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const PackageIcon = () => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4.5 7.5 7.5 4 7.5-4" />
    <path d="M12 11.5V21" />
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

export default function ShippingPage() {
  return (
    <LegalPageLayout
      eyebrow="Delivery Information"
      title="Shipping & Delivery"
      description={<>We carefully pack every order and deliver it safely to your doorstep. Here&apos;s everything you need to know about our shipping and delivery process.</>}
      lastUpdated="Last updated: September 2026"
    >
      {/* Quick Info */}
      <section className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <TruckIcon />
            </div>
            <h3 className="text-sm font-semibold">Reliable Delivery</h3>
            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Safe and reliable delivery through trusted courier partners.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <ClockIcon />
            </div>
            <h3 className="text-sm font-semibold">Fast Processing</h3>
            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Most orders are processed and dispatched within 1–3 business
              days.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <MapPinIcon />
            </div>
            <h3 className="text-sm font-semibold">Pan-India Delivery</h3>
            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              We deliver to most serviceable locations across India.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b56f6f]/10 text-[#b56f6f]">
              <PackageIcon />
            </div>
            <h3 className="text-sm font-semibold">Carefully Packed</h3>
            <p className="mt-2 text-sm leading-6 text-[#756c67]">
              Every order is securely packed before it leaves our facility.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="border-t border-[#eee6e1]">
        <div className="mx-auto max-w-4xl py-10 sm:py-12 lg:py-14">
          {/* Processing */}
          <div>
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Order Processing
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                Once your order is successfully placed, our team will verify
                and process it for dispatch.
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>
                    Orders are generally processed within{" "}
                    <strong className="font-semibold text-[#292321]">
                      1–3 business days
                    </strong>
                    .
                  </span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>
                    Orders placed on weekends or public holidays may be
                    processed on the next business day.
                  </span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>
                    You will receive an order confirmation after successful
                    checkout.
                  </span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>
                    Tracking information will be shared once your order has
                    been dispatched.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Estimated Delivery Time
            </h2>

            <p className="mt-5 text-sm leading-7 text-[#625a56]">
              Delivery time depends on your location, courier availability,
              weather conditions and other logistical factors.
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#eee6e1]">
              <div className="grid grid-cols-2 border-b border-[#eee6e1] bg-[#faf8f6] px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#756c67]">
                <span>Location</span>
                <span>Estimated Time</span>
              </div>

              <div className="grid grid-cols-2 border-b border-[#eee6e1] px-5 py-5 text-sm">
                <span>Metro Cities</span>
                <span className="font-medium">3–5 business days</span>
              </div>

              <div className="grid grid-cols-2 border-b border-[#eee6e1] px-5 py-5 text-sm">
                <span>Other Cities</span>
                <span className="font-medium">4–7 business days</span>
              </div>

              <div className="grid grid-cols-2 px-5 py-5 text-sm">
                <span>Remote Locations</span>
                <span className="font-medium">5–10 business days</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#958b86]">
              These are estimated timelines and may vary depending on the
              destination and courier service.
            </p>
          </div>

          {/* Shipping Charges */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Shipping Charges
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                Shipping charges, if applicable, are displayed clearly during
                checkout before you complete your purchase.
              </p>

              <div className="rounded-2xl bg-[#faf8f6] p-6">
                <p className="font-medium text-[#292321]">
                  Free Shipping
                </p>
                <p className="mt-2 text-sm leading-6 text-[#756c67]">
                  Free shipping may be available on orders above the
                  applicable minimum order value. The offer and minimum value
                  may change from time to time.
                </p>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Order Tracking
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                After your order is dispatched, you may receive a tracking
                number through the contact details provided during checkout.
              </p>

              <p>
                You can also check your order status from your account.
              </p>

              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 font-medium text-[#b56f6f] transition hover:text-[#8f5050]"
              >
                View My Orders
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
              </Link>
            </div>
          </div>

          {/* Delivery Issues */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Delivery Delays
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                Occasionally, delivery may take longer than the estimated
                timeline due to circumstances beyond our control.
              </p>

              <p>This may include:</p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Severe weather conditions</span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Courier or transportation delays</span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Incorrect or incomplete delivery address</span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Remote or hard-to-reach locations</span>
                </div>

                <div className="flex gap-3">
                  <CheckIcon />
                  <span>Public holidays or exceptional circumstances</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Delivery Address
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                Please make sure that your shipping address, PIN code and
                contact number are correct before placing your order.
              </p>

              <p>
                Once an order has been dispatched, changing the delivery
                address may not be possible.
              </p>
            </div>
          </div>

          {/* Failed Delivery */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Failed Delivery Attempts
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                If the courier is unable to deliver the package because the
                recipient is unavailable or the address/contact details are
                incorrect, additional delivery attempts may be made.
              </p>

              <p>
                If delivery remains unsuccessful, the package may be returned
                to us according to the courier&apos;s return-to-origin
                process.
              </p>
            </div>
          </div>

          {/* Damaged Package */}
          <div className="mt-14 border-t border-[#eee6e1] pt-14">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">
              Damaged or Incorrect Package
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-[#625a56]">
              <p>
                If you receive a package that appears damaged, opened or
                tampered with, please contact us as soon as possible.
              </p>

              <p>
                For damaged, missing or incorrect products, please refer to
                our Returns &amp; Exchange policy for the applicable process.
              </p>

              <Link
                href="/returns"
                className="inline-flex items-center gap-2 font-medium text-[#b56f6f] transition hover:text-[#8f5050]"
              >
                View Returns &amp; Exchange Policy
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
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-14 rounded-2xl bg-[#faf8f6] p-7 sm:p-9">
            <h2 className="font-serif text-2xl font-medium">
              Need Help With Your Delivery?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756c67]">
              If you have questions about your order, shipping status or
              delivery, our support team will be happy to help.
            </p>

            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#292321] px-6 text-sm font-medium text-white transition hover:bg-[#403936]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
}