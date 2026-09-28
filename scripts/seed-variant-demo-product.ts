import prisma from "../lib/db";

const slug = "performance-oversized-hoodie";

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: "mens-hoodies" }, select: { id: true } });
  if (!category) throw new Error("Men's Hoodies category is missing.");

  await prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { slug }, select: { id: true } });
    const product = existing
      ? await tx.product.update({
          where: { id: existing.id },
          data: {
            name: "Performance Oversized Hoodie",
            sku: "VZ-HOODIE-PRO-01",
            description: "Premium oversized hoodie with brushed fleece comfort, a structured hood and an elevated everyday fit.",
            price: 1199,
            comparePrice: 1599,
            stock: 48,
            reorderLevel: 5,
            status: "active",
            featured: true,
            hasVariations: true,
            categoryId: category.id,
            images: { deleteMany: {} },
            variants: { deleteMany: {} },
            options: { deleteMany: {} },
          },
        })
      : await tx.product.create({
          data: {
            name: "Performance Oversized Hoodie",
            slug,
            sku: "VZ-HOODIE-PRO-01",
            description: "Premium oversized hoodie with brushed fleece comfort, a structured hood and an elevated everyday fit.",
            price: 1199,
            comparePrice: 1599,
            stock: 48,
            reorderLevel: 5,
            status: "active",
            featured: true,
            hasVariations: true,
            categoryId: category.id,
          },
        });

    await tx.productImage.createMany({ data: [
      { productId: product.id, image: "/vayziq/product-hoodie.png", sortOrder: 0 },
      { productId: product.id, image: "/vayziq/category-men.png", sortOrder: 1 },
    ] });

    const color = await tx.productOption.create({ data: { productId: product.id, name: "Color", sortOrder: 0 } });
    const size = await tx.productOption.create({ data: { productId: product.id, name: "Size", sortOrder: 1 } });
    const [black, olive] = await Promise.all([
      tx.productOptionValue.create({ data: { optionId: color.id, value: "Black", sortOrder: 0 } }),
      tx.productOptionValue.create({ data: { optionId: color.id, value: "Olive", sortOrder: 1 } }),
    ]);
    const [small, medium, large] = await Promise.all([
      tx.productOptionValue.create({ data: { optionId: size.id, value: "S", sortOrder: 0 } }),
      tx.productOptionValue.create({ data: { optionId: size.id, value: "M", sortOrder: 1 } }),
      tx.productOptionValue.create({ data: { optionId: size.id, value: "L", sortOrder: 2 } }),
    ]);

    const variants = [
      ["BLACK-S", 1199, 14, [black.id, small.id]],
      ["BLACK-M", 1199, 0, [black.id, medium.id]], // Out of stock
      ["BLACK-L", 1199, 11, [black.id, large.id]],
      ["OLIVE-S", 1249, 10, [olive.id, small.id]],
      ["OLIVE-M", 1249, 0, [olive.id, medium.id]], // Out of stock
      ["OLIVE-L", 1249, 13, [olive.id, large.id]],
    ] as const;

    for (const [suffix, price, stock, optionValueIds] of variants) {
      await tx.productVariant.create({
        data: {
          productId: product.id,
          sku: `VZ-HOODIE-PRO-01-${suffix}`,
          price,
          stock,
          reorderLevel: 5,
          variantValues: { create: optionValueIds.map((optionValueId) => ({ optionValueId })) },
        },
      });
    }
  });

  console.log(`Created ${slug} with six Color × Size variants; Black/M and Olive/M are out of stock.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
