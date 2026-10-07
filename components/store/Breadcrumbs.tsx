import Link from "next/link";
import { ChevronRight } from "lucide-react";
export default function Breadcrumbs({ title, category, isShop, parent }: { title: string; category?: string; isShop: boolean; parent?: { label: string; href: string } }) {
  const current = isShop && category ? category : title;
  const middle = parent ?? (!isShop || category ? { label: "Shop", href: "/shop" } : null);
  return <nav aria-label="Breadcrumb" className="border-b border-[#e8e8e8] bg-[#f7f7f7]"><ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-3.5 text-xs text-[#666] sm:px-8 lg:px-10"><li><Link href="/" className="transition hover:text-[#111]">Home</Link></li>{middle && <><li aria-hidden="true"><ChevronRight size={13} /></li><li><Link href={middle.href} className="transition hover:text-[#111]">{middle.label}</Link></li></>}<li aria-hidden="true"><ChevronRight size={13} /></li><li aria-current="page" className="min-w-0 truncate font-semibold text-[#111]">{current}</li></ol></nav>;
}
