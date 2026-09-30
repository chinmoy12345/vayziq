"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useState } from "react";

type Category = { id: number; name: string; slug: string; image: string | null; children: { id: number; name: string; slug: string; image: string | null }[] };

const fallbacks: Record<string, string> = { men: "/vayziq/category-men.png", women: "/vayziq/category-women.png" };

export default function CategoryBrowser({ categories }: { categories: Category[] }) {
  const orderedCategories = [...categories].sort((a, b) => (a.slug === "men" ? -1 : b.slug === "men" ? 1 : 0));
  const [activeSlug, setActiveSlug] = useState(orderedCategories[0]?.slug ?? "men");
  const category = orderedCategories.find((item) => item.slug === activeSlug) ?? orderedCategories[0];

  if (!category) return <div className="rounded-2xl border border-dashed border-[#ded7cf] bg-white px-6 py-16 text-center text-sm text-[#746d67]">No active categories are available yet.</div>;

  const fallback = category.image || fallbacks[category.slug] || "/vayziq/fashion-grid.png";
  return <>
    <div className="mb-5 inline-flex rounded-xl border border-[#e7ded2] bg-white p-1.5 shadow-sm">
      {orderedCategories.map((item) => <button key={item.id} type="button" onClick={() => setActiveSlug(item.slug)} className={`min-w-[98px] rounded-lg px-5 py-2.5 text-sm font-bold transition ${item.slug === category.slug ? "bg-[#fbb606] text-black shadow-md" : "text-[#5f5750] hover:bg-[#fff4ce] hover:text-[#111]"}`}>{item.name}</button>)}
    </div>

    <section className="overflow-hidden rounded-[22px] border border-black/[.08] bg-white shadow-[0_10px_30px_rgba(30,22,14,.07)]">
      <Link href={`/${category.slug}`} className="group flex items-center justify-between border-b border-[#eee7dc] bg-[#fffaf1] px-4 py-4 text-[#171513] sm:px-5">
        <span><span className="block text-[10px] font-bold uppercase tracking-[.2em] text-[#a87813]">Shop the collection</span><h2 className="mt-1 text-xl font-extrabold tracking-[-.045em] sm:text-2xl">{category.name}</h2></span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6bb0b] text-black transition group-hover:bg-[#171513] group-hover:text-white group-hover:rotate-[-8deg]"><ArrowUpRight className="h-5 w-5" /></span>
      </Link>
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1"><p className="text-xs font-bold text-[#24201d]">Shop by type</p><Link href={`/${category.slug}`} className="text-[11px] font-bold text-[#9d6c00]">View all</Link></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {category.children.map((child) => {
            const image = child.image || fallback;
            return <Link key={child.id} href={`/${child.slug}`} className="group relative min-h-[120px] overflow-hidden rounded-xl bg-[#29231e] shadow-sm sm:min-h-[150px]">
              <Image src={image} alt={`${child.name} collection`} fill sizes="(max-width: 640px) calc((100vw - 56px) / 2), 250px" className="object-cover transition duration-500 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-2.5 text-sm font-semibold text-white"><span className="line-clamp-1">{child.name.replace(/^(Men's|Women's)\s+/i, "")}</span><ChevronRight className="h-4 w-4 shrink-0 text-[#f5bc22] transition group-hover:translate-x-0.5" /></span>
            </Link>;
          })}
        </div>
      </div>
    </section>
  </>;
}
