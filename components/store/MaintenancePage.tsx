import Image from "next/image";
import type { StoreBranding } from "@/lib/store-branding";

export default function MaintenancePage({ branding }: { branding: StoreBranding }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white font-[Arial,Helvetica,sans-serif] text-[#111]">
      <div className="h-1 bg-[#fbb606]" />
      <header className="w-full border-b border-[#e8e8e8] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center px-4 sm:px-8">
          <Image src="/vayziq/vayziq-logo-final.svg" alt="Vayziq" width={420} height={96} priority className="h-auto w-[122px] sm:w-[154px]" />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 items-center px-6 pb-20 pt-10 sm:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-md bg-[#fbb606] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#111]">A better experience is on its way</span>
          <h1 className="mt-8 text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] text-black sm:text-7xl">We&apos;ll be back soon<span className="text-[#fbb606]">.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#666] sm:text-lg">We&apos;re making a few updates to the Vayziq store. Check back shortly for your next streetwear find.</p>
          <div className="mt-10 h-1 w-24 rounded-full bg-[#fbb606]" />
        </div>
      </div>
      <footer className="bg-black text-white/70">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs sm:px-8">
          <span>© {new Date().getFullYear()} {branding.name}</span>
          <span>Everyday streetwear, coming right back.</span>
        </div>
      </footer>
    </main>
  );
}
