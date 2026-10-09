-- Additive Cashfree order references. Existing Razorpay and COD orders are unchanged.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashfreeOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cashfreePaymentId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_cashfreeOrderId_key" ON "Order"("cashfreeOrderId");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_cashfreePaymentId_key" ON "Order"("cashfreePaymentId");
