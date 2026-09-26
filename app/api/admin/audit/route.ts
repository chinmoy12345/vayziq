import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Severity = "attention" | "clear";
function check(id: string, area: string, title: string, count: number, detail: string, href: string, level: Severity = "attention") {
  return { id, area, title, count, detail, href, severity: count > 0 ? level : "clear" as Severity };
}

export async function GET() {
  if (!(await requireAdminPermission("audit","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const [
    totalOrders,
    pendingOrders,
    staleOrders,
    emptyOrders,
    failedPayments,
    recentSales,
    pendingRequests,
    approvedRequests,
    missingDeliveryDates,
    inventoryProducts,
    missingProductImages,
    draftProducts,
    emptyCategories,
    expiredOffers,
    unapprovedReviews,
    unresolvedMessages,
    activeBanners,
    deliverySetting,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.count({ where: { status: "pending", createdAt: { lt: new Date(now.getTime() - day) } } }),
    prisma.order.count({ where: { items: { none: {} } } }),
    prisma.order.count({ where: { paymentStatus: "failed", createdAt: { gte: new Date(now.getTime() - 7 * day) } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: new Date(now.getTime() - 30 * day) }, status: { not: "cancelled" }, paymentStatus: { notIn: ["failed", "refunded"] } },
      _sum: { total: true },
    }),
    prisma.serviceRequest.count({ where: { status: "requested" } }),
    prisma.serviceRequest.count({ where: { status: "approved" } }),
    prisma.shipment.count({ where: { status: "delivered", deliveredAt: null } }),
    prisma.product.findMany({ where: { status: "active" }, select: { stock: true, reorderLevel: true, hasVariations: true, variants: { select: { stock: true, reorderLevel: true } } } }),
    prisma.product.count({ where: { status: "active", images: { none: {} } } }),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.category.count({ where: { status: "active", children: { none: { status: "active" } }, products: { none: { status: "active" } } } }),
    prisma.coupon.count({ where: { active: true, expiresAt: { lt: now } } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.contactMessage.count({ where: { resolved: false } }),
    prisma.banner.count({ where: { active: true } }),
    prisma.storeSetting.findUnique({ where: { key: "delivery_zip_settings" }, select: { value: true } }),
  ]);

  const stockRows = inventoryProducts.flatMap(product => product.hasVariations && product.variants.length ? product.variants : [product]);
  const outOfStock = stockRows.filter(item => item.stock <= 0).length;
  const lowStock = stockRows.filter(item => item.stock > 0 && item.stock <= item.reorderLevel).length;
  const deliveryValue = deliverySetting?.value;
  const deliveryEnabled = typeof deliveryValue === "object" && deliveryValue !== null && !Array.isArray(deliveryValue)
    && "enabled" in deliveryValue && deliveryValue.enabled === true;
  const configuredZips = typeof deliveryValue === "object" && deliveryValue !== null && !Array.isArray(deliveryValue)
    && "zipCodes" in deliveryValue && Array.isArray(deliveryValue.zipCodes) ? deliveryValue.zipCodes.length : 0;
  const missingDeliveryZips = deliveryEnabled && configuredZips === 0 ? 1 : 0;

  const checks = [
    check("pending-orders", "Orders", "Orders awaiting confirmation", pendingOrders, "Orders still in pending status.", "/admin/orders", "attention"),
    check("stale-orders", "Orders", "Pending orders older than 24 hours", staleOrders, "Review or update long-waiting orders.", "/admin/orders", "attention"),
    check("empty-orders", "Orders", "Orders without items", emptyOrders, "Orders with no associated line items need investigation.", "/admin/orders", "attention"),
    check("failed-payments", "Payments", "Failed payments in the last 7 days", failedPayments, "Check payment failures and contact affected customers if needed.", "/admin/orders", "attention"),
    check("returns-requested", "Returns & replacements", "Requests awaiting review", pendingRequests, "Customer return or replacement requests waiting for a decision.", "/admin/returns", "attention"),
    check("returns-approved", "Returns & replacements", "Approved requests awaiting completion", approvedRequests, "Complete the return or replacement and update the request.", "/admin/returns", "attention"),
    check("missing-delivery-date", "Fulfilment", "Delivered shipments missing delivery date", missingDeliveryDates, "Delivery dates are required to enforce the return window and enable invoices.", "/admin/orders", "attention"),
    check("out-of-stock", "Inventory", "Active products out of stock", outOfStock, "These products are still published while stock is zero.", "/admin/inventory", "attention"),
    check("low-stock", "Inventory", "Active products below their reorder level", lowStock, "Check replenishment for products and variants below their configured reorder levels.", "/admin/inventory", "attention"),
    check("missing-images", "Catalogue", "Active products without images", missingProductImages, "Published products should have a shopper-facing image.", "/admin/products", "attention"),
    check("draft-products", "Catalogue", "Draft products", draftProducts, "Products saved as drafts are not available to shoppers.", "/admin/products", "attention"),
    check("empty-categories", "Catalogue", "Active categories without active products", emptyCategories, "Leaf categories with no active products may be confusing to shoppers.", "/admin/categories", "attention"),
    check("expired-offers", "Offers", "Expired offers still marked active", expiredOffers, "Disable or update expired promotions.", "/admin/coupons", "attention"),
    check("unapproved-reviews", "Customer feedback", "Reviews waiting for moderation", unapprovedReviews, "Review and approve or reject submitted customer reviews.", "/admin/reviews", "attention"),
    check("unresolved-messages", "Customer support", "Unresolved contact messages", unresolvedMessages, "Follow up on customer enquiries.", "/admin/settings", "attention"),
    check("delivery-zip-config", "Delivery coverage", "ZIP restriction enabled without ZIP codes", missingDeliveryZips, "Add serviceable PIN codes or turn off ZIP restrictions.", "/admin/delivery-zips", "attention"),
  ];

  return NextResponse.json({
    success: true,
    generatedAt: now,
    summary: {
      totalOrders,
      pendingOrders,
      salesLast30Days: Number(recentSales._sum.total ?? 0),
      pendingRequests,
      attentionCount: checks.filter((item) => item.severity === "attention").length,
      clearCount: checks.filter((item) => item.severity === "clear").length,
      activeBanners,
      deliveryZipCount: configuredZips,
      deliveryZipRestrictionsEnabled: deliveryEnabled,
    },
    checks,
  });
}
