"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, LayoutDashboard, LogOut, MapPin, ShoppingBag, UserRound } from "lucide-react";
import MobileMenu from "./MobileMenu";
import HomeHeader from "@/components/home/HomeHeader";
import AuthModal from "@/components/auth/AuthModal";

function SearchIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" strokeLinecap="round" /></svg>; }
function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5" strokeLinecap="round" /></svg>; }
function BagIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M5 8.5h14l-.8 11H5.8L5 8.5Z" strokeLinejoin="round" /><path d="M9 9V6a3 3 0 0 1 6 0v3" strokeLinecap="round" /></svg>; }
function MenuIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>; }
function CloseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>; }

const navItems = [["Men", "/shop"], ["Women", "/shop"], ["Collections", "/shop"], ["New Arrivals", "/shop?sort=newest"], ["Watch & Buy", "/watch-buy"], ["About", "/about"]] as const;
const accountMenuItems = [{ label: "Dashboard", href: "/account", icon: LayoutDashboard }, { label: "My Orders", href: "/account/orders", icon: ShoppingBag }, { label: "Wishlist", href: "/account/wishlist", icon: Heart }, { label: "My Profile", href: "/account/profile", icon: UserRound }, { label: "Addresses", href: "/account/addresses", icon: MapPin }];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json() as { user?: { name?: string } | null };
        if (active) setUserName(response.ok && data.user ? data.user.name || "My Account" : null);
      } catch {
        if (active) setUserName(null);
      }
    };

    void loadSession();
    return () => { active = false; };
  }, [pathname]);
  useEffect(() => { const refresh = () => { try { setCartCount((JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{ quantity?: number }>).reduce((sum, item) => sum + (item.quantity || 0), 0)); } catch { setCartCount(0); } }; refresh(); window.addEventListener("storage", refresh); window.addEventListener("cart-updated", refresh); return () => { window.removeEventListener("storage", refresh); window.removeEventListener("cart-updated", refresh); }; }, []);
  useEffect(() => { const close = (event: MouseEvent) => { if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  if (pathname === "/") return null;
  if (pathname === "/shop" || pathname === "/cart" || pathname.startsWith("/product/")) return <HomeHeader />;
  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = searchQuery.trim(); setSearchOpen(false); router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search"); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setAccountOpen(false); setUserName(null); router.push("/"); router.refresh(); };

  return <>
    <div className="store-utility border-b border-black bg-black px-4 text-[10px] font-semibold text-white sm:px-8"><div className="mx-auto flex h-[31px] max-w-[1440px] items-center gap-5 overflow-hidden whitespace-nowrap"><span>FREE SHIPPING ON ORDERS OVER ₹999</span><span className="hidden sm:inline">|</span><span className="hidden sm:inline">EASY 7-DAY RETURNS</span><span className="hidden md:inline">|</span><span className="hidden md:inline">100% ORIGINAL PRODUCTS</span><span className="ml-auto hidden lg:inline">TRACK ORDER　|　HELP　|　INR</span></div></div>
    <header className="store-header sticky top-0 z-50 border-b border-[#e8e8e8] bg-white/95 backdrop-blur-md"><div className="mx-auto flex h-[62px] max-w-[1440px] items-center gap-4 px-4 md:h-[70px] md:gap-7 sm:px-8">
      <button type="button" onClick={() => setMenuOpen(open => !open)} className="grid h-10 w-10 place-items-center rounded-full text-[#111] lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
      <Link href="/" className="shrink-0"><Image src="/vayziq/vayziq-logo.png" alt="VAYZIQ" width={236} height={73} priority className="h-auto w-[108px] object-contain md:w-[136px]" /></Link>
      <nav className="hidden h-full items-center gap-7 lg:flex" aria-label="Main navigation">{navItems.map(([label, href]) => <Link key={label} href={href} className={`flex h-full items-center border-b-2 text-[12px] font-bold transition ${label === "Watch & Buy" ? "border-[#fbb606] text-[#111]" : "border-transparent text-[#222] hover:border-[#fbb606]"}`}>{label}</Link>)}</nav>
      <div className="ml-auto flex items-center gap-3"><button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="hidden h-9 w-[224px] items-center gap-2 rounded-full border border-[#e8e8e8] px-3 text-left text-[10px] text-[#999] lg:flex"><SearchIcon />Search for joggers, hoodies, t-shirts...</button><button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full bg-[#111] text-white"><SearchIcon /></button>
        {userName ? <div className="relative" ref={accountRef}><button type="button" onClick={() => setAccountOpen(open => !open)} aria-label="Open account menu" aria-expanded={accountOpen} className="grid h-9 w-9 place-items-center rounded-full text-[#111]"><UserIcon /></button>{accountOpen && <div className="absolute right-0 top-11 z-[60] w-60 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white py-2 shadow-xl" role="menu">{accountMenuItems.map(item => { const Icon = item.icon; return <Link role="menuitem" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#222] hover:bg-[#f7f7f7]" href={item.href} key={item.href}><Icon className="h-4 w-4" />{item.label}</Link>; })}<button type="button" onClick={logout} className="flex w-full items-center gap-3 border-t border-[#e8e8e8] px-4 py-2.5 text-left text-sm text-red-600"><LogOut className="h-4 w-4" />Logout</button></div>}</div> : <button type="button" onClick={() => setAuthOpen(true)} aria-label="Sign up or sign in" className="grid h-9 w-9 place-items-center rounded-full text-[#111]"><UserIcon /></button>}
        <Link href="/account/wishlist" aria-label="Wishlist" className="grid h-9 w-9 place-items-center rounded-full text-[#111]"><Heart className="h-5 w-5" /></Link><Link href="/cart" aria-label="Shopping bag" className="relative grid h-9 w-9 place-items-center rounded-full text-[#111]"><BagIcon /><span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#fbb606] px-1 text-[9px] font-bold text-[#111]">{cartCount}</span></Link></div>
    </div><div id="mobile-navigation"><MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} userName={userName} onSignIn={() => setAuthOpen(true)} /></div></header>
    {searchOpen && <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/45 px-4 pt-24 backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}><form onSubmit={submitSearch} onMouseDown={event => event.stopPropagation()} className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#b77e00]">SEARCH THE COLLECTION</p><h2 className="mt-1 text-2xl font-extrabold text-[#111]">Find your perfect style</h2></div><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="text-xl text-[#555]">×</button></div><div className="mt-6 flex overflow-hidden rounded-lg border border-[#e8e8e8] bg-white focus-within:border-[#fbb606]"><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search products, colours or styles…" className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" /><button type="submit" className="bg-[#fbb606] px-6 text-xs font-bold text-[#111]">SEARCH</button></div></form></div>}
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => { router.refresh(); router.push("/account"); }} />
  </>;
}
