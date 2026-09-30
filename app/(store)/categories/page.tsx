import { Layers } from "lucide-react";
import prisma from "@/lib/db";
import CategoryBrowser from "@/components/store/CategoryBrowser";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, status: "active", slug: { in: ["men", "women"] } },
    include: { children: { where: { status: "active" }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className="min-h-screen bg-[#fffdf9] pb-10">
      <header className="border-b border-black/[.06] bg-white px-4 pb-5 pt-6 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-extrabold tracking-[-.06em] text-[#111] sm:text-4xl">Shop by category</h1>
              <p className="mt-1 max-w-md text-sm leading-5 text-[#746d67]">Choose a collection and find your next everyday favourite.</p>
            </div>
            <Layers className="mb-1 h-6 w-6 text-[#f5b400] sm:h-8 sm:w-8" aria-hidden="true" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-8 sm:pt-8">
        <CategoryBrowser categories={categories} />
      </div>
    </main>
  );
}
