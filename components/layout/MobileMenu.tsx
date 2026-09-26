"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { StoreNavigationCategory } from "@/lib/store-navigation";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  cartCount: number;
  userName: string | null;
  onSignIn: () => void;
  categories?: StoreNavigationCategory[];
  menuSettings: StoreMenuSettings;
}



function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        d="M5 20c.8-3.5 3.2-5.5 7-5.5s6.2 2 7 5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
    >
      <path
        d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
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

export default function MobileMenu({
  isOpen,
  onClose,
  brandName,
  cartCount,
  userName,
  onSignIn,
  categories,
  menuSettings,
}: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  return (
    <div
      inert={!isOpen}
      aria-hidden={!isOpen}
      className={`
        overflow-x-hidden border-t border-neutral-100 bg-white
        transition-all duration-300 ease-in-out
        lg:hidden
        ${
          isOpen
            ? "max-h-[calc(100dvh-140px)] overflow-y-auto overscroll-contain opacity-100"
            : "max-h-0 overflow-y-hidden opacity-0"
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">

        {/* Navigation */}
        <nav aria-label="Mobile navigation" className="py-4">
          <p className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#A37878]">Discover the collection</p>
          {menuSettings.home && <Link href="/" onClick={onClose} className="mb-2 flex min-h-12 items-center justify-between rounded-lg px-3 text-sm font-medium text-[#3B3333] transition hover:bg-[#FAF4F1]">
            <span>Home</span><ArrowRight className="h-4 w-4 text-[#A37878]" />
          </Link>}
          <div className="space-y-2">
            {(categories ?? []).map((category) => {
              const hasChildren = Boolean(category.children?.length);
              const expanded = expandedCategory === category.slug;
              const panelId = `mobile-subcategories-${category.slug}`;
              return <section key={category.slug} className="overflow-hidden rounded-xl border border-[#EEE4E0] bg-white">
                <div className="flex min-h-12 items-center">
                  <Link href={`/${category.slug}`} onClick={onClose} className="flex min-h-12 min-w-0 flex-1 items-center px-3 text-sm font-medium text-[#3B3333] transition hover:text-[#965B5B]">
                    <span>{category.name}</span>
                  </Link>
                  {hasChildren && <button type="button" aria-label={`${expanded ? "Hide" : "Show"} ${category.name} subcategories`} aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpandedCategory(expanded ? null : category.slug)} className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#806B68] transition hover:bg-[#FAF4F1] hover:text-[#965B5B] focus-visible:outline-2 focus-visible:outline-[#B56F6F]">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                  </button>}
                </div>
                {hasChildren && <div id={panelId} hidden={!expanded} className="border-t border-[#F0E8E5] bg-[#FCF9F7] p-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {category.children?.slice(0, 10).map((child) => <Link key={child.slug} href={`/${child.slug}`} onClick={onClose} className="flex min-h-10 items-center justify-between gap-1 rounded-lg border border-[#F0E7E3] bg-white px-2.5 py-2 text-[11px] leading-4 text-[#665858] transition hover:border-[#D9BDB8] hover:bg-[#FFFDFC] hover:text-[#8F5555]">
                      <span>{child.name}</span><ArrowRight className="h-3 w-3 shrink-0 text-[#B69B96]" />
                    </Link>)}
                  </div>
                </div>}
              </section>;
            })}
          </div>
          {menuSettings.watchBuy && <Link href="/watch-buy" onClick={onClose} className="mb-2 flex min-h-12 items-center justify-between rounded-lg border border-[#EEE4E0] bg-white px-3 text-sm font-medium text-[#3B3333] transition hover:bg-[#FAF4F1] hover:text-[#965B5B]">
            <span>Watch &amp; Buy</span><ArrowRight className="h-4 w-4 text-[#A37878]" />
          </Link>}
          {menuSettings.shop && <Link href="/shop" onClick={onClose} className="mt-2 flex min-h-12 items-center justify-between rounded-lg bg-[#2B2525] px-3 text-sm font-medium text-white transition hover:bg-[#493B3B]">
            <span>Shop all</span><ArrowRight className="h-4 w-4" />
          </Link>}
        </nav>
        {/* Account Actions */}
        <div className="grid grid-cols-2 gap-3 py-5">

          {/* Account */}
          <Link
            href="/account"
            onClick={(event) => {
              onClose();
              if (!userName) {
                event.preventDefault();
                onSignIn();
              }
            }}
            className="
              col-span-2 flex min-h-14 items-center justify-center
              gap-3 rounded-xl
              border border-[#E8DADA] bg-[#F8EFEC]
              px-4 py-3.5
              text-sm font-semibold
              tracking-wide
              text-[#854F4F]
              transition
              hover:border-[#B56F6F]
              hover:bg-[#F3E3DE]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B56F6F]
            "
          >
            <UserIcon />
            <span className="px-1 text-center">{userName ? "My Account" : "Sign In / Sign Up"}</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            onClick={onClose}
            className="
              flex min-h-14 items-center justify-center
              gap-2 rounded-xl
              border border-neutral-200
              py-4
              text-xs font-medium
              tracking-wide
              text-neutral-700
              transition
              hover:border-neutral-400
              hover:bg-neutral-50
            "
          >
            <HeartIcon />
            <span>Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label={`Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            onClick={onClose}
            className="
              relative flex min-h-14 items-center justify-center
              gap-2 rounded-xl
              border border-neutral-200
              py-4
              text-xs font-medium
              tracking-wide
              text-neutral-700
              transition
              hover:border-neutral-400
              hover:bg-neutral-50
            "
          >
            <span className="relative">
              <BagIcon />

              <span
                className="
                  absolute -right-2 -top-2
                  flex h-4 min-w-4
                  items-center justify-center
                  rounded-full
                  bg-[#B56F6F]
                  px-1
                  text-[8px]
                  font-semibold
                  text-white
                "
              >
                {cartCount}
              </span>
            </span>

            <span>Bag</span>
          </Link>
        </div>

        {/* Bottom Brand Message */}
        <div className="border-t border-neutral-100 py-5 text-center">
          <p className="font-serif text-lg text-neutral-800">
            {brandName}
          </p>

          <p className="mt-1 text-[9px] tracking-[0.3em] text-neutral-400">
            ELEGANCE • STYLE • EVERYDAY
          </p>
        </div>

      </div>
    </div>
  );
}
