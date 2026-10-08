import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { effectiveQuantityLimits, getGlobalQuantityLimits } from "@/lib/quantity-limits";

type CartLine = { id: unknown; variantId?: unknown; quantity: unknown };

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as { items?: CartLine[] };
    if (!Array.isArray(items) || items.length > 100) {
      return NextResponse.json({ message: "Invalid cart items." }, { status: 400 });
    }

    const validItems = items.filter((item) =>
      item && Number.isSafeInteger(Number(item.id)) && Number.isSafeInteger(Number(item.quantity)) && Number(item.quantity) > 0
    );
    const productIds = [...new Set(validItems.map((item) => Number(item.id)))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "active", category: { status: "active" } },
      include: { variants: { select: { id: true, stock: true } } },
    });
    const globalLimits = await getGlobalQuantityLimits();

    const requested = new Map<string, number>();
    for (const item of validItems) {
      const key = `${Number(item.id)}:${item.variantId ? Number(item.variantId) : "product"}`;
      requested.set(key, (requested.get(key) ?? 0) + Number(item.quantity));
    }

    const availability = validItems.map((item) => {
      const productId = Number(item.id);
      const variantId = item.variantId ? Number(item.variantId) : undefined;
      const product = products.find((entry) => entry.id === productId);
      const variant = variantId ? product?.variants.find((entry) => entry.id === variantId) : undefined;
      const stock = product
        ? variantId
          ? (variant?.stock ?? 0)
          : product.stock
        : 0;
      const key = `${productId}:${variantId ?? "product"}`;
      const quantity = requested.get(key) ?? Number(item.quantity);
      const limits = effectiveQuantityLimits(product ?? {}, globalLimits);
      const totalForProduct = validItems.filter(line => Number(line.id) === productId).reduce((sum, line) => sum + Number(line.quantity), 0);
      const available = Boolean(product) && (!variantId || Boolean(variant)) && stock >= quantity && totalForProduct >= limits.min && totalForProduct <= limits.max;

      return { id: productId, variantId, stock, available, requested: quantity, min: limits.min, max: limits.max };
    });

    return NextResponse.json({ availability });
  } catch {
    return NextResponse.json({ message: "Unable to check stock right now." }, { status: 400 });
  }
}
