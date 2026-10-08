const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextResponse } = require('next/server');

function load(file, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { exports, Buffer, File, FormData, Response, Uint8Array, String, Number, require: name => imports[name] ?? require(name) });
  return exports;
}

const media = load('lib/reel-media.ts');

test('reel upload checks actual video bytes and format', () => {
  const mp4 = Buffer.from([0, 0, 0, 16, 102, 116, 121, 112, 105, 115, 111, 109]);
  const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);
  assert.equal(media.validReelMediaBytes('video', 'video/mp4', mp4), true);
  assert.equal(media.validReelMediaBytes('video', 'video/webm', webm), true);
  assert.equal(media.validReelMediaBytes('video', 'video/mp4', webm), false);
  assert.equal(media.reelMediaExtension('video', 'video/quicktime'), null);
});

test('uploaded reel URLs are recognized by the storefront video player', () => {
  const parser = load('lib/product-video.ts');
  assert.equal(parser.parseProductVideoUrl('/api/reel-media/12345678-1234-1234-1234-123456789abc.mp4').kind, 'file');
  assert.equal(parser.parseProductVideoUrl('/api/reel-media/12345678-1234-1234-1234-123456789abc.jpg'), null);
});

test('admin upload persists video and public route supports seeking', async () => {
  const id = '12345678-1234-1234-1234-123456789abc';
  const bytes = Buffer.from([0, 0, 0, 16, 102, 116, 121, 112, 105, 115, 111, 109, 1, 2, 3, 4]);
  let stored;
  const db = { default: { reelMedia: { create: async ({ data }) => { stored = data; return { id }; }, findUnique: async () => ({ mimeType: stored.mimeType, data: stored.data, size: stored.size }) } } };
  const upload = load('app/api/admin/reels/media/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdminPermission: async () => true }, '@/lib/db': db, '@/lib/reel-media': media });
  const form = new FormData(); form.set('kind', 'video'); form.set('file', new File([bytes], 'reel.mp4', { type: 'video/mp4' }));
  const uploaded = await upload.POST(new Request('http://localhost/api/admin/reels/media', { method: 'POST', body: form }));
  assert.equal(uploaded.status, 200);
  assert.equal((await uploaded.json()).url, `/api/reel-media/${id}.mp4`);
  const served = load('app/api/reel-media/[file]/route.ts', { '@/lib/db': db, '@/lib/reel-media': media });
  const response = await served.GET(new Request(`http://localhost/api/reel-media/${id}.mp4`, { headers: { range: 'bytes=4-7' } }), { params: Promise.resolve({ file: `${id}.mp4` }) });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get('content-range'), 'bytes 4-7/16');
  assert.equal(Buffer.from(await response.arrayBuffer()).toString(), 'ftyp');
});

test('admin upload denies guests and rejects a spoofed MP4', async () => {
  const db = { default: { reelMedia: { create: async () => { throw new Error('must not store'); } } } };
  const denied = load('app/api/admin/reels/media/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdminPermission: async () => false }, '@/lib/db': db, '@/lib/reel-media': media });
  assert.equal((await denied.POST(new Request('http://localhost/api/admin/reels/media', { method: 'POST' }))).status, 401);
  const allowed = load('app/api/admin/reels/media/route.ts', { 'next/server': { NextResponse }, '@/lib/auth': { requireAdminPermission: async () => true }, '@/lib/db': db, '@/lib/reel-media': media });
  const form = new FormData(); form.set('kind', 'video'); form.set('file', new File([Buffer.from('not a video')], 'fake.mp4', { type: 'video/mp4' }));
  assert.equal((await allowed.POST(new Request('http://localhost/api/admin/reels/media', { method: 'POST', body: form }))).status, 400);
});
