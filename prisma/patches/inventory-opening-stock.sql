INSERT INTO "InventoryMovement" (
  "productId", "variantId", "orderId", "actorId", "productName", "sku",
  "variantLabel", "delta", "previousStock", "newStock", "reason", "note", "createdAt"
)
SELECT
  p."id", NULL::integer, NULL::integer, NULL::integer, p."name", p."sku", NULL::text,
  p."stock", 0, p."stock", 'opening', 'Opening stock on inventory setup', CURRENT_TIMESTAMP
FROM "Product" p
WHERE p."stock" > 0
  AND NOT EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p."id")
  AND NOT EXISTS (
    SELECT 1 FROM "InventoryMovement" m
    WHERE m."productId" = p."id" AND m."variantId" IS NULL AND m."reason" = 'opening'
  )
UNION ALL
SELECT
  p."id", v."id", NULL::integer, NULL::integer, p."name", v."sku", NULL::text,
  v."stock", 0, v."stock", 'opening', 'Opening stock on inventory setup', CURRENT_TIMESTAMP
FROM "ProductVariant" v
JOIN "Product" p ON p."id" = v."productId"
WHERE v."stock" > 0
  AND NOT EXISTS (
    SELECT 1 FROM "InventoryMovement" m
    WHERE m."productId" = p."id" AND m."variantId" = v."id" AND m."reason" = 'opening'
  );
