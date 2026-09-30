import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, status: "active", slug: { in: ["men", "women"] } },
    include: { children: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <main className="min-h-screen bg-[#fafafa] px-4 py-7 sm:px-8"><div className="mx-auto max-w-3xl"><div className="mb-6"><p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#b77e00]">Browse</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#111]">Shop by Category</h1><p className="mt-2 text-sm text-[#666]">Choose a collection to explore its latest styles.</p></div><div className="space-y-4">{categories.map((category) => <section key={category.id} className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white"><Link href={`/${category.slug}`} className="flex items-center justify-between bg-[#111] px-5 py-4 text-white"><span className="flex items-center gap-3"><Layers className="h-5 w-5 text-[#fbb606]" /><b className="text-lg">{category.name}</b></span><span className="flex items-center gap-1 text-xs font-bold">View all <ChevronRight className="h-4 w-4" /></span></Link><div className="grid grid-cols-2 divide-x divide-y divide-[#ededed]">{category.children.map((child) => <Link key={child.id} href={`/${child.slug}`} className="flex min-h-14 items-center justify-between px-4 text-sm font-semibold text-[#222] hover:bg-[#fff7dc]"><span>{child.name}</span><ChevronRight className="h-4 w-4 text-[#777]" /></Link>)}</div></section>)}{!categories.length && <div className="rounded-xl border border-dashed border-[#ddd] bg-white p-10 text-center text-sm text-[#666]">No active categories are available yet.</div>}</div></div></main>;
}
