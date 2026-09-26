import Link from "next/link";
import { ChevronRight } from "lucide-react";
export default function Breadcrumbs({ title, category, isShop }: { title: string; category?: string; isShop: boolean }) {
  const current = isShop && category ? category : title;
  return <nav aria-label="Breadcrumb" className="border-b border-[#E8DADA] bg-[#FFFDFC]"><ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-4 text-xs text-[#8A7777] sm:px-8 lg:px-10"><li><Link href="/" className="transition hover:text-[#9F5E5E]">Home</Link></li>{(!isShop || category) && <><li aria-hidden="true"><ChevronRight size={13} /></li><li><Link href="/shop" className="transition hover:text-[#9F5E5E]">Shop</Link></li></>}<li aria-hidden="true"><ChevronRight size={13} /></li><li aria-current="page" className="font-medium text-[#4F4444]">{current}</li></ol></nav>;
}
