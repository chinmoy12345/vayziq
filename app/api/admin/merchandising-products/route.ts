import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOME_KEY = "homepage_you_may_like_products";
const productKey = (id: number) => `product_related_products_${id}`;

function idsFrom(value: unknown, limit = 12) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter(id => Number.isSafeInteger(id) && id > 0))].slice(0, limit);
}

export async function GET(request: Request) {
  const productId = Number(new URL(request.url).searchParams.get("productId") || 0);
  if (!(await requireAdminPermission(productId > 0 ? "products" : "storefront", "view"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const key = productId > 0 ? productKey(productId) : HOME_KEY;
  const [setting, products] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { key }, select: { value: true } }),
    prisma.product.findMany({
      where: { status: "active", category: { status: "active" }, ...(productId > 0 ? { id: { not: productId } } : {}) },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      select: { id: true, name: true, sku: true, category: { select: { name: true } }, images: { orderBy: { sortOrder: "asc" }, take: 1, select: { image: true } } },
    }),
  ]);
  return NextResponse.json({ ids: idsFrom(setting?.value, productId > 0 ? 4 : 12), products: products.map(product => ({ ...product, image: product.images[0]?.image ?? "/logo.png", images: undefined })) });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null) as { productId?: unknown; ids?: unknown } | null;
  if (!body) return NextResponse.json({ message: "Invalid selection." }, { status: 400 });
  const productId = Number(body.productId || 0);
  if (!(await requireAdminPermission(productId > 0 ? "products" : "storefront", "update"))) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  const ids = idsFrom(body.ids, productId > 0 ? 4 : 12).filter(id => id !== productId);
  const existing = await prisma.product.findMany({ where: { id: { in: ids }, status: "active" }, select: { id: true } });
  const existingIds = new Set(existing.map(product => product.id));
  const validIds = ids.filter(id => existingIds.has(id));
  const key = productId > 0 ? productKey(productId) : HOME_KEY;
  await prisma.storeSetting.upsert({ where: { key }, update: { value: validIds as Prisma.InputJsonValue }, create: { key, value: validIds as Prisma.InputJsonValue } });
  return NextResponse.json({ ids: validIds });
}
