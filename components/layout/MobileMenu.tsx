"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ChevronRight, CircleUserRound, House, Layers, ShieldCheck, Sparkles, Tag, Truck, Undo2, X } from "lucide-react";
import type { HeaderCategory } from "@/components/home/HomeHeader";

interface MobileMenuProps { isOpen: boolean; onClose: () => void; userName: string | null; onSignIn: () => void; showQuickNav?: boolean; categories?: HeaderCategory[]; }

const quickItems = [["Home", "/", House], ["Categories", "/shop", Layers], ["Deals", "/offers", Tag], ["For You", "/shop", Sparkles]] as const;
const primaryItems = [["Home", "/"], ["New Arrivals", "/shop?sort=newest"], ["Watch & Buy", "/watch-buy"]] as const;

export default function MobileMenu({ isOpen, onClose, userName, onSignIn, showQuickNav = true, categories = [] }: MobileMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen, onClose]);

  return <>
    {showQuickNav && <nav className="flex h-11 items-center gap-1 overflow-x-auto bg-[#111] px-2 text-white scrollbar-none lg:hidden" aria-label="Mobile quick navigation">
      {quickItems.map(([label, href, Icon], index) => <Link key={label} href={href} className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold ${index === 0 ? "bg-white text-[#111]" : "text-white/85"}`} aria-current={index === 0 ? "page" : undefined}><Icon className="h-3.5 w-3.5" />{label}</Link>)}
    </nav>}
    <div className={`fixed inset-0 z-[200] bg-black/45 transition-opacity duration-300 lg:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden="true" onClick={onClose} />
    <aside className={`fixed bottom-0 left-0 top-0 z-[201] w-[min(86vw,360px)] overflow-y-auto rounded-r-[24px] bg-white p-4 shadow-2xl transition-transform duration-300 ease-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-[102%]"}`} aria-label="Mobile navigation" aria-hidden={!isOpen}>
      <div className="flex h-[53px] items-center justify-between"><Link href="/" onClick={onClose}><Image src="/vayziq/vayziq-logo.png" alt="VAYZIQ" width={236} height={73} className="h-auto w-28" /></Link><button type="button" onClick={onClose} className="p-1 text-[#111]" aria-label="Close menu"><X className="h-6 w-6" /></button></div>
      <button type="button" onClick={() => { onClose(); if (!userName) onSignIn(); }} className="my-2 flex w-full items-center gap-3 rounded-[10px] bg-[#f7f7f7] p-3 text-left text-[11px] text-[#111]"><CircleUserRound className="h-[22px] w-[22px]" /><span>Hello,<br /><b className="text-[12px]">{userName ?? "Sign In / Sign Up"}</b></span><ChevronRight className="ml-auto h-4 w-4" /></button>
      <nav className="grid" aria-label="Main mobile menu">
        {primaryItems.slice(0, 1).map(([label, href]) => <Link key={label} href={href} onClick={onClose} className="flex h-[39px] items-center justify-between rounded-lg bg-[#fff1c8] px-3 text-[12px] font-bold text-[#111]">{label}<ChevronRight className="h-[15px] w-[15px]" /></Link>)}
        {categories.map((category) => <Link key={category.id} href={`/${category.slug}`} onClick={onClose} className="flex h-[39px] items-center justify-between rounded-lg px-3 text-[12px] text-[#111]">{category.name}<ChevronRight className="h-[15px] w-[15px]" /></Link>)}
        {primaryItems.slice(1).map(([label, href]) => <Link key={label} href={href} onClick={onClose} className="flex h-[39px] items-center justify-between rounded-lg px-3 text-[12px] text-[#111]">{label}<ChevronRight className="h-[15px] w-[15px]" /></Link>)}
      </nav>
      <nav className="my-3 border-y border-[#e8e8e8] py-2" aria-label="Customer shortcuts">{[["Track Order", "/account/orders"], ["Wishlist", "/account/wishlist"], ["My Account", "/account"], ["Help & Support", "/contact"], ["About VAYZIQ", "/about"]].map(([label, href]) => <Link key={label} href={href} onClick={onClose} className="flex h-[39px] items-center justify-between rounded-lg px-3 text-[12px] text-[#111]">{label}<ChevronRight className="h-[15px] w-[15px]" /></Link>)}</nav>
      <div className="mt-4 grid grid-cols-3 gap-1.5"><span className="rounded-md bg-[#f7f7f7] p-2 text-center text-[8px] text-[#222]"><Truck className="mx-auto mb-1 h-5 w-5" />Free Shipping</span><span className="rounded-md bg-[#f7f7f7] p-2 text-center text-[8px] text-[#222]"><Undo2 className="mx-auto mb-1 h-5 w-5" />7-Day Returns</span><span className="rounded-md bg-[#f7f7f7] p-2 text-center text-[8px] text-[#222]"><ShieldCheck className="mx-auto mb-1 h-5 w-5" />Secure Payments</span></div>
      <div className="mt-4 border-t border-[#e8e8e8] px-1 pt-4 text-[12px] text-[#111]">Follow Us <div className="mt-2 text-[17px]">◎　▶　f　p</div></div>
    </aside>
  </>;
}
