import prisma from "@/lib/db";
import { parseSizeGuide, sizeGuideKey, type CategorySizeGuide } from "@/lib/size-guide-data";

export async function getCategorySizeGuide(categoryId: number): Promise<CategorySizeGuide | null> {
  const visited = new Set<number>();
  let currentId: number | null = categoryId;
  while (currentId !== null && !visited.has(currentId)) {
    visited.add(currentId);
    const setting = await prisma.storeSetting.findUnique({ where: { key: sizeGuideKey(currentId) }, select: { value: true } });
    const guide = parseSizeGuide(setting?.value);
    if (guide?.enabled) return guide;
    const category: { parentId: number | null } | null = await prisma.category.findUnique({ where: { id: currentId }, select: { parentId: true } });
    currentId = category?.parentId ?? null;
  }
  return null;
}
