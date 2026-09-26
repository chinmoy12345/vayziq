DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "StoreSetting" WHERE "key" = 'managed-offers-v1') THEN
    INSERT INTO "Coupon" ("code", "description", "type", "value", "minimumOrder", "maximumDiscount", "updatedAt") VALUES
      ('TANTUKA5', 'Everyday savings', 'percentage', 5, 499, 100, NOW()),
      ('SAVE100', 'Save on your favourites', 'fixed', 100, 999, 100, NOW()),
      ('STYLE10', 'Refresh your wardrobe', 'percentage', 10, 1499, 200, NOW()),
      ('SAVE250', 'A little more to love', 'fixed', 250, 2499, 250, NOW()),
      ('FESTIVE15', 'Celebrate in style', 'percentage', 15, 3499, 500, NOW())
    ON CONFLICT ("code") DO NOTHING;
    INSERT INTO "StoreSetting" ("key", "value", "updatedAt") VALUES ('managed-offers-v1', 'true'::jsonb, NOW());
  END IF;
END $$;
