import assert from "node:assert/strict";
import { test } from "node:test";
import { emptySizeGuide, parseSizeGuide } from "../lib/size-guide-data";

test("draft charts allow missing measurements but published charts require every cell", () => {
  const draft = emptySizeGuide();
  assert.ok(parseSizeGuide(draft));
  assert.equal(parseSizeGuide({ ...draft, enabled: true }), null);
  const complete = { ...draft, enabled: true, rows: [{ size: "M", values: ["38–40", "32", "40"] }] };
  assert.deepEqual(parseSizeGuide(complete), complete);
});
test("reject duplicate sizes, invalid columns, units and malformed table rows", () => {
  const draft = emptySizeGuide();
  assert.equal(parseSizeGuide({ ...draft, rows: [draft.rows[0], draft.rows[0]] }), null);
  assert.equal(parseSizeGuide({ ...draft, columns: ["Waist", "waist"] }), null);
  assert.equal(parseSizeGuide({ ...draft, unit: "mm" }), null);
  assert.equal(parseSizeGuide({ ...draft, rows: [{ size: "M", values: [] }] }), null);
});
