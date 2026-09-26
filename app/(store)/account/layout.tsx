import type { Metadata } from "next";

// app/account/layout.tsx

import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  User,
  MapPin,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const menuItems = [
  {
    href: "/account",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/account/orders",
    label: "My Orders",
    icon: ShoppingBag,
  },
  {
    href: "/account/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    href: "/account/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/account/addresses",
    label: "Addresses",
    icon: MapPin,
  },
];

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <div className="min-h-screen bg-[#faf8f6]">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-4">

            {/* Account Title */}
            <div className="border-b border-gray-100 px-3 pb-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                My Account
              </p>

              <h2 className="mt-1 text-lg font-semibold text-gray-900">
                Account
              </h2>
            </div>

            {/* Navigation */}
            <nav className="mt-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      group flex items-center gap-3 rounded-xl
                      px-3 py-2.5 text-sm font-medium
                      text-gray-600 transition
                      hover:bg-[#b56f6f]/10
                      hover:text-[#9b5c5c]
                    "
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <LogoutButton />
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="min-w-0 flex-1">

          {/* Mobile Navigation */}
          <div className="mb-5 overflow-x-auto md:hidden">
            <div className="flex min-w-max gap-2 rounded-2xl border border-gray-200 bg-white p-2">

              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      flex items-center gap-2 rounded-xl
                      px-3 py-2 text-xs font-medium
                      text-gray-600 whitespace-nowrap
                      transition hover:bg-[#b56f6f]/10
                      hover:text-[#9b5c5c]
                    "
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              <LogoutButton compact />

            </div>
          </div>

          {/* Page */}
          {children}

        </div>
      </div>
    </div>
  );
}

