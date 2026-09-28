import Image from "next/image";
import Breadcrumbs from "./Breadcrumbs";

export default function VayziqPageBanner({ eyebrow, title, description, image = "/vayziq/hero-paired-v2.png" }: { eyebrow: string; title: string; description: React.ReactNode; image?: string }) {
  return <>
    <Breadcrumbs title={title} isShop={false} />
    <section className="relative isolate overflow-hidden border-b border-[#e8e8e8] bg-[#f7f7f7]">
      <div className="mx-auto flex min-h-[190px] max-w-[1440px] items-center px-5 py-10 sm:px-8 lg:min-h-[224px] lg:px-10">
        <div className="relative z-10 max-w-2xl"><p className="text-[10px] font-extrabold uppercase tracking-[.22em] text-[#b77e00]">{eyebrow}</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-.055em] text-[#111] sm:text-5xl">{title}</h1><div className="mt-3 max-w-xl text-sm leading-6 text-[#5f5f5f]">{description}</div></div>
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[38%] overflow-hidden lg:block"><Image src={image} alt="" fill className="object-cover object-center opacity-90" sizes="38vw" /><div className="absolute inset-0 bg-gradient-to-r from-[#f7f7f7] via-[#f7f7f7]/35 to-transparent" /></div>
      <div className="absolute -bottom-24 -right-12 h-52 w-52 rounded-full border-[28px] border-[#00e49a]/15 sm:-right-6" aria-hidden="true" />
    </section>
  </>;
}
