"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, Heart, House, Layers, Menu, Search, ShoppingBag, Sparkles, Tag, Truck, Undo2, ShieldCheck } from "lucide-react";
import MobileMenu from "@/components/layout/MobileMenu";
import styles from "./VayziqHome.module.css";

const desktopMenu = ["Men", "Women", "Collections", "New Arrivals", "Watch & Buy", "About"];
const mobileQuickMenu = [["Home", House, "/"], ["Categories", Layers, "/shop"], ["Deals", Tag, "/offers"], ["For You", Sparkles, "/shop"]] as const;

export default function HomeHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const updatePinnedState = () => setIsPinned(window.scrollY > 31);
    updatePinnedState();
    window.addEventListener("scroll", updatePinnedState, { passive: true });
    return () => window.removeEventListener("scroll", updatePinnedState);
  }, []);
  useEffect(() => { const refresh = () => { try { setCartCount((JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{ quantity?: number }>).reduce((total, item) => total + (item.quantity ?? 0), 0)); } catch { setCartCount(0); } }; refresh(); window.addEventListener("storage", refresh); window.addEventListener("cart-updated", refresh); return () => { window.removeEventListener("storage", refresh); window.removeEventListener("cart-updated", refresh); }; }, []);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = searchQuery.trim(); setSearchOpen(false); router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search"); };
  return <div className={`${styles.home} ${styles.chrome}`}>
    <div className={styles.utility}><span><Truck /> Free Shipping on Orders over ₹999</span><span><Undo2 /> Easy 7-Day Returns</span><span><ShieldCheck /> 100% Original Products</span><span className={styles.utilityEnd}>Track Order　|　Help　|　🇮🇳 INR</span></div>
    <header className={`${styles.header} ${isPinned ? styles.fixedHeader : ""}`}><button className={styles.menuButton} onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu /></button><Link href="/"><Image className={styles.logo} src="/vayziq/vayziq-logo.png" alt="VAYZIQ" width={236} height={73} priority /></Link><nav className={styles.desktopNav} aria-label="Primary navigation">{desktopMenu.map(item => <Link key={item} href={item === "Watch & Buy" ? "/watch-buy" : item === "About" ? "/about" : "/shop"} className={item === "Watch & Buy" ? styles.navActive : ""}>{item}</Link>)}</nav><div className={styles.tools}><form className={styles.search} onSubmit={event => { event.preventDefault(); setSearchOpen(true); }}><Search /><input readOnly onClick={() => setSearchOpen(true)} placeholder="Search for joggers, hoodies, t-shirts..." /><button type="submit" aria-label="Open search"><Search /></button></form><button type="button" onClick={() => setSearchOpen(true)} className={styles.mobileSearch} aria-label="Search"><Search /></button><Link className={styles.account} href="/account" aria-label="Account"><CircleUserRound /></Link><Link href="/account/wishlist" aria-label="Wishlist"><Heart /></Link><Link className={styles.cart} href="/cart" aria-label="Cart"><ShoppingBag /><i>{cartCount}</i></Link></div></header>
    {isPinned && <div className={styles.headerSpacer} aria-hidden="true" />}
    <nav className={styles.mobileTopNav} aria-label="Mobile quick navigation">{mobileQuickMenu.map(([item, Icon, href], index) => <Link key={item} className={index === 0 ? styles.mobileActive : ""} href={href} aria-current={index === 0 ? "page" : undefined}><Icon /><span>{item}</span></Link>)}</nav>
    <MobileMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} userName={null} onSignIn={() => router.push("/login")} showQuickNav={false} />
    {searchOpen && <div className="fixed inset-0 z-[220] flex items-start justify-center bg-black/45 px-4 pt-24 backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}><form onSubmit={submitSearch} onMouseDown={event => event.stopPropagation()} className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#b77e00]">SEARCH THE COLLECTION</p><h2 className="mt-1 text-2xl font-extrabold text-[#111]">Find your perfect style</h2></div><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="text-xl text-[#555]">×</button></div><div className="mt-6 flex overflow-hidden rounded-lg border border-[#e8e8e8] bg-white focus-within:border-[#fbb606]"><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search products, colours or styles…" className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" /><button type="submit" className="bg-[#fbb606] px-6 text-xs font-bold text-[#111]">SEARCH</button></div></form></div>}
  </div>;
}
