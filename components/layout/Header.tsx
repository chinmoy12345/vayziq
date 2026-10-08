"use client";

import { usePathname } from "next/navigation";
import HomeHeader from "@/components/home/HomeHeader";
import type { StoreMenuSettings } from "@/lib/store-menu-settings";

/** Shared customer-facing header. The homepage renders the same component in its campaign body. */
export default function Header({ menuSettings }: { menuSettings: StoreMenuSettings }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <HomeHeader menuSettings={menuSettings} />;
}
