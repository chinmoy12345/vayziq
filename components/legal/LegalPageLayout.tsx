import Link from "next/link";
import type { ReactNode } from "react";
import VayziqPageBanner from "@/components/store/VayziqPageBanner";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
  lastUpdated?: string;
};

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  children,
  icon,
  lastUpdated,
}: LegalPageLayoutProps) {
  return (
    <main className="vayziq-content-page min-h-screen bg-white">
      <VayziqPageBanner eyebrow={eyebrow} title={title} description={description} />
      <section className="hidden border-b border-[#eee6e1] bg-[#faf8f6]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-1.5 text-sm font-medium text-[#756963] transition hover:text-[#292321]"
          >
            <ArrowLeftIcon />
            Back to Home
          </Link>

          <div className="max-w-3xl">
            {icon && (
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4ece8] text-[#8f6d65]">
                {icon}
              </div>
            )}
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7770]">
              {eyebrow}
            </p>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-[#292321] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#756963] sm:text-lg">
              {description}
            </p>
            {lastUpdated && (
              <p className="mt-4 text-xs text-[#a09691]">{lastUpdated}</p>
            )}
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
