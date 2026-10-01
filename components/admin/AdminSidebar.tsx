"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface MenuItem {
  label: string;
  href: string;
  badge?: string;
  icon: ReactNode;
}
type AdminAccess = { permissions: string[]; isSuperAdmin: boolean };
const permissionByHref: Record<string, string> = {
  "/admin/dashboard": "dashboard.view", "/admin/products": "products.view", "/admin/inventory": "inventory.view", "/admin/suppliers": "suppliers.view", "/admin/categories": "categories.view",
  "/admin/orders": "orders.view", "/admin/audit": "audit.view", "/admin/returns": "returns.view",
  "/admin/delivery-zips": "delivery-zips.view", "/admin/customers": "customers.view",
  "/admin/homepage": "storefront.view", "/admin/brands": "brands.view", "/admin/coupons": "coupons.view",
  "/admin/banners": "banners.view", "/admin/reels": "storefront.view", "/admin/blog": "blog.view", "/admin/reviews": "reviews.view",
  "/admin/settings": "settings.view",
};

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m3 7 9-4 9 4-9 4-9-4Z" />
        <path d="m3 12 9 4 9-4M3 17l9 4 9-4" />
      </svg>
    ),
  },
  {
    label: "Suppliers & Purchases",
    href: "/admin/suppliers",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 8h18v12H3zM7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
        <path d="M3 13h18M10 13v2h4v-2" />
      </svg>
    ),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <path d="M6 2h12l3 5H3l3-5Z" />
        <path d="M3 7h18v13H3z" />
      </svg>
    ),
  },
  {
    label: "Audit Management",
    href: "/admin/audit",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3h6l1 2h4v16H4V5h4l1-2Z" />
        <path d="M8 11h8M8 15h8M8 7h3" />
      </svg>
    ),
  },
  {
    label: "Returns & Replacements",
    href: "/admin/returns",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10a6 6 0 0 1 0 12h-2" />
        <path d="M4 9v5" />
      </svg>
    ),
  },
  {
    label: "Delivery To ZIP",
    href: "/admin/delivery-zips",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4.2 3.4-6 8-6s7.2 1.8 8 6" />
      </svg>
    ),
  },
];

const marketingItems: MenuItem[] = [
  {
    label: "Storefront",
    href: "/admin/homepage",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
        <path d="M9 21v-7h6v7" />
      </svg>
    ),
  },
  {
    label: "Brand Management",
    href: "/admin/brands",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" />
      </svg>
    ),
  },  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <path d="M20 12a2 2 0 0 0 0-4V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3a2 2 0 0 0 0-4Z" />
        <path d="m9 9 6 6" />
        <path d="M15 9h.01" />
        <path d="M9 15h.01" />
      </svg>
    ),
  },
  {
    label: "Banners",
    href: "/admin/banners",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-4.5-4.5L9 18l-3-3-3 3" />
      </svg>
    ),
  },
  {
    label: "Blog Management",
    href: "/admin/blog",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 4h16v16H4z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    label: "Reel Manager",
    href: "/admin/reels",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    ),
  },
  {
    label: "Roles & Permissions",
    href: "/admin/roles",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.4-3 2.2-4.5 5.5-4.5s5.1 1.5 5.5 4.5M16 7h5m-5 4h5m-5 4h5" />
      </svg>
    ),
  },  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      </svg>
    ),
  },
];

function SettingsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.6H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [adminAccess, setAdminAccess] = useState<AdminAccess | null>(null);
  const [pendingOrderCount, setPendingOrderCount] = useState<number | null>(null);
  const [pendingReturnCount, setPendingReturnCount] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;
    fetch("/api/admin/access", { cache: "no-store" }).then(response => response.ok ? response.json() : Promise.reject()).then((payload: AdminAccess & { success?: boolean }) => {
      if (isActive && payload.success) setAdminAccess({ permissions: payload.permissions, isSuperAdmin: payload.isSuperAdmin });
    }).catch(() => { if (isActive) setAdminAccess({ permissions: [], isSuperAdmin: false }); });
    const loadPendingOrderCount = async () => {
      const [ordersResult, returnsResult] = await Promise.allSettled([
        fetch("/api/orders?summary=count", { cache: "no-store" }).then((response) => response.json()),
        fetch("/api/admin/service-requests?summary=count", { cache: "no-store" }).then((response) => response.json()),
      ]);
      if (!isActive) return;
      if (ordersResult.status === "fulfilled" && ordersResult.value.success && Number.isFinite(ordersResult.value.count)) {
        setPendingOrderCount(ordersResult.value.count);
      }
      if (returnsResult.status === "fulfilled" && returnsResult.value.success && Number.isFinite(returnsResult.value.count)) {
        setPendingReturnCount(returnsResult.value.count);
      }
    };

    void loadPendingOrderCount();
    window.addEventListener("focus", loadPendingOrderCount);
    return () => {
      isActive = false;
      window.removeEventListener("focus", loadPendingOrderCount);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.href);
    const badge = item.label === "Orders" ? pendingOrderCount : item.label === "Returns & Replacements" ? pendingReturnCount : item.badge;
    const showBadge = typeof badge === "number" ? badge > 0 : Boolean(badge);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          active
            ? "bg-[#f3ebe7] font-medium text-[#72574e]"
            : "text-[#665b56] hover:bg-[#faf8f6]"
        }`}
      >
        {item.icon}

        <span>{item.label}</span>

        {showBadge && (
          <span aria-label={item.label === "Orders" ? `${badge} pending orders` : item.label === "Returns & Replacements" ? `${badge} requests need review` : undefined} className="ml-auto rounded-full bg-[#f3ebe7] px-2 py-0.5 text-[10px] font-semibold text-[#8a6256]">
            {typeof badge === "number" && badge > 99 ? "99+" : badge}
          </span>
        )}
      </Link>
    );
  };

  const canSee = (item: MenuItem) => {
    if (!adminAccess) return true;
    if (adminAccess.isSuperAdmin) return true;
    if (item.href === "/admin/roles") return false;
    const permission = permissionByHref[item.href];
    return !permission || adminAccess.permissions.includes(permission);
  };
  const visibleMenuItems = menuItems.filter(canSee);
  const visibleMarketingItems = marketingItems.filter(canSee);
  const sidebarContent = (
    <nav className="h-full overflow-y-auto p-4">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a49a95]">
        Main Menu
      </p>

      <div className="space-y-1">
        {visibleMenuItems.map(renderMenuItem)}
      </div>

      {visibleMarketingItems.length > 0 && <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a49a95]">Marketing</p>}

      <div className="space-y-1">
        {visibleMarketingItems.map(renderMenuItem)}
      </div>

      {canSee({ label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> }) && <>
        <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a49a95]">System</p>
        {renderMenuItem({ label: "Settings", href: "/admin/settings", icon: <SettingsIcon /> })}
      </>}
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-[#eee6e1] bg-white lg:block">
        <div className="sticky top-[72px] h-[calc(100vh-72px)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-black/30"
          />

          <aside className="relative h-full w-[280px] bg-white shadow-2xl">
            <div className="flex h-[72px] items-center justify-between border-b border-[#eee6e1] px-5">
              <Link href="/admin/dashboard" onClick={onClose}>
                <Image
                  src="/vayziq/vayziq-logo-final.svg"
                  alt="Vayziq Admin"
                  width={420}
                  height={96}
                  className="h-auto w-36"
                />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#665b56] hover:bg-[#faf8f6]"
                aria-label="Close menu"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="h-[calc(100vh-72px)]">
              {sidebarContent}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
