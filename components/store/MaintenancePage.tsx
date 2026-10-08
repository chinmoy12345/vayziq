import type { StoreBranding } from "@/lib/store-branding";

export default function MaintenancePage({ branding }: { branding: StoreBranding }) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#faf9f6] text-[#191919]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#ffb900]" />
      <header className="mx-auto flex w-full max-w-6xl items-center px-6 py-7 sm:px-10">
        <span className="text-2xl font-black tracking-[-0.07em] sm:text-3xl">{branding.name}</span>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pb-20 pt-10 sm:px-10">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#e7d7a7] bg-[#fff6d9] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#5e480c]">A better experience is on its way</span>
          <h1 className="mt-8 text-5xl font-black leading-[1.04] tracking-[-0.065em] sm:text-7xl">We&apos;ll be back soon<span className="text-[#f4ad00]">.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#5e5e5e] sm:text-lg">We&apos;re making a few updates to the Vayziq store. Check back shortly for your next streetwear find.</p>
          <div className="mt-10 h-1 w-24 rounded-full bg-[#ffb900]" />
        </div>
      </div>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[#e9e6dd] px-6 py-6 text-xs text-[#777] sm:px-10">
        <span>© {new Date().getFullYear()} {branding.name}</span>
        <span>Everyday streetwear, coming right back.</span>
      </footer>
    </main>
  );
}
