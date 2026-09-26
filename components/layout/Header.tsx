"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, ShoppingBag, UserRound } from "lucide-react";

import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";
import AuthModal from "@/components/auth/AuthModal";
import type { StoreBranding } from "@/lib/store-branding";
import type { StoreNavigationCategory } from "@/lib/store-navigation";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";

/* =========================================================
   SEARCH ICON
========================================================= */

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path
        d="m16 16 4.5 4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   USER ICON
========================================================= */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />

      <path
        d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   HEART ICON
========================================================= */

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   BAG ICON
========================================================= */

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M5 8.5h14l-.8 11H5.8L5 8.5Z"
        strokeLinejoin="round"
      />

      <path
        d="M9 9V6a3 3 0 0 1 6 0v3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MENU ICON
========================================================= */

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   CLOSE ICON
========================================================= */

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   HEADER
========================================================= */

export default function Header({ branding, categories, menuSettings }: { branding: StoreBranding; categories: StoreNavigationCategory[]; menuSettings: StoreMenuSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as { user?: { name?: string } | null };
        // `/api/auth/me` correctly returns HTTP 200 for guests with `user: null`.
        // Only show the account destination when an actual authenticated user exists.
        if (active) setUserName(response.ok && data.user ? data.user.name || "My Account" : null);
      } catch {
        if (active) setUserName(null);
      }
    };

    void loadSession();
    return () => { active = false; };
  }, [pathname]);

  useEffect(() => {
    const refreshCartCount = () => {
      try { setCartCount((JSON.parse(localStorage.getItem("susmita-cart") ?? "[]") as Array<{ quantity?: number }>).reduce((count, item) => count + (item.quantity || 0), 0)); } catch { setCartCount(0); }
    };
    const initialLoad = window.setTimeout(refreshCartCount, 0);
    window.addEventListener("storage", refreshCartCount);
    window.addEventListener("cart-updated", refreshCartCount);
    return () => { window.clearTimeout(initialLoad); window.removeEventListener("storage", refreshCartCount); window.removeEventListener("cart-updated", refreshCartCount); };
  }, []);

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeAccountMenu);
    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  async function logoutCustomer() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccountMenuOpen(false);
    setUserName(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* =====================================================
          ANNOUNCEMENT BAR
      ===================================================== */}

      <div className="bg-[#B56F6F] px-4 py-2.5 text-center text-[9px] font-medium tracking-[0.18em] text-white sm:text-[10px]">
        FREE SHIPPING ON ORDERS ABOVE ₹999
      </div>

      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#E8DADA] bg-[#FFFDFC]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex h-[72px] items-center justify-between sm:h-[78px]">

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((prev) => !prev)
              }
              className="
                mr-2
                rounded-full
                p-2
                text-[#5A4B4B]
                transition
                duration-200
                hover:bg-[#F5E9E7]
                hover:text-[#B56F6F]
                lg:hidden
              "
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <CloseIcon />
              ) : (
                <MenuIcon />
              )}
            </button>

            {/* =================================================
                LOGO
            ================================================= */}



            <Link
  href="/"
  onClick={() => setMobileMenuOpen(false)}
  className="group flex items-center"
>
  <Image
    src={branding.logo}
    alt={branding.name}
    width={300}
    height={100}
    priority
    className="
      h-auto
      w-[148px]
      object-contain
      transition-transform
      duration-200
      group-hover:scale-[1.02]
      sm:w-[150px]
      lg:w-[150px]
    "
  />
</Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================= */}

            <Navbar categories={categories} menuSettings={menuSettings} onNavigate={() => setMobileMenuOpen(false)} />

            {/* =================================================
                HEADER ACTIONS
            ================================================= */}

            <div className="flex items-center gap-0.5 sm:gap-1">

              {/* =================================================
                  SEARCH
              ================================================= */}

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="
                  rounded-full
                  p-2.5
                  text-[#5A4B4B]
                  transition-all
                  duration-200
                  hover:bg-[#F5E9E7]
                  hover:text-[#B56F6F]
                "
              >
                <SearchIcon />
              </button>

              {/* =================================================
                  ACCOUNT
              ================================================= */}

              {userName ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    aria-controls="customer-account-menu"
                    aria-expanded={accountMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Open account menu"
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[#5A4B4B] transition-all duration-200 hover:bg-[#F5E9E7] hover:text-[#B56F6F]"
                    onClick={() => setAccountMenuOpen((open) => !open)}
                    type="button"
                  >
                    <UserIcon />
                    <span className="hidden max-w-28 truncate text-[10px] font-bold tracking-wide sm:inline">
                      {userName.toUpperCase()}
                    </span>
                    <svg aria-hidden="true" className={`hidden h-3 w-3 transition-transform sm:block ${accountMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] z-[60] w-64 overflow-hidden rounded-xl border border-[#E8DADA] bg-white py-2 shadow-xl" id="customer-account-menu" role="menu">
                      <p className="px-4 pb-2 pt-1 text-[10px] font-semibold tracking-[0.14em] text-[#9B5C5C]">MY ACCOUNT</p>
                      {accountMenuItems.map((item) => {
                        const Icon = item.icon;
                        return <Link className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5A4B4B] transition hover:bg-[#FDF5F3] hover:text-[#B56F6F]" href={item.href} key={item.href} onClick={() => setAccountMenuOpen(false)} role="menuitem">
                          <Icon aria-hidden="true" className="h-4 w-4 text-[#A87567]" />
                          {item.label}
                        </Link>;
                      })}
                      <div className="mt-1 border-t border-[#F0E5E3] pt-1">
                        <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50" onClick={logoutCustomer} role="menuitem" type="button"><LogOut aria-hidden="true" className="h-4 w-4" />Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  aria-label="Sign up or sign in"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[#5A4B4B] transition-all duration-200 hover:bg-[#F5E9E7] hover:text-[#B56F6F]"
                  onClick={() => setAuthOpen(true)}
                  type="button"
                >
                  <UserIcon />
                  <span className="hidden text-[10px] font-bold tracking-wide sm:inline">SIGN UP / SIGN IN</span>
                </button>
              )}

              {/* =================================================
                  WISHLIST
              ================================================= */}

              <Link
                href="/account/wishlist"
                aria-label="Wishlist"
                className="
                  hidden
                  rounded-full
                  p-2.5
                  text-[#5A4B4B]
                  transition-all
                  duration-200
                  hover:bg-[#F5E9E7]
                  hover:text-[#B56F6F]
                  sm:block
                "
              >
                <HeartIcon />
              </Link>

              {/* =================================================
                  SHOPPING BAG
              ================================================= */}

              <Link
                href="/cart"
                aria-label="Shopping bag"
                className="
                  relative
                  rounded-full
                  p-2.5
                  text-[#5A4B4B]
                  transition-all
                  duration-200
                  hover:bg-[#F5E9E7]
                  hover:text-[#B56F6F]
                "
              >
                <BagIcon />

                {/* Cart Count */}
                <span
                  className="
                    absolute
                    -right-0.5
                    -top-0.5
                    flex
                    h-[17px]
                    min-w-[17px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#B56F6F]
                    px-1
                    text-[9px]
                    font-semibold
                    leading-none
                    text-white
                  "
                >
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ===================================================== */}

        <div id="mobile-navigation">
          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            brandName={branding.name}
            categories={categories}
            menuSettings={menuSettings}
            cartCount={cartCount}
            userName={userName}
            onSignIn={() => setAuthOpen(true)}
          />
        </div>
      </header>
      {searchOpen && <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#2B2525]/45 px-4 pt-24 backdrop-blur-sm sm:pt-32" onMouseDown={() => setSearchOpen(false)}>
        <form onSubmit={submitSearch} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-2xl border border-[#E8DADA] bg-[#FFFDFC] p-5 shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold tracking-[0.2em] text-[#B56F6F]">SEARCH THE COLLECTION</p><h2 className="mt-1 font-serif text-2xl text-[#2B2525]">Find your perfect style</h2></div><button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="text-xl text-[#7E6B6B] hover:text-[#B56F6F]">×</button></div>
          <div className="mt-6 flex border border-[#DCCACA] bg-white focus-within:border-[#B56F6F]"><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search sarees, kurtis, colours or styles…" className="h-14 min-w-0 flex-1 bg-transparent px-4 text-sm text-[#2B2525] outline-none" /><button type="submit" className="bg-[#B56F6F] px-6 text-xs font-semibold tracking-[0.12em] text-white transition hover:bg-[#9F5E5E]">SEARCH</button></div>
          <p className="mt-4 text-xs text-[#8A7777]">Try: Banarasi saree, floral kurti, pink nightwear</p>
        </form>
      </div>}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          router.refresh();
          router.push("/account");
        }}
      />
    </>
  );
}

const accountMenuItems = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "My Profile", href: "/account/profile", icon: UserRound },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
];
