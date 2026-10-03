import { pageSeo } from "@/lib/seo";
import { getStoreBranding } from "@/lib/store-branding";
import { StoreName } from "@/components/StoreBranding";
import type { Metadata } from "next";

export async function generateMetadata() { return pageSeo("/privacy", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return { title: "Privacy Policy", description: `Read ${branding.name}’s Privacy Policy to understand how we collect, use and protect your personal information.`, alternates: { canonical: "/privacy" }, openGraph: { title: `Privacy Policy | ${branding.name}`, description: `Read ${branding.name}’s Privacy Policy to understand how we collect, use and protect your personal information.`, type: "website", url: "/privacy" } };
}

import Link from "next/link";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 3 20 6v5c0 5-3.2 8.5-8 10-4.8-1.5-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      eyebrow="Your Privacy Matters"
      title="Privacy Policy"
      description={<>At <StoreName />, we respect your privacy and are committed to protecting the information you share with us.</>}
      icon={<ShieldIcon />}
      lastUpdated="Last updated: September 2026"
    >
      <section className="mx-auto max-w-4xl py-12 sm:py-14 lg:py-16">
        {/* Introduction */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            1. Introduction
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            This Privacy Policy explains how <StoreName />
            (&quot;we&quot;, &quot;us&quot; or &quot;our&quot;) collects,
            uses, stores and protects information when you visit our website,
            create an account, place an order or otherwise interact with our
            services.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            By using our website, you agree to the practices described in this
            Privacy Policy. If you do not agree with this policy, please do not
            use our website.
          </p>
        </div>

        {/* Information */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            2. Information We Collect
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We may collect information that you provide directly to us when
            using our website, including:
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Name and contact details such as email address and mobile number.",
              "Billing and shipping address.",
              "Account login information.",
              "Order and purchase history.",
              "Payment-related information required to process your order.",
              "Product reviews, feedback and other information you submit.",
              "Information provided when contacting customer support.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[#eee6e1] bg-[#faf8f6] p-4"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#b56f6f]" />
                <p className="text-sm leading-6 text-[#514741]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Automatic Information */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            3. Information Collected Automatically
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            When you visit our website, certain technical information may be
            collected automatically, such as your browser type, device type,
            approximate location, IP address, pages visited and information
            about how you interact with our website.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            This information may be used to improve website performance,
            security and the overall shopping experience.
          </p>
        </div>

        {/* How We Use */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            4. How We Use Your Information
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We may use the information collected for the following purposes:
          </p>

          <ul className="mt-5 space-y-3 pl-5 text-sm leading-7 text-[#655b56]">
            <li className="list-disc">
              To create and manage your customer account.
            </li>
            <li className="list-disc">
              To process, confirm and deliver your orders.
            </li>
            <li className="list-disc">
              To process payments and provide order-related services.
            </li>
            <li className="list-disc">
              To communicate with you about orders, returns and support
              requests.
            </li>
            <li className="list-disc">
              To respond to questions, feedback and customer service requests.
            </li>
            <li className="list-disc">
              To improve our products, website and customer experience.
            </li>
            <li className="list-disc">
              To prevent fraud, abuse and unauthorized activity.
            </li>
            <li className="list-disc">
              To send promotional communications where permitted and where you
              have opted to receive them.
            </li>
          </ul>
        </div>

        {/* Payments */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            5. Payment Information
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Payments may be processed through third-party payment service
            providers. Depending on the payment method used, payment
            information may be handled directly by the relevant payment
            provider.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We do not intend to store complete card numbers, CVV numbers or
            other sensitive card authentication information on our own
            systems.
          </p>
        </div>

        {/* Cookies */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            6. Cookies and Similar Technologies
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Our website may use cookies and similar technologies to remember
            your preferences, maintain sessions, improve functionality and
            understand website usage.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            You can configure your browser to refuse or delete cookies.
            However, some website features may not work correctly if cookies
            are disabled.
          </p>
        </div>

        {/* Sharing */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            7. Sharing of Information
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We do not sell your personal information. We may share information
            with trusted service providers when necessary to operate our
            business and provide services to you.
          </p>

          <div className="mt-5 space-y-3">
            {[
              "Payment service providers for processing transactions.",
              "Shipping and logistics partners for order delivery.",
              "Technology and hosting providers that support our website.",
              "Customer support and communication service providers.",
              "Professional advisers where reasonably necessary.",
              "Government authorities or law enforcement where required by applicable law.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[#eee6e1] bg-white p-4"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#b56f6f]" />
                <p className="text-sm leading-6 text-[#514741]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="mb-12">
          <div className="rounded-2xl border border-[#e8ddd8] bg-[#f8f0ed] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#8f6d65]">
                <LockIcon />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-[#292321]">
                  8. Data Security
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#756963]">
                  We take reasonable technical and organizational measures to
                  protect your personal information against unauthorized
                  access, loss, misuse, alteration or disclosure.
                </p>

                <p className="mt-3 text-sm leading-7 text-[#756963]">
                  However, no internet transmission or electronic storage
                  system can be guaranteed to be completely secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Retention */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            9. Data Retention
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We retain personal information for as long as reasonably necessary
            to provide our services, maintain business and transaction
            records, resolve disputes, comply with legal obligations and
            enforce our agreements.
          </p>
        </div>

        {/* Your Rights */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            10. Your Privacy Choices
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Depending on applicable law, you may have rights relating to your
            personal information, including the ability to request access,
            correction or deletion of certain information.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            You may also unsubscribe from promotional emails by using the
            unsubscribe option provided in those communications.
          </p>
        </div>

        {/* Children */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            11. Children&apos;s Privacy
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Our website is intended for general consumers and is not
            specifically directed toward children. We do not knowingly
            collect personal information from children where prohibited by
            applicable law.
          </p>
        </div>

        {/* Third Party */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            12. Third-Party Websites
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Our website may contain links to third-party websites or services.
            We are not responsible for the privacy practices, content or
            security of those third-party websites. We recommend reviewing
            their privacy policies before providing personal information.
          </p>
        </div>

        {/* Changes */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#292321] sm:text-2xl">
            13. Changes to This Privacy Policy
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            We may update this Privacy Policy from time to time to reflect
            changes in our services, technology, legal requirements or
            business practices.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#756963]">
            Any updated version will be posted on this page with a revised
            &quot;Last updated&quot; date.
          </p>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-[#eee6e1] bg-[#faf8f6] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a7770]">
            Privacy Questions
          </p>

          <h2 className="mt-2 text-xl font-semibold text-[#292321]">
            Need more information?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756963]">
            If you have questions about this Privacy Policy or how we handle
            your information, please contact our customer support team.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
            >
              Contact Us
            </Link>

            <Link
              href="/terms"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#ddd4cf] bg-white px-5 text-sm font-medium text-[#514741] transition hover:bg-[#faf8f6]"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
}
