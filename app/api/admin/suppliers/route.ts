import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result ? result.slice(0, max) : null;
}
function moneyCents(value: unknown): number | null {
  const parsed = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000_000) return null;
  return Math.round(parsed * 100);
}
function rupees(cents: number) { return Number((cents / 100).toFixed(2)); }
function cents(value: Prisma.Decimal | number | string) { return Math.round(Number(value) * 100); }
function variantText(values: Array<{ optionValue: { value: string; option: { name: string } } }>) {
  return values.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ");
}

export async function GET() {
  if (!(await requireAdminPermission("suppliers", "view"))) {
    return NextResponse.json({ success: false, message: "You do not have permission to view suppliers." }, { status: 403 });
  }
  try {
    const [suppliers, purchaseTotals, paymentTotals, purchases, products, canCreateSupplier, canManageSupplier, canReceiveStock, canRecordPayment] = await Promise.all([
      prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, contactName: true, phone: true, email: true, address: true, gstNumber: true, notes: true, createdAt: true } }),
      prisma.purchase.groupBy({ by: ["supplierId"], _sum: { total: true } }),
      prisma.supplierPayment.groupBy({ by: ["supplierId"], _sum: { amount: true } }),
      prisma.purchase.findMany({ orderBy: { receivedAt: "desc" }, take: 200, include: { supplier: { select: { id: true, name: true } }, items: { orderBy: { id: "asc" }, select: { id: true, productName: true, sku: true, variantLabel: true, quantity: true, unitCost: true, total: true } }, payments: { orderBy: { paidAt: "desc" }, select: { id: true, amount: true, method: true, reference: true, note: true, paidAt: true } } } }),
      prisma.product.findMany({ where: { status: { in: ["active", "draft"] } }, orderBy: { name: "asc" }, take: 1500, select: { id: true, name: true, sku: true, hasVariations: true, variants: { orderBy: { sku: "asc" }, select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } } } } }),
      requireAdminPermission("suppliers", "create").then(Boolean),
      requireAdminPermission("suppliers", "update").then(Boolean),
      requireAdminPermission("inventory", "update").then(Boolean),
      requireAdminPermission("suppliers", "update").then(Boolean),
    ]);
    const purchasedBySupplier = new Map(purchaseTotals.map(item => [item.supplierId, Number(item._sum.total ?? 0)]));
    const paidBySupplier = new Map(paymentTotals.map(item => [item.supplierId, Number(item._sum.amount ?? 0)]));
    const purchaseData = purchases.map(purchase => {
      const total = Number(purchase.total);
      const paid = purchase.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      return { ...purchase, total, paid, due: Math.max(0, Number((total - paid).toFixed(2))) };
    });
    const catalog = products.flatMap<{ productId: number; variantId: number | null; name: string; sku: string; label: string }>(product => product.hasVariations && product.variants.length
      ? product.variants.map(variant => ({ productId: product.id, variantId: variant.id, name: product.name, sku: variant.sku, label: variantText(variant.variantValues) }))
      : [{ productId: product.id, variantId: null, name: product.name, sku: product.sku, label: "" }]
    );
    return NextResponse.json({
      success: true,
      permissions: { canCreateSupplier, canManageSupplier, canReceiveStock, canRecordPayment },
      suppliers: suppliers.map(supplier => {
        const purchased = purchasedBySupplier.get(supplier.id) ?? 0;
        const paid = paidBySupplier.get(supplier.id) ?? 0;
        return { ...supplier, purchaseTotal: purchased, paidTotal: paid, dueTotal: Math.max(0, Number((purchased - paid).toFixed(2))) };
      }),
      purchases: purchaseData,
      products: catalog,
    });
  } catch (error) {
    console.error("SUPPLIER LEDGER LOAD ERROR:", error);
    return NextResponse.json({ success: false, message: "Supplier records could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as unknown;
  if (!record(body) || typeof body.action !== "string") return NextResponse.json({ success: false, message: "Invalid supplier ledger request." }, { status: 400 });

  if (body.action === "supplier") {
    const actor = await requireAdminPermission("suppliers", body.id ? "update" : "create");
    if (!actor) return NextResponse.json({ success: false, message: "You do not have permission to manage suppliers." }, { status: 403 });
    const name = text(body.name, 160);
    if (!name) return NextResponse.json({ success: false, message: "Supplier name is required." }, { status: 400 });
    const data = {
      name,
      contactName: text(body.contactName, 160),
      phone: text(body.phone, 40),
      email: text(body.email, 200),
      address: text(body.address, 1000),
      gstNumber: text(body.gstNumber, 40),
      notes: text(body.notes, 1000),
    };
    if (body.id) {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ success: false, message: "Invalid supplier." }, { status: 400 });
      const supplier = await prisma.supplier.update({ where: { id }, data });
      return NextResponse.json({ success: true, data: supplier });
    }
    const supplier = await prisma.supplier.create({ data });
    return NextResponse.json({ success: true, data: supplier }, { status: 201 });
  }

  if (body.action === "purchase") {
    const actor = await requireAdminPermission("inventory", "update");
    if (!actor) return NextResponse.json({ success: false, message: "Inventory update permission is required to receive purchased stock." }, { status: 403 });
    const supplierId = Number(body.supplierId);
    const initialPaymentCents = moneyCents(body.initialPayment ?? 0);
    const initialPaymentMethod = typeof body.initialPaymentMethod === "string" ? body.initialPaymentMethod : "bank_transfer";
    const paymentMethods = new Set(["cash", "bank_transfer", "upi", "card", "other"]);
    if (!Number.isSafeInteger(supplierId) || supplierId < 1 || initialPaymentCents === null || !paymentMethods.has(initialPaymentMethod) || !Array.isArray(body.items) || body.items.length < 1 || body.items.length > 40) {
      return NextResponse.json({ success: false, message: "Choose a supplier and add between 1 and 40 valid purchase lines." }, { status: 400 });
    }
    const lines = body.items.map((line: unknown) => {
      if (!record(line)) return null;
      const productId = Number(line.productId);
      const variantId = line.variantId == null ? null : Number(line.variantId);
      const quantity = Number(line.quantity);
      const unitCostCents = moneyCents(line.unitCost);
      if (!Number.isSafeInteger(productId) || productId < 1 || (variantId !== null && (!Number.isSafeInteger(variantId) || variantId < 1)) || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1_000_000 || unitCostCents === null) return null;
      return { productId, variantId, quantity, unitCostCents, totalCents: quantity * unitCostCents };
    });
    if (lines.some(line => line === null)) return NextResponse.json({ success: false, message: "Each line needs a valid product, quantity, and unit cost." }, { status: 400 });
    const validLines = lines as Array<{ productId: number; variantId: number | null; quantity: number; unitCostCents: number; totalCents: number }>;
    const totalCents = validLines.reduce((sum, line) => sum + line.totalCents, 0);
    if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || initialPaymentCents > totalCents) return NextResponse.json({ success: false, message: "Initial payment cannot exceed the purchase total." }, { status: 400 });
    const receivedAt = body.receivedAt ? new Date(String(body.receivedAt)) : new Date();
    if (!Number.isFinite(receivedAt.getTime())) return NextResponse.json({ success: false, message: "Enter a valid stock received date." }, { status: 400 });

    try {
      const purchase = await prisma.$transaction(async tx => {
        const supplier = await tx.supplier.findFirst({ where: { id: supplierId, active: true }, select: { id: true } });
        if (!supplier) throw new Error("SUPPLIER_NOT_FOUND");
        const result = await tx.purchase.create({
          data: {
            purchaseNumber: `PO-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`,
            supplierId, createdById: Number(actor.sub), total: rupees(totalCents), note: text(body.note, 1000), receivedAt,
          },
          select: { id: true, purchaseNumber: true, supplierId: true, total: true, receivedAt: true },
        });
        for (const line of validLines) {
          const product = await tx.product.findUnique({ where: { id: line.productId }, select: { id: true, name: true, sku: true, stock: true, hasVariations: true } });
          if (!product) throw new Error("PRODUCT_NOT_FOUND");
          let sku = product.sku;
          let label: string | null = null;
          let previousStock = product.stock;
          if (product.hasVariations) {
            if (line.variantId === null) throw new Error("VARIANT_REQUIRED");
            const variant = await tx.productVariant.findFirst({ where: { id: line.variantId, productId: product.id }, select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } } });
            if (!variant) throw new Error("VARIANT_NOT_FOUND");
            sku = variant.sku;
            label = variantText(variant.variantValues);
            previousStock = variant.stock;
            const updated = await tx.productVariant.updateMany({ where: { id: variant.id, productId: product.id, stock: previousStock }, data: { stock: previousStock + line.quantity } });
            if (!updated.count) throw new Error("STOCK_CHANGED");
            const aggregate = await tx.productVariant.aggregate({ where: { productId: product.id }, _sum: { stock: true } });
            await tx.product.update({ where: { id: product.id }, data: { stock: aggregate._sum.stock ?? 0 } });
          } else {
            if (line.variantId !== null) throw new Error("VARIANT_NOT_ALLOWED");
            const updated = await tx.product.updateMany({ where: { id: product.id, stock: previousStock }, data: { stock: previousStock + line.quantity } });
            if (!updated.count) throw new Error("STOCK_CHANGED");
          }
          const itemTotal = rupees(line.totalCents);
          await tx.purchaseItem.create({ data: { purchaseId: result.id, productId: product.id, variantId: line.variantId, productName: product.name, sku, variantLabel: label, quantity: line.quantity, unitCost: rupees(line.unitCostCents), total: itemTotal } });
          await tx.inventoryMovement.create({ data: { productId: product.id, variantId: line.variantId, supplierId, purchaseId: result.id, actorId: Number(actor.sub), productName: product.name, sku, variantLabel: label, delta: line.quantity, previousStock, newStock: previousStock + line.quantity, reason: "purchase", note: `Received on ${result.purchaseNumber}` } });
        }
        if (initialPaymentCents > 0) await tx.supplierPayment.create({ data: { supplierId, purchaseId: result.id, recordedById: Number(actor.sub), amount: rupees(initialPaymentCents), method: initialPaymentMethod, reference: text(body.initialPaymentReference, 120), note: "Paid when stock was received" } });
        return result;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return NextResponse.json({ success: true, data: purchase }, { status: 201 });
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "SUPPLIER_NOT_FOUND") return NextResponse.json({ success: false, message: "Supplier not found or inactive." }, { status: 404 });
      if (code === "PRODUCT_NOT_FOUND" || code === "VARIANT_NOT_FOUND") return NextResponse.json({ success: false, message: "A selected product or variant no longer exists." }, { status: 404 });
      if (code === "VARIANT_REQUIRED" || code === "VARIANT_NOT_ALLOWED") return NextResponse.json({ success: false, message: "Select the correct size or colour variant for each product." }, { status: 400 });
      if (code === "STOCK_CHANGED" || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")) return NextResponse.json({ success: false, message: "Stock changed while receiving this purchase. Refresh and try again." }, { status: 409 });
      console.error("SUPPLIER PURCHASE ERROR:", error);
      return NextResponse.json({ success: false, message: "Purchase could not be received." }, { status: 500 });
    }
  }

  if (body.action === "payment") {
    const actor = await requireAdminPermission("suppliers", "update");
    if (!actor) return NextResponse.json({ success: false, message: "Supplier update permission is required to record payments." }, { status: 403 });
    const supplierId = Number(body.supplierId);
    const purchaseId = Number(body.purchaseId);
    const amountCents = moneyCents(body.amount);
    const method = typeof body.method === "string" ? body.method : "";
    const allowedMethods = new Set(["cash", "bank_transfer", "upi", "card", "other"]);
    if (!Number.isSafeInteger(supplierId) || supplierId < 1 || !Number.isSafeInteger(purchaseId) || purchaseId < 1 || amountCents === null || amountCents < 1 || !allowedMethods.has(method)) {
      return NextResponse.json({ success: false, message: "Enter a valid amount, purchase, and payment method." }, { status: 400 });
    }
    try {
      const payment = await prisma.$transaction(async tx => {
        const purchase = await tx.purchase.findFirst({ where: { id: purchaseId, supplierId }, select: { id: true, total: true, payments: { select: { amount: true } } } });
        if (!purchase) throw new Error("PURCHASE_NOT_FOUND");
        const dueCents = cents(purchase.total) - purchase.payments.reduce((sum, value) => sum + cents(value.amount), 0);
        if (amountCents > dueCents) throw new Error("PAYMENT_EXCEEDS_DUE");
        return tx.supplierPayment.create({ data: { supplierId, purchaseId, recordedById: Number(actor.sub), amount: rupees(amountCents), method, reference: text(body.reference, 120), note: text(body.note, 500) } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      return NextResponse.json({ success: true, data: payment }, { status: 201 });
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "PURCHASE_NOT_FOUND") return NextResponse.json({ success: false, message: "Purchase record not found for this supplier." }, { status: 404 });
      if (code === "PAYMENT_EXCEEDS_DUE") return NextResponse.json({ success: false, message: "Payment is higher than the outstanding amount." }, { status: 400 });
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return NextResponse.json({ success: false, message: "This purchase balance changed. Refresh and enter the payment again." }, { status: 409 });
      console.error("SUPPLIER PAYMENT ERROR:", error);
      return NextResponse.json({ success: false, message: "Supplier payment could not be recorded." }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, message: "Unknown supplier ledger action." }, { status: 400 });
}
