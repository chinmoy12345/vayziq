const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextResponse } = require('next/server');

function load(file, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, Date, Set, Number, require: name => imports[name] ?? require(name) });
  return exports;
}

const date = new Date();
const reads = new Map();
const db = { default: {
  order: { findMany: async () => [{ id: 3, orderNumber: 'VZ-3', total: 799, createdAt: date }] },
  review: { findMany: async () => [{ id: 5, rating: 4, product: { name: 'Hoodie' }, createdAt: date }] },
  serviceRequest: { findMany: async () => [] },
  product: { fields: { reorderLevel: 'reorderLevel' }, findMany: async () => [{ id: 8, name: 'Joggers', stock: 1, updatedAt: date }] },
  productVariant: { fields: { reorderLevel: 'reorderLevel' }, findMany: async () => [] },
  adminNotificationRead: {
    findMany: async ({ where }) => [...(reads.get(where.userId) ?? [])].map(key => ({ key })),
    createMany: async ({ data }) => { for (const row of data) { const keys = reads.get(row.userId) ?? new Set(); keys.add(row.key); reads.set(row.userId, keys); } },
  },
  userRole: { findMany: async () => [{ role: { slug: 'super-admin', permissions: [] } }] },
} };
const helper = load('lib/admin-notifications.ts', { '@/lib/db': db });

test('notification feed is live, sorted and read state is per admin', async () => {
  const grants = { orders: true, reviews: true, returns: true, inventory: true };
  const first = await helper.getAdminNotifications(1, grants);
  assert.equal(first.unreadCount, 3);
  assert(first.notifications.some(item => item.key === 'order:3' && item.href === '/admin/orders/3'));
  const order = first.notifications.find(item => item.key === 'order:3');
  await db.default.adminNotificationRead.createMany({ data: [{ userId: 1, key: order.key }] });
  assert.equal((await helper.getAdminNotifications(1, grants)).unreadCount, 2);
  assert.equal((await helper.getAdminNotifications(2, grants)).unreadCount, 3);
  assert.equal((await helper.getAdminNotifications(2, { orders: true, reviews: false, returns: false, inventory: false })).notifications.length, 1);
});

test('notification API rejects guests and validates mark-read keys', async () => {
  const preferences = { getAdminNotificationPreferences: async () => ({ orders: true, reviews: true }) };
  const guest = load('app/api/admin/notifications/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdmin: async () => null }, '@/lib/db': db, '@/lib/admin-notifications': helper, '@/lib/admin-notification-preferences': preferences });
  assert.equal((await guest.GET()).status, 401);
  const admin = load('app/api/admin/notifications/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdmin: async () => ({ sub: '9' }) }, '@/lib/db': db, '@/lib/admin-notifications': helper, '@/lib/admin-notification-preferences': preferences });
  const invalid = await admin.PATCH(new Request('http://localhost/api/admin/notifications', { method: 'PATCH', body: JSON.stringify({ key: 'forged:123' }) }));
  assert.equal(invalid.status, 404);
  const valid = await admin.PATCH(new Request('http://localhost/api/admin/notifications', { method: 'PATCH', body: JSON.stringify({ key: 'order:3' }) }));
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).unreadCount, 2);
});
