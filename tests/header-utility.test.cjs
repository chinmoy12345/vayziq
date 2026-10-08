const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadSettings(storeSetting) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('lib/header-utility-settings.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const types = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/header-utility-types.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: types });
  vm.runInNewContext(source, { exports, require: name => name === '@/lib/db' ? { default: { storeSetting: { findUnique: async () => storeSetting } } } : types });
  return exports;
}

test('header links have useful defaults and accept configured internal destinations', async () => {
  const settings = loadSettings(null);
  const defaults = await settings.getHeaderUtility();
  assert.equal(defaults.trackOrder.href, '/account/orders');
  assert.equal(defaults.help.href, '/contact');
  assert.equal(defaults.currency.visible, true);
  const saved = settings.parseHeaderUtility({ trackOrder: { visible: true, label: 'My Orders', href: '/account/orders?tab=recent' }, help: { visible: false, label: 'Support', href: '/contact' }, currency: { visible: false } });
  assert.equal(saved.trackOrder.label, 'My Orders');
  assert.equal(saved.help.visible, false);
});

test('header utility rejects external and script destinations', () => {
  const { parseHeaderUtility, DEFAULT_HEADER_UTILITY } = loadSettings(null);
  for (const href of ['https://example.com', '//example.com', 'javascript:alert(1)', '/\\example.com']) {
    assert.throws(() => parseHeaderUtility({ ...DEFAULT_HEADER_UTILITY, help: { ...DEFAULT_HEADER_UTILITY.help, href } }));
  }
});
