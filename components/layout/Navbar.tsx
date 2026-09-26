"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import type { StoreNavigationCategory } from "@/lib/store-navigation";

import type { StoreMenuSettings } from "@/lib/store-menu-settings";

export default function Navbar({ categories, menuSettings, onNavigate }: { categories: StoreNavigationCategory[]; menuSettings: StoreMenuSettings; onNavigate?: () => void }) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const closeMenu = () => { setOpenCategory(null); onNavigate?.(); };
  return (
    <nav aria-label="Main navigation" className="hidden items-center lg:flex">
      <ul className="flex items-center gap-7 xl:gap-9">
        {menuSettings.home && <li><NavLink href="/" onClick={closeMenu}>Home</NavLink></li>}
        {categories.map((category) => {
          const isOpen = openCategory === category.slug;
          return <li key={category.slug} className="relative py-3" onMouseEnter={() => setOpenCategory(category.slug)} onMouseLeave={() => setOpenCategory(null)} onFocus={() => setOpenCategory(category.slug)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenCategory(null); }}>
            <NavLink href={`/${category.slug}`} hasChildren={Boolean(category.children?.length)} onClick={closeMenu}>{category.name}</NavLink>
            {Boolean(category.children?.length) && (
              <div className={`absolute left-1/2 top-full z-50 w-[min(88vw,36rem)] -translate-x-1/2 rounded-xl border border-[#E8DADA] bg-white p-5 shadow-[0_18px_50px_rgba(55,35,35,0.14)] transition-all duration-200 ${isOpen ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none translate-y-2 opacity-0"}`}>
                <div className="mb-4 flex items-end justify-between border-b border-[#F0E8E5] pb-4">
                  <div><p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#A37878]">Explore the collection</p><h2 className="font-serif text-xl text-[#2B2525]">{category.name}</h2></div>
                  <Link href={`/${category.slug}`} onClick={closeMenu} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#965B5B] transition hover:text-[#5B3030]">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {category.children?.slice(0, 10).map((child) => (
                    <Link key={child.slug} href={`/${child.slug}`} onClick={closeMenu} className="group/item flex items-center justify-between rounded-lg px-3 py-3 text-xs text-[#594D4D] transition hover:bg-[#FAF3F0] hover:text-[#914F4F]">
                      <span>{child.name}</span><ChevronRight className="h-3.5 w-3.5 text-[#B9A4A0] transition group-hover/item:translate-x-0.5 group-hover/item:text-[#9F5E5E]" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </li>;
        })}
        {menuSettings.watchBuy && <li><NavLink href="/watch-buy" onClick={closeMenu}>Watch &amp; Buy</NavLink></li>}
        {menuSettings.shop && <li><NavLink href="/shop" onClick={closeMenu}>Shop</NavLink></li>}
      </ul>
    </nav>
  );
}

function NavLink({ href, children, hasChildren = false, onClick }: { href: string; children: React.ReactNode; hasChildren?: boolean; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} aria-haspopup={hasChildren ? "true" : undefined} className="group relative inline-flex items-center gap-1 py-2 text-[13px] font-medium tracking-wide text-[#4F4444] transition-colors duration-200 hover:text-[#B56F6F]">
      <span>{children}</span>{hasChildren && <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />}
      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#B56F6F] transition-all duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}
