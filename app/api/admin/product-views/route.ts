import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { ACTIVE_VIEW_WINDOW_MS, presencePrefix, readTotalViews, totalViewKey } from "@/lib/product-views";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!(await requireAdminPermission("storefront", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const requestedPage = Number(request.nextUrl.searchParams.get("page") || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100_000) : 1;
  const search = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 120);
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, select: { id: true, name: true, slug: true, status: true }, orderBy: { id: "desc" }, take: 20, skip: (page - 1) * 20 }),
    prisma.product.count({ where }),
  ]);
  const cutoff = new Date(Date.now() - ACTIVE_VIEW_WINDOW_MS);
  const [totals, active] = products.length ? await Promise.all([
    prisma.storeSetting.findMany({ where: { key: { in: products.map(product => totalViewKey(product.id)) } }, select: { key: true, value: true } }),
    prisma.storeSetting.findMany({ where: { OR: products.map(product => ({ key: { startsWith: presencePrefix(product.id) } })), updatedAt: { gt: cutoff } }, select: { key: true } }),
  ]) : [[], []];
  const totalByKey = new Map(totals.map(row => [row.key, readTotalViews(row.value)]));
  const activeByProduct = new Map<number, number>();
  for (const row of active) {
    const id = Number(row.key.split("_")[3]);
    activeByProduct.set(id, (activeByProduct.get(id) || 0) + 1);
  }
  return NextResponse.json({ products: products.map(product => ({ ...product, totalViews: totalByKey.get(totalViewKey(product.id)) || 0, activeViewers: activeByProduct.get(product.id) || 0 })), total, page, pageSize: 20, updatedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
