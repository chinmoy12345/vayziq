import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const adjustmentReasons = new Set(["restock", "correction", "damage", "return"]);
type InventoryRow = {
  id: string; productId: number; variantId: number | null; name: string; category: string;
  productSku: string; sku: string; variantLabel: string; stock: number; reorderLevel: number;
  status: "active" | "draft";
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  if (!(await requireAdminPermission("inventory", "view"))) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
  }

  try {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const products = await prisma.product.findMany({
    where: search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { variants: { some: { sku: { contains: search, mode: "insensitive" } } } },
      ],
    } : undefined,
    select: {
      id: true, name: true, sku: true, stock: true, reorderLevel: true,
      status: true, hasVariations: true, category: { select: { name: true } },
      variants: {
        orderBy: { sku: "asc" },
        select: {
          id: true, sku: true, stock: true, reorderLevel: true,
          variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    take: 1500,
  });

  const items = products.flatMap<InventoryRow>(product => product.hasVariations && product.variants.length
    ? product.variants.map(variant => ({
        id: `variant-${variant.id}`, productId: product.id, variantId: variant.id,
        name: product.name, category: product.category.name, productSku: product.sku,
        sku: variant.sku,
        variantLabel: variant.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · "),
        stock: variant.stock, reorderLevel: variant.reorderLevel, status: product.status,
      }))
    : [{
        id: `product-${product.id}`, productId: product.id, variantId: null,
        name: product.name, category: product.category.name, productSku: product.sku,
        sku: product.sku, variantLabel: "",
        stock: product.stock, reorderLevel: product.reorderLevel, status: product.status,
      }]
  );
  const filter = url.searchParams.get("filter");
  const filteredItems = filter === "low"
    ? items.filter(item => item.stock > 0 && item.stock <= item.reorderLevel)
    : filter === "out" ? items.filter(item => item.stock <= 0) : items;
  const movements = await prisma.inventoryMovement.findMany({
    orderBy: { createdAt: "desc" }, take: 60,
    select: {
      id: true, productName: true, sku: true, variantLabel: true, delta: true,
      previousStock: true, newStock: true, reason: true, note: true, createdAt: true,
      actor: { select: { name: true } }, order: { select: { orderNumber: true } }, supplier: { select: { name: true } }, purchase: { select: { purchaseNumber: true } },
    },
  });

  return NextResponse.json({ success: true, data: filteredItems, movements });
  } catch (error) {
    console.error("INVENTORY LOAD ERROR:", error);
    const schemaOutOfDate = error instanceof Prisma.PrismaClientKnownRequestError && ["P2021", "P2022"].includes(error.code);
    return NextResponse.json({
      success: false,
      message: schemaOutOfDate
        ? "Inventory database schema is not synced yet. Run the database sync before using this page."
        : "Inventory could not be loaded. Check the server logs and try again.",
    }, { status: 503 });
  }
}
export async function POST(request: Request) {
  const actor = await requireAdminPermission("inventory", "update");
  if (!actor) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 403 });
  const body = await request.json().catch(() => null) as unknown;
  if (!isRecord(body)) return NextResponse.json({ success: false, message: "Invalid inventory update." }, { status: 400 });

  const productId = Number(body.productId);
  const variantId = body.variantId === null || body.variantId === undefined ? null : Number(body.variantId);
  if (!Number.isSafeInteger(productId) || productId < 1 || (variantId !== null && (!Number.isSafeInteger(variantId) || variantId < 1))) {
    return NextResponse.json({ success: false, message: "Select a valid product or variant." }, { status: 400 });
  }

  if (body.mode === "threshold") {
    const reorderLevel = Number(body.reorderLevel);
    if (!Number.isSafeInteger(reorderLevel) || reorderLevel < 0 || reorderLevel > 1_000_000) {
      return NextResponse.json({ success: false, message: "Enter a reorder level from 0 to 1,000,000." }, { status: 400 });
    }
    if (variantId !== null) {
      const updated = await prisma.productVariant.updateMany({ where: { id: variantId, productId }, data: { reorderLevel } });
      if (!updated.count) return NextResponse.json({ success: false, message: "Product variant not found." }, { status: 404 });
    } else {
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { hasVariations: true } });
      if (!product) return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
      if (product.hasVariations) return NextResponse.json({ success: false, message: "Set reorder levels on each product variant." }, { status: 400 });
      await prisma.product.update({ where: { id: productId }, data: { reorderLevel } });
    }
    return NextResponse.json({ success: true, reorderLevel });
  }

  const delta = Number(body.delta);
  const reason = typeof body.reason === "string" ? body.reason : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 1_000_000 || !adjustmentReasons.has(reason) || note.length > 500) {
    return NextResponse.json({ success: false, message: "Enter a valid quantity change and reason." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true, name: true, sku: true, stock: true, hasVariations: true } });
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      let previousStock = product.stock;
      let stockSku = product.sku;
      let stockVariantId: number | null = null;
      let variantLabel: string | null = null;

      if (variantId !== null) {
        if (!product.hasVariations) throw new Error("VARIANT_NOT_ALLOWED");
        const variant = await tx.productVariant.findFirst({
          where: { id: variantId, productId },
          select: {
            id: true, sku: true, stock: true,
            variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } },
          },
        });
        if (!variant) throw new Error("VARIANT_NOT_FOUND");
        previousStock = variant.stock;
        stockSku = variant.sku;
        stockVariantId = variant.id;
        variantLabel = variant.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ");
      } else if (product.hasVariations) {
        throw new Error("VARIANT_REQUIRED");
      }

      const newStock = previousStock + delta;
      if (newStock < 0) throw new Error("INSUFFICIENT_STOCK");
      if (stockVariantId !== null) {
        const updatedVariant = await tx.productVariant.updateMany({ where: { id: stockVariantId, productId, stock: previousStock }, data: { stock: newStock } });
        if (!updatedVariant.count) throw new Error("STOCK_CHANGED");
        const aggregate = await tx.productVariant.aggregate({ where: { productId }, _sum: { stock: true } });
        await tx.product.update({ where: { id: productId }, data: { stock: aggregate._sum.stock ?? 0 } });
      } else {
        const updatedProduct = await tx.product.updateMany({ where: { id: productId, stock: previousStock }, data: { stock: newStock } });
        if (!updatedProduct.count) throw new Error("STOCK_CHANGED");
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          productId, variantId: stockVariantId, productName: product.name, sku: stockSku,
          variantLabel, delta, previousStock, newStock, reason, note: note || null, actorId: Number(actor.sub),
        },
        select: { id: true, newStock: true },
      });
      return movement;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "PRODUCT_NOT_FOUND" || message === "VARIANT_NOT_FOUND") return NextResponse.json({ success: false, message: "The selected product or variant no longer exists." }, { status: 404 });
    if (message === "INSUFFICIENT_STOCK") return NextResponse.json({ success: false, message: "This change cannot make stock negative." }, { status: 409 });
    if (message === "VARIANT_REQUIRED" || message === "VARIANT_NOT_ALLOWED") return NextResponse.json({ success: false, message: "Choose a valid stock row for this product." }, { status: 400 });
    if (message === "STOCK_CHANGED" || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")) return NextResponse.json({ success: false, message: "Stock changed at the same time. Refresh and try again." }, { status: 409 });
    console.error("INVENTORY ADJUSTMENT ERROR:", error);
    return NextResponse.json({ success: false, message: "Unable to save the inventory change." }, { status: 500 });
  }
}
