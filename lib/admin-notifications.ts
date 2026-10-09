import prisma from "@/lib/db";

export type NotificationSource = "orders" | "reviews" | "returns" | "inventory";
export type AdminNotification = {
  key: string;
  source: NotificationSource;
  title: string;
  detail: string;
  href: string;
  createdAt: string;
  read: boolean;
};

type Grants = Record<NotificationSource, boolean>;
type Draft = Omit<AdminNotification, "read">;

export async function getAdminNotifications(userId: number, grants: Grants): Promise<{ notifications: AdminNotification[]; unreadCount: number }> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [orders, reviews, requests, products, variants] = await Promise.all([
    grants.orders ? prisma.order.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 15, select: { id: true, orderNumber: true, total: true, createdAt: true } }) : [],
    grants.reviews ? prisma.review.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" }, take: 15, select: { id: true, rating: true, product: { select: { name: true } }, createdAt: true } }) : [],
    grants.returns ? prisma.serviceRequest.findMany({ where: { status: "requested" }, orderBy: { createdAt: "desc" }, take: 15, select: { id: true, kind: true, item: { select: { productName: true } }, createdAt: true } }) : [],
    grants.inventory ? prisma.product.findMany({ where: { status: "active", hasVariations: false, stock: { lte: prisma.product.fields.reorderLevel } }, orderBy: { updatedAt: "desc" }, take: 15, select: { id: true, name: true, stock: true, updatedAt: true } }) : [],
    grants.inventory ? prisma.productVariant.findMany({ where: { product: { status: "active" }, stock: { lte: prisma.productVariant.fields.reorderLevel } }, orderBy: { updatedAt: "desc" }, take: 15, select: { id: true, sku: true, stock: true, updatedAt: true, product: { select: { name: true } } } }) : [],
  ]);
  const drafts: Draft[] = [
    ...orders.map(order => ({ key: `order:${order.id}`, source: "orders" as const, title: `New order ${order.orderNumber}`, detail: `Total ₹${Number(order.total).toLocaleString("en-IN")}`, href: `/admin/orders/${order.id}`, createdAt: order.createdAt.toISOString() })),
    ...reviews.map(review => ({ key: `review:${review.id}`, source: "reviews" as const, title: "Review awaiting approval", detail: `${review.product.name} · ${review.rating}/5 stars`, href: "/admin/reviews", createdAt: review.createdAt.toISOString() })),
    ...requests.map(request => ({ key: `request:${request.id}`, source: "returns" as const, title: `${request.kind === "return" ? "Return" : "Replacement"} requested`, detail: request.item.productName, href: "/admin/returns", createdAt: request.createdAt.toISOString() })),
    ...products.map(product => ({ key: `stock:${product.id}:${product.updatedAt.getTime()}`, source: "inventory" as const, title: product.stock === 0 ? "Product out of stock" : "Low product stock", detail: `${product.name} · ${product.stock} left`, href: "/admin/inventory", createdAt: product.updatedAt.toISOString() })),
    ...variants.map(variant => ({ key: `variant-stock:${variant.id}:${variant.updatedAt.getTime()}`, source: "inventory" as const, title: variant.stock === 0 ? "Variant out of stock" : "Low variant stock", detail: `${variant.product.name} (${variant.sku}) · ${variant.stock} left`, href: "/admin/inventory", createdAt: variant.updatedAt.toISOString() })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const readRows = drafts.length ? await prisma.adminNotificationRead.findMany({ where: { userId, key: { in: drafts.map(item => item.key) } }, select: { key: true } }) : [];
  const readKeys = new Set(readRows.map(row => row.key));
  const notifications = drafts.map(item => ({ ...item, read: readKeys.has(item.key) }));
  return { notifications, unreadCount: notifications.filter(item => !item.read).length };
}
