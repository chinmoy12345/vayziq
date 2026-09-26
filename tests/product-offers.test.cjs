const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
function load(file, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, Date, ...globals, require: name => imports[name] ?? require(name) });
  return exports;
}
const pricing = load('lib/product-offers.ts');
const { offerDiscount } = pricing;
const { couponInput } = load('lib/coupon-input.ts');
const coupons = load('lib/coupons.ts', { '@/lib/product-offers': pricing });
const offer = (type, rules = {}, rest = {}) => ({ code: 'TEST', type, value: 10, minimum: 0, maximum: null, rules: { productIds: [], ...rules }, ...rest });
const line = (quantity, id = 1, price = 599) => ({ id, quantity, price });
function discount(offer, items) { return offerDiscount('TEST', items.reduce((sum,i) => sum + i.quantity * i.price, 0), [offer], items); }

test('standard discounts retain minimum spend, cap and selected-product scope', () => {
  const p = offer('percentage', {}, { minimum: 999, maximum: 100 });
  assert.equal(discount(p, [line(1)]), 0);
  assert.equal(discount(p, [line(2)]), 100);
  assert.equal(discount(offer('fixed', { productIds: [1] }, { value: 900 }), [line(1), line(1, 2)]), 599);
  assert.equal(offerDiscount('UNKNOWN', 599, [p], [line(1)]), 0);
});
test('buy 1 get 1 and buy 2 get 1 repeat for complete sets only', () => {
  const bogo = offer('buy_get', { buyQuantity: 1, getQuantity: 1 });
  assert.equal(discount(bogo, [line(1)]), 0);
  assert.equal(discount(bogo, [line(2)]), 599);
  assert.equal(discount(bogo, [line(3)]), 599);
  assert.equal(discount(bogo, [line(4)]), 1198);
  const b2g1 = offer('buy_get', { buyQuantity: 2, getQuantity: 1 });
  assert.equal(discount(b2g1, [line(2)]), 0);
  assert.equal(discount(b2g1, [line(3)]), 599);
  assert.equal(discount(b2g1, [line(6)]), 1198);
});
test('free units are the cheapest eligible products, not unrelated cart items', () => {
  const p = offer('buy_get', { productIds: [1, 2], buyQuantity: 1, getQuantity: 1 });
  assert.equal(discount(p, [line(1, 1, 800), line(1, 2, 400), line(4, 3, 100)]), 400);
  assert.equal(discount(p, [line(1, 1), line(2, 3)]), 0);
});
test('3 at 399 each and 4 at 299 each mix across selected products', () => {
  const p = offer('quantity_price', { productIds: [1, 2, 3, 4, 5], priceMode: 'unit', tiers: [{ quantity: 3, price: 399 }, { quantity: 4, price: 299 }] });
  assert.equal(discount(p, [line(2)]), 0);
  assert.equal(discount(p, [line(1,1), line(1,2), line(1,3)]), 600);
  assert.equal(discount(p, [line(4)]), 1200);
  assert.equal(discount(p, [line(5)]), 1500);
  assert.equal(discount(p, [line(3), line(2,99)]), 600);
  assert.equal(discount(p, [line(3,1,199)]), 0);
});
test('bundle prices apply only to complete bundles and never increase prices', () => {
  const p = offer('quantity_price', { priceMode: 'bundle', tiers: [{ quantity: 3, price: 399 }] });
  assert.equal(discount(p, [line(4)]), 1398);
  assert.equal(discount(p, [line(6)]), 2796);
  assert.equal(discount(p, [line(3,1,99)]), 0);
});
test('scheduled, expired and invalid subtotals do not receive discounts', () => {
  assert.equal(discount(offer('fixed', {}, { expiresAt: '2020-01-01', value: 100 }), [line(3)]), 0);
  assert.equal(discount(offer('fixed', {}, { startsAt: '2099-01-01', value: 100 }), [line(3)]), 0);
  assert.equal(offerDiscount('TEST', NaN, [offer('percentage')]), 0);
});
test('admin validation rejects invalid tiers, quantities, percentages and dates', () => {
  const base = { code: 'TEST', type: 'percentage', value: 10, active: true };
  assert.throws(() => couponInput({ ...base, value: 101 }));
  assert.throws(() => couponInput({ ...base, usageLimit: -1 }));
  assert.throws(() => couponInput({ ...base, startsAt: '2026-10-02', expiresAt: '2026-10-01' }));
  assert.throws(() => couponInput({ ...base, type: 'buy_get', rules: { buyQuantity: 0, getQuantity: 1 } }));
  assert.throws(() => couponInput({ ...base, type: 'quantity_price', rules: { priceMode: 'unit', tiers: [{ quantity: 3, price: 399 }, { quantity: 3, price: 299 }] } }));
  const data = couponInput({ ...base, type: 'quantity_price', rules: { productIds: [1, 2], priceMode: 'unit', tiers: [{ quantity: 3, price: 399 }] }, expiresAt: '2026-09-23' });
  assert.equal(data.rules.tiers[0].price, 399);
  assert.equal(data.expiresAt.toISOString(), '2026-09-23T18:29:59.999Z');
});
test('server reserves the last coupon use once and rejects disabled/exhausted offers', async () => {
  let coupon = { id: 1, code: 'TEST', type: 'percentage', value: 10, minimumOrder: 0, maximumDiscount: null, rules: null, active: true, usageCount: 0, usageLimit: 1, updatedAt: new Date(), startsAt: null, expiresAt: null };
  const tx = { coupon: { findUnique: async () => ({ ...coupon }), updateMany: async ({ where }) => { if (where.usageCount !== coupon.usageCount) return { count: 0 }; coupon.usageCount++; return { count: 1 }; } } };
  const results = await Promise.allSettled([coupons.reserveCoupon(tx, 'TEST', 599, [line(1)]), coupons.reserveCoupon(tx, 'TEST', 599, [line(1)])]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(coupon.usageCount, 1);
  await assert.rejects(coupons.reserveCoupon(tx, 'TEST', 599, [line(1)]));
  coupon = { ...coupon, usageCount: 0, active: false };
  await assert.rejects(coupons.reserveCoupon(tx, 'TEST', 599, [line(1)]));
});
test('coupon admin endpoints reject guests before database access', async () => {
  const api = load('app/api/coupons/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdminPermission: async () => null }, '@/lib/db': { default: {} }, '@/lib/coupon-input': { couponInput } });
  for (const method of ['GET','POST','PATCH','DELETE']) assert.equal((await api[method](new NextRequest('http://localhost/api/coupons', { method }))).status, 401);
});

test('COD recalculates quantity discounts using database prices, ignoring client prices', async () => {
  let saved;
  const product = { id: 1, name: 'Saree', sku: 'QA', price: 599, stock: 10, variants: [], returnEnabled: true, replacementEnabled: true, returnDays: 7, replacementDays: 7 };
  const coupon = { id: 1, code: 'TEST', type: 'quantity_price', value: 0, minimumOrder: 0, maximumDiscount: null, rules: { productIds: [1], priceMode: 'unit', tiers: [{ quantity: 3, price: 399 }, { quantity: 4, price: 299 }] }, active: true, usageCount: 0, usageLimit: null, startsAt: null, expiresAt: null, updatedAt: new Date() };
  const tx = { coupon: { findUnique: async () => coupon, updateMany: async () => ({ count: 1 }) }, order: { create: async ({ data }) => { saved = data; return { id: 100, orderNumber: data.orderNumber }; } }, product: { findUnique: async () => product, updateMany: async () => ({ count: 1 }) }, inventoryMovement: { create: async () => ({}) } };
  const db = { address: { findFirst: async () => ({ id: 1 }) }, product: { findMany: async () => [product] }, $transaction: async callback => callback(tx) };
  const api = load('app/api/checkout/route.ts', { 'next/server': { NextResponse }, '@/lib/db': { default: db }, '@/lib/auth': { getCurrentUser: async () => ({ sub: '1' }) }, '@/lib/coupons': coupons, '@/lib/cart-pricing': load('lib/cart-pricing.ts', { '@/lib/db': { default: db } }), '@/lib/delivery-zip-settings': { isDeliveryZipAllowed: async () => true }, '@/lib/fulfillment': { policySnapshot: () => ({}) } });
  const request = quantity => new NextRequest('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify({ addressId: 1, paymentMethod: 'cod', couponCode: 'TEST', items: [{ id: 1, quantity, price: 1 }] }) });
  assert.equal((await api.POST(request(4))).status, 200);
  assert.equal(saved.subtotal, 2396);
  assert.equal(saved.discount, 1200);
  assert.equal(saved.total, 1196);
  assert.equal((await api.POST(request(1.5))).status, 400);
  coupon.active = false;
  assert.equal((await api.POST(request(4))).status, 409);
});

test('offers heading remains visible while loading, empty, or temporarily unavailable', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  for (const state of [{ offers: [], loading: true, error: '' }, { offers: [], loading: false, error: '' }, { offers: [], loading: false, error: 'Unable to load' }]) {
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync('components/product/ProductOffers.tsx','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    const imports = { '@/lib/use-offers': { useOffers: () => state }, '@/lib/product-offers': pricing };
    vm.runInNewContext(code, { exports, require: name => imports[name] ?? require(name) });
    const markup = renderToStaticMarkup(React.createElement(exports.default, { price: 599, productId: 1, quantity: 1 }));
    assert.match(markup, /Offers &amp; Discounts/);
    assert.match(markup, /role="status"/);
  }
});

test('automatic Buy/Get never combines products at different current selling prices', () => {
  const p=offer('buy_get',{buyQuantity:1,getQuantity:1,mode:'same_price'});
  assert.equal(discount(p,[line(1,1,500),line(1,2,600)]),0);
  assert.equal(discount(p,[line(2,1,500),line(2,2,600)]),1100);
  assert.equal(discount(p,[line(1,1,500),line(1,2,500)]),500);
});
test('selected products can have mixed prices with explicit cheapest or designated gift rules', () => {
  const p=offer('buy_get',{productIds:[1,2],buyQuantity:2,getQuantity:1,mode:'selected',freeRule:'specific',freeProductIds:[2]});
  assert.equal(discount(p,[line(2,1,500),line(1,2,600)]),600);
  assert.equal(discount(p,[line(1,1,500),line(2,2,600)]),0);
  assert.equal(discount({...p,rules:{...p.rules,freeRule:'cheapest'}},[line(2,1,500),line(1,2,600)]),500);
});
test('quantity fixed discounts follow highest threshold and never empty the subtotal', () => {
  const p=offer('quantity_discount',{tiers:[{quantity:2,price:200},{quantity:3,price:300},{quantity:10,price:400}]});
  assert.equal(discount(p,[line(1)]),0);
  assert.equal(discount(p,[line(2)]),200);
  assert.equal(discount(p,[line(3)]),300);
  assert.equal(discount(p,[line(10)]),400);
  assert.equal(discount(p,[line(2,1,100)]),0);
  assert.equal(discount(offer('percentage',{}, {value:100}),[line(1)]),0);
});
test('color count uses only actual options and deduplicates color/colour spelling', () => {
  const {productColors}=load('lib/product-colors.ts');
  assert.equal(productColors({options:[]}).length,0);
  assert.equal(productColors({options:[{name:'Color',values:[{value:' Red '},{value:'BLUE'}]},{name:'Colour',values:[{value:'red'}]},{name:'Size',values:[{value:'L'}]}]}).length,2);
});
test('cart resolution uses variant selling price and guards invalid variants and stock', async () => {
  const product={id:1,price:800,stock:5,sku:'BASE',variants:[{id:11,price:500,stock:3,sku:'RED',variantValues:[{optionValue:{value:'Red',option:{name:'Color'}}}]}]};
  const {resolveCart}=load('lib/cart-pricing.ts',{'@/lib/db':{default:{product:{findMany:async()=>[product]}}}});
  const lines=await resolveCart([{id:1,variantId:11,price:1,quantity:2}]);
  assert.equal(lines[0].price,500);assert.equal(lines[0].options.variantId,11);
  await assert.rejects(resolveCart([{id:1,variantId:99,quantity:1}]));
  await assert.rejects(resolveCart([{id:1,variantId:11,quantity:4}]));
});
test('banner links reject external and executable destinations', async () => {
  const {safeBannerLink,bannerInput}=load('lib/banner-input.ts',{'@/lib/db':{default:{product:{findFirst:async()=>({slug:'red-saree'})}}}});
  assert.throws(()=>safeBannerLink('javascript:alert(1)'));assert.throws(()=>safeBannerLink('//example.com'));
  assert.equal(safeBannerLink('/shop?category=sarees'),'/shop?category=sarees');
  const banner=await bannerInput({image:'/uploads/banner.png',placement:'offer-zone',productId:1,title:''});
  assert.equal(banner.link,'/product/red-saree');
});

test('online payment amount uses the same server-side quantity discount as COD', async () => {
  let saved, gatewayAmount;
  const product={id:1,name:'Saree',sku:'QA',price:599,stock:10,variants:[]};
  const coupon={id:1,code:'TEST',type:'quantity_discount',value:0,minimumOrder:0,maximumDiscount:null,rules:{productIds:[],tiers:[{quantity:2,price:200},{quantity:3,price:300}]},active:true,usageCount:0,usageLimit:null,startsAt:null,expiresAt:null,updatedAt:new Date()};
  const tx={coupon:{findUnique:async()=>coupon,updateMany:async()=>({count:1})},order:{create:async({data})=>{saved={...data,id:100};return saved;}}};
  const db={address:{findFirst:async()=>({id:1,fullName:'Test',mobile:'9999999999'})},product:{findMany:async()=>[product]},user:{findUnique:async()=>({name:'Test',email:'test@example.invalid'})},order:{update:async()=>({})},$transaction:async cb=>cb(tx)};
  const api=load('app/api/payments/razorpay/create-order/route.ts',{'next/server':{NextResponse},'@/lib/auth':{getCurrentUser:async()=>({sub:'1'})},'@/lib/db':{default:db},'@/lib/coupons':coupons,'@/lib/cart-pricing':load('lib/cart-pricing.ts',{'@/lib/db':{default:db}}),'@/lib/delivery-zip-settings':{isDeliveryZipAllowed:async()=>true},'@/lib/fulfillment':{policySnapshot:()=>({})}},{process:{env:{RAZORPAY_KEY_ID:'test',RAZORPAY_KEY_SECRET:'test'}},Buffer,fetch:async(_,{body})=>{gatewayAmount=JSON.parse(body).amount;return {ok:true,json:async()=>({id:'order_test',amount:gatewayAmount,currency:'INR'})};}});
  const response=await api.POST(new NextRequest('http://localhost/api/payments/razorpay/create-order',{method:'POST',body:JSON.stringify({addressId:1,couponCode:'TEST',items:[{id:1,quantity:3,price:1}]})}));
  assert.equal(response.status,200);assert.equal(saved.subtotal,1797);assert.equal(saved.discount,300);assert.equal(saved.total,1497);assert.equal(gatewayAmount,149700);
});
