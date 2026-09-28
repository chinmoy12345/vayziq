"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closeOnOutsideClick); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <header className="sticky top-0 z-40 border-b border-[#eee6e1] bg-white/95 backdrop-blur">
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-5 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eee6e1] text-[#665b56] lg:hidden"
            aria-label="Open menu"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </button>

          {/* Brand */}
          <Link href="/admin/dashboard">
            <Image
              src="/vayziq/vayziq-logo.png"
              alt="VAYZIQ Admin"
              width={236}
              height={73}
              priority
              className="h-auto w-28 sm:w-32"
            />
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* View Store */}
          <Link
            href="/"
            target="_blank"
            className="hidden text-xs font-medium text-[#817671] transition hover:text-[#5d4c46] md:block"
          >
            View Store
          </Link>

          <div className="hidden h-8 w-px bg-[#eee6e1] md:block" />

          {/* Notification */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#eee6e1] text-[#665b56] transition hover:bg-[#faf8f6]"
            aria-label="Notifications"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#a87567]" />
          </button>

          <div className="hidden h-8 w-px bg-[#eee6e1] sm:block" />

          {/* Profile */}
          <div ref={menuRef} className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eadbd5] text-sm font-medium text-[#72574e]">
              SC
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-medium">
                Super Admin
              </p>

              <p className="text-xs text-[#958b86]">
                Administrator
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="ml-1 hidden rounded-lg p-1 text-[#8c817c] transition hover:bg-[#faf8f6] hover:text-[#292321] sm:block"
              aria-label="Open account menu"
              aria-expanded={menuOpen}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[52px] z-50 w-56 overflow-hidden rounded-xl border border-[#e9e2de] bg-white py-1.5 shadow-xl shadow-black/10">
                <div className="border-b border-[#f0e9e5] px-4 py-3">
                  <p className="text-sm font-semibold text-[#292321]">Super Admin</p>
                  <p className="mt-0.5 text-xs text-[#958b86]">Administrator account</p>
                </div>
                <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#514945] transition hover:bg-[#faf8f6]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7f0ec] text-[#8e7770]">⚙</span>Settings
                </Link>
                <Link href="/admin/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#514945] transition hover:bg-[#faf8f6]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7f0ec] text-[#8e7770]">◉</span>Profile
                </Link>
                <div className="my-1 border-t border-[#f0e9e5]" />
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-[#b24f4f] transition hover:bg-red-50">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">↪</span>Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
