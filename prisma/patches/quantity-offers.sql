DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "StoreSetting" WHERE "key" = 'quantity-offers-v1') THEN
    INSERT INTO "Coupon" ("code", "description", "type", "value", "minimumOrder", "maximumDiscount", "active", "rules", "updatedAt") VALUES
      ('BUY2SAVE50', 'Buy any 2 eligible items and save INR 50.', 'quantity_discount', 0, 0, NULL, TRUE, '{"productIds":[],"tiers":[{"quantity":2,"price":50}]}'::jsonb, NOW()),
      ('BUY3SAVE90', 'Buy any 3 eligible items and save INR 90.', 'quantity_discount', 0, 0, NULL, TRUE, '{"productIds":[],"tiers":[{"quantity":3,"price":90}]}'::jsonb, NOW())
    ON CONFLICT ("code") DO NOTHING;
    INSERT INTO "StoreSetting" ("key", "value", "updatedAt") VALUES ('quantity-offers-v1', 'true'::jsonb, NOW());
  END IF;
END $$;