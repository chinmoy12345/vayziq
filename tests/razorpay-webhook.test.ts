import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyRazorpayWebhook } from "../lib/razorpay-reconcile";

test("Razorpay webhook authenticates the exact raw body", () => {
  const body = '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_test"}}}}';
  const secret = "separate-webhook-secret";
  const signature = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyRazorpayWebhook(body, signature, secret), true);
  assert.equal(verifyRazorpayWebhook(`${body} `, signature, secret), false);
  assert.equal(verifyRazorpayWebhook(body, signature, "wrong-secret"), false);
  assert.equal(verifyRazorpayWebhook(body, null, secret), false);
  assert.equal(verifyRazorpayWebhook(body, "not-a-digest", secret), false);
});
