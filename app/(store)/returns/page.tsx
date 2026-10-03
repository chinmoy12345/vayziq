import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import { StoreName } from "@/components/StoreBranding";
import type { Metadata } from "next";

export async function generateMetadata() { return pageSeo("/returns", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Returns & Exchange", description: `Learn about ${branding.name}’s return, exchange and replacement process, eligibility and timelines.`, alternates: { canonical: "/returns" }, openGraph: { title: `Returns & Exchange | ${branding.name}`, description: `Learn about ${branding.name}’s return, exchange and replacement process, eligibility and timelines.`, type: "website", url: "/returns" } };
}

import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m21 8-9 5-9-5" />
      <path d="M12 13v8" />
      <path d="m3 8 9-5 9 5v10l-9 5-9-5V8Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M20 11a8 8 0 0 0-14.9-3.9L3 10" />
      <path d="M3 5v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 3.9L21 14" />
      <path d="M21 19v-5h-5" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v16H6.5A2.5 2.5 0 0 1 4 17.5v-11Z" />
      <path d="M4 7h13.5A2.5 2.5 0 0 1 20 9.5v5H16a2 2 0 0 1 0-4h4" />
    </svg>
  );
}

export default function ReturnsPage() {
  return (
    <LegalPageLayout
      eyebrow="Customer Care"
      title="Returns & Exchange"
      description={<>We want you to love every purchase from <StoreName />. If something isn&apos;t right, we&apos;re here to help make it right.</>}
      lastUpdated="Last updated: September 2026"
    >
      {/* Quick Overview */}
      <section className="py-10 sm:py-12 lg:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#eee6e1] bg-white p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6eeeb] text-[#8f6d65]">
              <PackageIcon />
            </div>

            <h2 className="text-base font-semibold text-[#292321]">
              Easy Returns
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#81756f]">
              Eligible products can be returned within the specified return
              period.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6eeeb] text-[#8f6d65]">
              <RefreshIcon />
            </div>

            <h2 className="text-base font-semibold text-[#292321]">
              Simple Exchange
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#81756f]">
              If you receive the wrong size or product, contact us for an
              exchange.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee6e1] bg-white p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6eeeb] text-[#8f6d65]">
              <WalletIcon />
            </div>

            <h2 className="text-base font-semibold text-[#292321]">
              Refunds
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#81756f]">
              Approved refunds are processed to the original payment method
              where applicable.
            </p>
          </div>
        </div>
      </section>

      {/* Policy */}
      <section className="border-t border-[#eee6e1]">
        <div className="mx-auto max-w-4xl py-10 sm:py-12 lg:py-14">
          {/* Eligibility */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              Return Eligibility
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756963]">
              To be eligible for a return or exchange, the product should
              generally meet the following conditions:
            </p>

            <div className="mt-6 space-y-3">
              {[
                "The return request must be raised within 7 days of delivery.",
                "The product must be unused, unworn and unwashed.",
                "The original tags, packaging and accessories should be intact.",
                "The product should not have any damage, stains, perfume or alteration.",
                "A valid order number or purchase details must be provided.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-[#eee6e1] bg-white p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f4ece8] text-[#8d6b63]">
                    <CheckIcon />
                  </span>

                  <p className="text-sm leading-6 text-[#514741]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Non Returnable */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              Non-Returnable Items
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756963]">
              For hygiene, safety or product-specific reasons, certain items
              may not be eligible for return or exchange.
            </p>

            <ul className="mt-5 space-y-3 pl-5 text-sm leading-7 text-[#655b56]">
              <li className="list-disc">
                Products that have been used, washed or altered.
              </li>
              <li className="list-disc">
                Products without original tags or packaging.
              </li>
              <li className="list-disc">
                Items damaged after delivery due to customer handling.
              </li>
              <li className="list-disc">
                Products specifically marked as non-returnable on the product
                page.
              </li>
              <li className="list-disc">
                Items returned after the applicable return period.
              </li>
            </ul>
          </div>

          {/* Exchange */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              Exchange Policy
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756963]">
              Exchange requests can be made for eligible products, subject to
              availability.
            </p>

            <div className="mt-5 rounded-2xl border border-[#e8ddd8] bg-white p-5 sm:p-6">
              <ol className="space-y-4 text-sm leading-6 text-[#514741]">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#292321] text-xs font-semibold text-white">
                    1
                  </span>
                  <span>
                    Contact our customer support team with your order number
                    and the reason for exchange.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#292321] text-xs font-semibold text-white">
                    2
                  </span>
                  <span>
                    Our team will review the request and confirm whether the
                    product is eligible.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#292321] text-xs font-semibold text-white">
                    3
                  </span>
                  <span>
                    Once approved, the product should be packed securely with
                    its original tags and packaging.
                  </span>
                </li>

                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#292321] text-xs font-semibold text-white">
                    4
                  </span>
                  <span>
                    The replacement will be shipped after the returned product
                    is received and verified.
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* Damaged */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              Damaged or Incorrect Product
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756963]">
              If you receive a damaged, defective or incorrect product, please
              contact us as soon as possible after delivery.
            </p>

            <div className="mt-5 rounded-2xl border border-[#e8ddd8] bg-[#f8f0ed] p-5 sm:p-6">
              <p className="text-sm font-medium text-[#514741]">
                Please keep the following ready:
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-[#655b56]">
                <li>• Order number</li>
                <li>• Clear photographs of the product</li>
                <li>• Photographs of the packaging, if applicable</li>
                <li>• Short description of the issue</li>
              </ul>
            </div>
          </div>

          {/* Refund */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              Refund Policy
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#756963]">
              Once a return is received and inspected, we will notify you
              about the approval or rejection of your refund.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#756963]">
              Approved refunds will normally be processed to the original
              payment method. The time taken for the amount to appear in your
              account may depend on your bank or payment provider.
            </p>

            <div className="mt-5 rounded-2xl border border-[#eee6e1] bg-white p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-[#403936]">
                Important
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#756963]">
                Shipping charges, COD charges or other non-refundable charges,
                if applicable, may not be refundable. Any applicable deduction
                will be communicated during the return process.
              </p>
            </div>
          </div>

          {/* Return Process */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
              How to Request a Return
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#eee6e1] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a7770]">
                  Step 01
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#292321]">
                  Contact Us
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756963]">
                  Share your order number and return reason with our support
                  team.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eee6e1] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a7770]">
                  Step 02
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#292321]">
                  Get Approval
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756963]">
                  We will review your request and confirm the next steps.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eee6e1] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a7770]">
                  Step 03
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#292321]">
                  Ship the Product
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756963]">
                  Pack the item securely with its original tags and packaging.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eee6e1] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9a7770]">
                  Step 04
                </p>

                <h3 className="mt-2 text-sm font-semibold text-[#292321]">
                  Refund or Exchange
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#756963]">
                  After verification, the applicable refund or replacement will
                  be processed.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-[#e8ddd8] bg-[#f8f0ed] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7770]">
              Need Help?
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#292321]">
              We&apos;re here for you.
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#756963]">
              If you have any questions about returns, exchanges or refunds,
              please contact our customer support team with your order
              details.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
              >
                Contact Us
              </Link>

              <Link
                href="/account/orders"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#d9ccc6] bg-white px-5 text-sm font-medium text-[#514741] transition hover:bg-[#faf8f6]"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
}
