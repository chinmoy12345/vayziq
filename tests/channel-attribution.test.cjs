const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const attribution = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/channel-attribution.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: attribution, URL, Date });

test('UTM source wins over referrer and aliases normalize to channels', () => {
  assert.equal(attribution.normalizeChannel('fb', 'https://google.com/', 'vayziq.com'), 'facebook');
  assert.equal(attribution.normalizeChannel('GoogleAds', null, 'vayziq.com'), 'google');
  assert.equal(attribution.normalizeChannel(null, 'https://www.instagram.com/post', 'vayziq.com'), 'instagram');
  assert.equal(attribution.normalizeChannel(null, 'https://vayziq.com/shop', 'vayziq.com'), 'direct');
});

test('India day rolls over at 18:30 UTC and attribution rejects invalid cookie data', () => {
  assert.equal(attribution.indiaDay(new Date('2026-10-08T18:29:59.000Z')), '2026-10-08');
  assert.equal(attribution.indiaDay(new Date('2026-10-08T18:30:00.000Z')), '2026-10-09');
  assert.equal(attribution.readAttribution('{"channel":"facebook","campaign":"launch"}').channel, 'facebook');
  assert.equal(attribution.readAttribution('{"channel":"bad channel"}').channel, 'direct');
});

test('visit endpoint records a channel and issues first-party visitor and attribution cookies', async () => {
  const { NextRequest, NextResponse } = require('next/server');
  const calls = [];
  const route = {};
  const code = ts.transpileModule(fs.readFileSync('app/api/analytics/visit/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports: route, console, require: name => ({
    'next/server': { NextResponse },
    '@/lib/db': { default: { channelVisit: { upsert: async args => { calls.push(args); } } } },
    '@/lib/channel-attribution': attribution,
    '@/lib/homepage-settings': { getHomepageVisibility: async () => ({ maintenanceMode: false }) },
  })[name] ?? require(name) });
  const request = new NextRequest('https://vayziq.com/api/analytics/visit', { method: 'POST', headers: { origin: 'https://vayziq.com' }, body: JSON.stringify({ source: 'fb', campaign: 'launch' }) });
  const response = await route.POST(request);
  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].create.channel, 'facebook');
  assert.match(response.headers.get('set-cookie'), /vayziq_visitor/);
  assert.match(response.headers.get('set-cookie'), /vayziq_channel/);
});
