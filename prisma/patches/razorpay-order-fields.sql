-- Apply the additive Razorpay change before db push checks the remaining schema.
-- A DO block is atomic: duplicate payment IDs fail without changing order data.
DO $$
BEGIN
  -- A fresh database is initialized by the following db push instead.
  IF to_regclass('"Order"') IS NOT NULL THEN
    ALTER TABLE "Order"
      ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT,
      ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;

    CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayOrderId_key"
      ON "Order"("razorpayOrderId");
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_razorpayPaymentId_key"
      ON "Order"("razorpayPaymentId");
  END IF;
END
$$;
