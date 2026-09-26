const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(file, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, Date, require: name => imports[name] ?? require(name) });
  return exports;
}
const policy = load('lib/fulfillment.ts');
const deliveredAt = new Date('2026-09-01T10:00:00Z');
const item = { returnEnabled: true, replacementEnabled: true, returnDays: 7, replacementDays: 10, shipment: { status: 'delivered', deliveredAt } };

test('each parcel drives partial and complete delivery independently', () => {
  assert.equal(policy.fulfillmentStatus([{ shipment: null }, { shipment: { status: 'shipped' } }]), 'processing');
  assert.equal(policy.fulfillmentStatus([{ shipment: { status: 'delivered' } }, { shipment: { status: 'shipped' } }]), 'partially_delivered');
  assert.equal(policy.fulfillmentStatus([{ shipment: { status: 'delivered' } }, { shipment: { status: 'delivered' } }]), 'delivered');
});
test('server uses the exact delivery deadline and independent replacement window', () => {
  assert.equal(policy.canRequestService(item, 'return', new Date('2026-09-08T10:00:00Z')), true);
  assert.equal(policy.canRequestService(item, 'return', new Date('2026-09-08T10:00:00.001Z')), false);
  assert.equal(policy.canRequestService(item, 'replacement', new Date('2026-09-09T10:00:00Z')), true);
  assert.equal(policy.canRequestService({ ...item, returnEnabled: false }, 'return', deliveredAt), false);
  assert.equal(policy.canRequestService({ ...item, shipment: null }, 'return', deliveredAt), false);
  assert.equal(policy.canRequestService(item, 'return', new Date('2026-09-01T09:00:00Z')), false);
});
test('purchase policy snapshot survives subsequent product changes', () => {
  const product = { returnEnabled: false, replacementEnabled: true, returnDays: 7, replacementDays: 14 };
  const snapshot = policy.policySnapshot(product);
  product.replacementDays = 1;
  assert.equal(snapshot.replacementDays, 14);
  assert.equal(snapshot.returnEnabled, false);
});
test('reviews require delivery of the exact purchased product', async () => {
  let query;
  const reviews = load('lib/review-eligibility.ts', { '@/lib/db': { default: { orderItem: { findFirst: async input => { query = input; return { id: 1 }; } } } } });
  assert.equal(reviews.canReviewOrder({ status: 'partially_delivered', paymentStatus: 'pending' }, item.shipment), true);
  assert.equal(reviews.canReviewOrder({ status: 'delivered', paymentStatus: 'paid' }, null), false);
  assert.equal(reviews.canReviewOrder({ status: 'delivered', paymentStatus: 'refunded' }, item.shipment), false);
  await reviews.hasPurchasedProduct(15, 30);
  assert.equal(query.where.productId, 30);
  assert.equal(query.where.order.userId, 15);
  assert.equal(query.where.shipment.status, 'delivered');
});
test('return API rejects guests, expired windows, and repeated requests', async () => {
  let session = null, writes = 0;
  const currentItem = { ...item, id: 1, shipment: { status: 'delivered', deliveredAt: new Date() }, serviceRequest: null };
  const tx = { orderItem: { findFirst: async ({ where }) => { assert.equal(where.order.userId, 9); return currentItem; } }, serviceRequest: { create: async () => { writes++; } } };
  const api = load('app/api/account/service-requests/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { getCurrentUser: async () => session }, '@/lib/db': { default: { $transaction: async callback => callback(tx) } }, '@/lib/fulfillment': policy });
  const request = () => new NextRequest('http://localhost/api/account/service-requests', { method: 'POST', body: JSON.stringify({ orderItemId: 1, kind: 'return', reason: 'The item arrived damaged.' }) });
  assert.equal((await api.POST(request())).status, 401);
  session = { sub: '9' };
  assert.equal((await api.POST(request())).status, 200);
  currentItem.serviceRequest = { id: 1 };
  assert.equal((await api.POST(request())).status, 409);
  currentItem.serviceRequest = null;
  currentItem.shipment.deliveredAt = new Date(Date.now() - 8 * 86400000);
  assert.equal((await api.POST(request())).status, 409);
  assert.equal(writes, 1);
});
