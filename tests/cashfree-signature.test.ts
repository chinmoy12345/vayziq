import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { cashfreeBaseUrl, verifyCashfreeWebhook } from "../lib/cashfree";

test("Cashfree webhook requires an untampered raw body and timestamp", () => {
  const secret = "test-secret";
  const timestamp = "1760000000";
  const body = '{"type":"PAYMENT_SUCCESS_WEBHOOK","data":{"order":{"order_id":"TNK1"}}}';
  const signature = createHmac("sha256", secret).update(timestamp + body).digest("base64");
  assert.equal(verifyCashfreeWebhook(body, timestamp, signature, secret), true);
  assert.equal(verifyCashfreeWebhook(`${body} `, timestamp, signature, secret), false);
  assert.equal(verifyCashfreeWebhook(body, "1760000001", signature, secret), false);
  assert.equal(verifyCashfreeWebhook(body, timestamp, "bad", secret), false);
  assert.equal(verifyCashfreeWebhook(body, null, signature, secret), false);
});

test("Cashfree URLs do not mix test and live environments", () => {
  assert.equal(cashfreeBaseUrl("sandbox"), "https://sandbox.cashfree.com/pg");
  assert.equal(cashfreeBaseUrl("production"), "https://api.cashfree.com/pg");
});
