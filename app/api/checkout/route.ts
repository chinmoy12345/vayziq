import { resolveCart, type CartInput } from "@/lib/cart-pricing";
import { reserveCoupon } from "@/lib/coupons";
import { policySnapshot } from "@/lib/fulfillment";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";
import { isDeliveryZipAllowed } from "@/lib/delivery-zip-settings";
import { CHANNEL_COOKIE, readAttribution } from "@/lib/channel-attribution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const attribution = readAttribution(request.cookies.get(CHANNEL_COOKIE)?.value);
  const session = await getCurrentUser();
  const userId = Number(session?.sub);
  const { addressId, items, paymentMethod, couponCode } = await request.json();
  if (!Number.isInteger(userId)) return NextResponse.json({ success: false, message: "Please sign in to place an order." }, { status: 401 });
  if (paymentMethod !== "cod") return NextResponse.json({ success: false, message: "Please use Razorpay for online payments." }, { status: 400 });
  if (!Number.isInteger(Number(addressId)) || !Array.isArray(items) || !items.length) return NextResponse.json({ success: false, message: "Select an address and add products to your cart." }, { status: 400 });
  const address = await prisma.address.findFirst({ where: { id: Number(addressId), userId } });
  if (!address) return NextResponse.json({ success: false, message: "Select a valid delivery address." }, { status: 400 });
  if (!(await isDeliveryZipAllowed(address.postalCode))) return NextResponse.json({ success: false, message: "Delivery is not available to this PIN code. Please choose another address." }, { status: 422 });
  let orderedItems;
  try { orderedItems = await resolveCart(items as CartInput[]); } catch(error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Invalid cart." }, { status: 400 }); }
  const subtotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const code = typeof couponCode === "string" ? couponCode.trim().toUpperCase() : "";
  const orderNumber = `SC${Date.now().toString().slice(-8)}`;
  try {
  const order = await prisma.$transaction(async (tx) => {
    const discount = await reserveCoupon(tx, code, subtotal, orderedItems.map(item => ({ id: item.product!.id, price: item.price, quantity: item.quantity })));
    const created = await tx.order.create({ data: { orderNumber, userId, addressId: address.id, subtotal, shipping, discount, couponCode: code || null, acquisitionChannel: attribution.channel, acquisitionCampaign: attribution.campaign, total: subtotal + shipping - discount, paymentStatus: paymentMethod === "cod" ? "pending" : "pending", items: { create: orderedItems.map((item) => ({ ...policySnapshot(item.product!), productId: item.product!.id, productName: item.product!.name, sku: item.sku, options: item.options, price: item.price, quantity: item.quantity })) } } });
    for (const item of orderedItems) {
      const product = await tx.product.findUnique({ where: { id: item.product!.id }, select: { id: true, name: true, sku: true, stock: true } });
      if (!product) throw new Error("STOCK_CHANGED");
      let previousStock = product.stock;
      let movementSku = product.sku;
      let movementVariantId: number | null = null;
      let variantLabel: string | null = null;
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId }, select: { id: true, sku: true, stock: true, variantValues: { select: { optionValue: { select: { value: true, option: { select: { name: true } } } } } } } });
        if (!variant || variant.id === undefined) throw new Error("VARIANT_STOCK_CHANGED");
        previousStock = variant.stock;
        movementSku = variant.sku;
        movementVariantId = variant.id;
        variantLabel = variant.variantValues.map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`).join(" · ");
      }
      const stock = await tx.product.updateMany({ where: { id: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (item.variantId) { const variantStock = await tx.productVariant.updateMany({ where: { id: item.variantId, productId: product.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } }); if (variantStock.count !== 1) throw new Error("VARIANT_STOCK_CHANGED"); }
      if (stock.count !== 1) throw new Error("STOCK_CHANGED");
      await tx.inventoryMovement.create({ data: { productId: product.id, variantId: movementVariantId, orderId: created.id, productName: product.name, sku: movementSku, variantLabel, delta: -item.quantity, previousStock, newStock: previousStock - item.quantity, reason: "sale" } });
    }
    return created;
  }, { isolationLevel: "Serializable" });
  return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch { return NextResponse.json({ success: false, message: "Unable to place order. Your offer or stock may have changed. Refresh and try again." }, { status: 409 }); }
}
