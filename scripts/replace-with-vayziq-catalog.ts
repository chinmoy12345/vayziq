import prisma from "../lib/db";

const products = [
  {
    name: "Essential Joggers",
    slug: "essential-joggers",
    sku: "VZ-MJ-001",
    categorySlug: "mens-joggers",
    price: 699,
    comparePrice: 899,
    stock: 48,
    featured: true,
    description: "Relaxed-fit everyday joggers made for movement, comfort and repeat wear.",
    image: "/vayziq/product-joggers.png",
  },
  {
    name: "Oversized Hoodie",
    slug: "oversized-hoodie",
    sku: "VZ-MH-001",
    categorySlug: "mens-hoodies",
    price: 999,
    comparePrice: 1299,
    stock: 36,
    featured: true,
    description: "A soft oversized hoodie with a clean, premium everyday silhouette.",
    image: "/vayziq/product-hoodie.png",
  },
  {
    name: "Classic T-Shirt",
    slug: "classic-t-shirt",
    sku: "VZ-MT-001",
    categorySlug: "mens-tshirts",
    price: 499,
    comparePrice: 649,
    stock: 62,
    featured: true,
    description: "A lightweight classic T-shirt for effortless daily styling.",
    image: "/vayziq/product-tshirt.png",
  },
  {
    name: "Tech Joggers",
    slug: "tech-joggers",
    sku: "VZ-MJ-002",
    categorySlug: "mens-joggers",
    price: 799,
    comparePrice: 999,
    stock: 34,
    featured: true,
    description: "Streamlined joggers with an athletic fit and all-day stretch comfort.",
    image: "/vayziq/category-joggers.png",
  },
  {
    name: "Track Suit Set",
    slug: "track-suit-set",
    sku: "VZ-MTS-001",
    categorySlug: "mens-tracksuits",
    price: 1499,
    comparePrice: 1899,
    stock: 24,
    featured: true,
    description: "A coordinated tracksuit set built for easy movement and confident looks.",
    image: "/vayziq/fashion-grid.png",
  },
  {
    name: "Premium Cap",
    slug: "premium-cap",
    sku: "VZ-MA-001",
    categorySlug: "mens-accessories",
    price: 399,
    comparePrice: 499,
    stock: 80,
    featured: true,
    description: "A structured premium cap to complete an everyday streetwear outfit.",
    image: "/vayziq/fashion-grid.png",
  },
  {
    name: "Everyday Women's Hoodie",
    slug: "everyday-womens-hoodie",
    sku: "VZ-WH-001",
    categorySlug: "womens-hoodies",
    price: 999,
    comparePrice: 1299,
    stock: 39,
    featured: true,
    description: "A versatile women's hoodie with a relaxed fit and soft hand feel.",
    image: "/vayziq/category-women.png",
  },
  {
    name: "Women's Comfort Joggers",
    slug: "womens-comfort-joggers",
    sku: "VZ-WJ-001",
    categorySlug: "womens-joggers",
    price: 749,
    comparePrice: 949,
    stock: 31,
    featured: false,
    description: "Easy-to-style comfort joggers with a relaxed silhouette.",
    image: "/vayziq/category-joggers.png",
  },
  {
    name: "Women's Essential Tee",
    slug: "womens-essential-tee",
    sku: "VZ-WT-001",
    categorySlug: "womens-tshirts",
    price: 549,
    comparePrice: 699,
    stock: 55,
    featured: false,
    description: "A soft, essential tee that works with every everyday wardrobe.",
    image: "/vayziq/product-tshirt.png",
  },
  {
    name: "Women's Athleisure Set",
    slug: "womens-athleisure-set",
    sku: "VZ-WTS-001",
    categorySlug: "womens-tracksuits",
    price: 1599,
    comparePrice: 1999,
    stock: 22,
    featured: true,
    description: "A comfortable matching athleisure set for a bold off-duty look.",
    image: "/vayziq/category-women.png",
  },
  {
    name: "Daily Carry Cap",
    slug: "daily-carry-cap",
    sku: "VZ-WA-001",
    categorySlug: "womens-accessories",
    price: 399,
    comparePrice: 499,
    stock: 70,
    featured: false,
    description: "A lightweight finishing piece for daily wear.",
    image: "/vayziq/fashion-grid.png",
  },
];

async function main() {
  const categories = await prisma.category.findMany({
    where: { slug: { in: products.map((product) => product.categorySlug) } },
    select: { id: true, slug: true },
  });
  const categoryIdBySlug = new Map(categories.map((category) => [category.slug, category.id]));

  if (categoryIdBySlug.size !== new Set(products.map((product) => product.categorySlug)).size) {
    throw new Error("VAYZIQ category hierarchy is missing. Run seed-vayziq-categories.ts first.");
  }

  await prisma.$transaction(async (tx) => {
    // Order-linked rows are removed first because Product and Shipment use restrictive foreign keys.
    await tx.serviceRequest.deleteMany();
    await tx.orderItem.updateMany({ data: { shipmentId: null } });
    await tx.shipment.deleteMany();
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();

    // Purchase, stock and customer product state belong to the old catalogue as well.
    await tx.inventoryMovement.deleteMany();
    await tx.supplierPayment.deleteMany();
    await tx.purchaseItem.deleteMany();
    await tx.purchase.deleteMany();
    await tx.cartItem.deleteMany();
    await tx.wishlistItem.deleteMany();
    await tx.review.deleteMany();

    // Images, options, variants, likes and engagement cascade when products are removed.
    await tx.product.deleteMany();

    for (const product of products) {
      await tx.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          stock: product.stock,
          reorderLevel: 5,
          status: "active",
          featured: product.featured,
          categoryId: categoryIdBySlug.get(product.categorySlug)!,
          images: { create: { image: product.image, sortOrder: 0 } },
          engagement: { create: {} },
        },
      });
    }
  });

  console.log(`Replaced product and order data with ${products.length} VAYZIQ products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
