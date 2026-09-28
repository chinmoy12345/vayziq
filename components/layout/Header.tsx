"use client";

import { usePathname } from "next/navigation";
import HomeHeader from "@/components/home/HomeHeader";

/** Shared customer-facing header. The homepage renders the same component in its campaign body. */
export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <HomeHeader />;
}
