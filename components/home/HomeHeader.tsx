"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, CircleUserRound, Heart, House, Layers, LogOut, MapPin, Menu, Package, Search, ShoppingBag, Sparkles, Tag, Truck, Undo2, UserRound, ShieldCheck } from "lucide-react";
import MobileMenu from "@/components/layout/MobileMenu";
import AuthModal from "@/components/auth/AuthModal";
import styles from "./VayziqHome.module.css";
import brandingStyles from "./HeaderBranding.module.css";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";
import { DEFAULT_HEADER_UTILITY, type HeaderUtilitySettings } from "@/lib/header-utility-types";

export type HeaderCategory = { id: number; name: string; slug: string; status?: string; parentId: number | null; parent?: { id: number; name: string; slug: string } | null; children?: HeaderCategory[] };
type HeaderUser = { id: number; name: string | null; email: string | null; mobile: string | null };
const desktopMenu = ["Catalog", "New Arrivals", "Deals", "Watch & Buy"];
const mobileQuickMenu = [["Home", House, "/"], ["Catalog", ShoppingBag, "/shop"], ["Categories", Layers, "/categories"], ["Deals", Tag, "/offers"], ["Watch & Buy", Sparkles, "/watch-buy"]] as const;

export default function HomeHeader({ menuSettings }: { menuSettings: StoreMenuSettings }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [menuCategories, setMenuCategories] = useState<HeaderCategory[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);
  const [utility, setUtility] = useState<HeaderUtilitySettings>(DEFAULT_HEADER_UTILITY);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const updatePinnedState = () => setIsPinned(window.scrollY > 31);
    updatePinnedState();
    window.addEventListener("scroll", updatePinnedState, { passive: true });
    return () => window.removeEventListener("scroll", updatePinnedState);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/header-utility", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then((body: { data?: HeaderUtilitySettings } | null) => { if (active && body?.data) setUtility(body.data); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => { const refresh = () => { try { setCartCount((JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{ quantity?: number }>).reduce((total, item) => total + (item.quantity ?? 0), 0)); } catch { setCartCount(0); } }; refresh(); window.addEventListener("storage", refresh); window.addEventListener("cart-updated", refresh); return () => { window.removeEventListener("storage", refresh); window.removeEventListener("cart-updated", refresh); }; }, []);
  useEffect(() => { let active = true; fetch("/api/auth/me", { cache: "no-store" }).then(response => response.ok ? response.json() : null).then((data: { user?: HeaderUser | null } | null) => { if (active) setCurrentUser(data?.user ?? null); }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => { const open = () => setAuthOpen(true); window.addEventListener("vayziq:open-auth", open); return () => window.removeEventListener("vayziq:open-auth", open); }, []);
  useEffect(() => {
    const onWishlistClick = (event: MouseEvent) => {
      if (currentUser || !(event.target instanceof Element) || !event.target.closest('a[aria-label="Wishlist"]')) return;
      event.preventDefault();
      setAuthOpen(true);
    };
    document.addEventListener("click", onWishlistClick, true);
    return () => document.removeEventListener("click", onWishlistClick, true);
  }, [currentUser]);
  useEffect(() => {
    let active = true;
    fetch("/api/categories", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data: { categories?: HeaderCategory[] } | null) => {
        if (!active || !data?.categories) return;
        const categoriesByParent = new Map<number, HeaderCategory[]>();
        data.categories.filter((category) => category.parentId !== null && category.status === "active").forEach((category) => {
          const children = categoriesByParent.get(category.parentId!) ?? [];
          children.push(category);
          categoriesByParent.set(category.parentId!, children);
        });
        setMenuCategories(data.categories
          .filter((category) => category.parentId === null && category.status === "active")
          .filter((category) => menuSettings.enabled && menuSettings.categoryIds.includes(category.id))
          .map((category) => ({ ...category, children: categoriesByParent.get(category.id) ?? [] })));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [menuSettings.enabled, menuSettings.categoryIds]);
  const submitSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const query = searchQuery.trim(); setSearchOpen(false); router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search"); };
  const completeAuthentication = async () => { const response = await fetch("/api/auth/me", { cache: "no-store" }); const data = await response.json() as { user?: HeaderUser | null }; setCurrentUser(data.user ?? null); setAuthOpen(false); setAccountOpen(Boolean(data.user)); window.dispatchEvent(new Event("vayziq:auth-success")); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setCurrentUser(null); setAccountOpen(false); router.push("/"); router.refresh(); };
  const isCategoryActive = (category: HeaderCategory) => pathname === `/${category.slug}` || Boolean(category.children?.some((child) => pathname === `/${child.slug}`));
  const isMenuActive = (item: string) => {
    if (item === "Watch & Buy") return pathname === "/watch-buy";
    if (item === "Deals") return pathname === "/offers";
    if (item === "About") return pathname === "/about";
    if (item === "New Arrivals") return pathname === "/shop" && searchParams.get("sort") === "newest";
    return pathname === "/shop" && searchParams.get("sort") !== "newest";
  };
  const visibleDesktopMenu = desktopMenu.filter((item) => item === "Catalog" ? menuSettings.shop : item === "New Arrivals" ? menuSettings.newArrivals : item === "Deals" ? menuSettings.deals : menuSettings.watchBuy);
  const visibleMobileMenu = mobileQuickMenu.filter(([, , href]) => href === "/" ? menuSettings.home : href === "/shop" ? menuSettings.shop : href === "/categories" ? menuSettings.categories : href === "/offers" ? menuSettings.deals : menuSettings.watchBuy);
  return <div className={`${styles.home} ${styles.chrome}`}>
    <div className={styles.utility}><span><Truck /> Free Shipping on Orders over ₹999</span><span><Undo2 /> Easy 7-Day Returns</span><span><ShieldCheck /> 100% Original Products</span><span className={styles.utilityEnd} style={{ display: "flex", alignItems: "center", gap: 10 }}>{utility.trackOrder.visible && <Link href={utility.trackOrder.href}>{utility.trackOrder.label}</Link>}{utility.trackOrder.visible && (utility.help.visible || utility.currency.visible) && <span aria-hidden="true">|</span>}{utility.help.visible && <Link href={utility.help.href}>{utility.help.label}</Link>}{utility.help.visible && utility.currency.visible && <span aria-hidden="true">|</span>}{utility.currency.visible && <span aria-label="Currency: Indian rupee">🇮🇳 INR</span>}</span></div>
    <header className={`${styles.header} ${isPinned ? styles.fixedHeader : ""}`}><button className={styles.menuButton} onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu /></button><Link href="/"><Image className={`${styles.logo} ${brandingStyles.logo}`} src="/vayziq/vayziq-logo-final.svg" alt="Vayziq" width={420} height={96} priority /></Link><nav className={styles.desktopNav} aria-label="Primary navigation">{menuCategories.map(category => {
      const isOpen = openCategory === category.slug;
      return <div key={category.id} className={styles.navDropdown} onMouseEnter={() => setOpenCategory(category.slug)} onMouseLeave={() => setOpenCategory(null)} onFocus={() => setOpenCategory(category.slug)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpenCategory(null); }}>
        <Link href={`/${category.slug}`} className={isCategoryActive(category) ? styles.navActive : ""} aria-current={isCategoryActive(category) ? "page" : undefined} aria-haspopup={category.children?.length ? "menu" : undefined} aria-expanded={category.children?.length ? isOpen : undefined}>{category.name}{Boolean(category.children?.length) && <ChevronDown />}</Link>
        {Boolean(category.children?.length) && <div className={`${styles.categoryDropdown} ${isOpen ? styles.categoryDropdownOpen : ""}`} role="menu" aria-label={`${category.name} categories`}>
          <div><span>SHOP {category.name.toUpperCase()}</span><Link href={`/${category.slug}`}>View all <ChevronRight /></Link></div>
          {category.children!.map(child => <Link key={child.id} href={`/${child.slug}`} role="menuitem" onClick={() => setOpenCategory(null)}>{child.name}<ChevronRight /></Link>)}
        </div>}
      </div>;
    })}{visibleDesktopMenu.map(item => <Link key={item} href={item === "Watch & Buy" ? "/watch-buy" : item === "Deals" ? "/offers" : item === "New Arrivals" ? "/shop?sort=newest" : "/shop"} className={isMenuActive(item) ? styles.navActive : ""} aria-current={isMenuActive(item) ? "page" : undefined}>{item}</Link>)}</nav><div className={styles.tools}><form className={styles.search} onSubmit={event => { event.preventDefault(); setSearchOpen(true); }}><Search /><input readOnly onClick={() => setSearchOpen(true)} placeholder="Search for joggers, hoodies, t-shirts..." /><button type="submit" aria-label="Open search"><Search /></button></form><button type="button" onClick={() => setSearchOpen(true)} className={styles.mobileSearch} aria-label="Search"><Search /></button><div className={styles.accountMenu}><button type="button" className={styles.account} onClick={() => currentUser ? setAccountOpen(open => !open) : setAuthOpen(true)} aria-label={currentUser ? "Open account menu" : "Sign in or create account"} aria-expanded={currentUser ? accountOpen : undefined}><CircleUserRound /></button>{currentUser && accountOpen && <div className={styles.accountDropdown} role="menu"><div className={styles.accountGreeting}><b>{currentUser.name || "My Account"}</b><span>{currentUser.email || currentUser.mobile}</span></div><Link href="/account" role="menuitem" onClick={() => setAccountOpen(false)}><UserRound />My Account</Link><Link href="/account/orders" role="menuitem" onClick={() => setAccountOpen(false)}><Package />My Orders</Link><Link href="/account/wishlist" role="menuitem" onClick={() => setAccountOpen(false)}><Heart />Wishlist</Link><Link href="/account/profile" role="menuitem" onClick={() => setAccountOpen(false)}><CircleUserRound />My Profile</Link><Link href="/account/addresses" role="menuitem" onClick={() => setAccountOpen(false)}><MapPin />Addresses</Link><button type="button" onClick={() => void logout()} role="menuitem"><LogOut />Logout</button></div>}</div><Link href="/account/wishlist" aria-label="Wishlist"><Heart /></Link><Link className={styles.cart} href="/cart" aria-label="Cart"><ShoppingBag /><i>{cartCount}</i></Link></div></header>
    {isPinned && <div className={styles.headerSpacer} aria-hidden="true" />}
    {visibleMobileMenu.length > 0 && <nav className={styles.mobileTopNav} aria-label="Mobile quick navigation">{visibleMobileMenu.map(([item, Icon, href]) => { const active = href === "/" ? pathname === "/" : pathname === href; return <Link key={item} className={active ? styles.mobileActive : ""} href={href} aria-current={active ? "page" : undefined}><Icon /><span>{item}</span></Link>; })}</nav>}
    <MobileMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} userName={null} onSignIn={() => { setDrawerOpen(false); setAuthOpen(true); }} showQuickNav={false} categories={menuCategories} menuSettings={menuSettings} />
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => void completeAuthentication()} />
    {searchOpen && <div className="fixed inset-0 z-[220] flex items-start justify-center bg-black/45 px-4 pt-24 backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}><form onSubmit={submitSearch} onMouseDown={event => event.stopPropagation()} className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.18em] text-[#b77e00]">SEARCH THE COLLECTION</p><h2 className="mt-1 text-2xl font-extrabold text-[#111]">Find your perfect style</h2></div><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="text-xl text-[#555]">×</button></div><div className="mt-6 flex overflow-hidden rounded-lg border border-[#e8e8e8] bg-white focus-within:border-[#fbb606]"><input autoFocus value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search products, colours or styles…" className="h-12 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" /><button type="submit" className="bg-[#fbb606] px-6 text-xs font-bold text-[#111]">SEARCH</button></div></form></div>}
  </div>;
}
