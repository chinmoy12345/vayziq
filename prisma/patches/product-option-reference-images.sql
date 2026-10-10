-- Optional storefront references for colour swatches and product size guides.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sizeGuideImage" TEXT;
ALTER TABLE "ProductOptionValue" ADD COLUMN IF NOT EXISTS "image" TEXT;