import prisma from "../lib/db";

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
};

const catalogue: Array<{
  parent: CategorySeed;
  children: CategorySeed[];
}> = [
  {
    parent: {
      name: "Men",
      slug: "men",
      description: "Everyday essentials and streetwear for men.",
      image: "/vayziq/category-men.png",
      sortOrder: 10,
    },
    children: [
      { name: "Men's Joggers", slug: "mens-joggers", description: "Comfortable everyday joggers for men.", image: "/vayziq/category-joggers.png", sortOrder: 1 },
      { name: "Men's Hoodies", slug: "mens-hoodies", description: "Oversized and essential hoodies for men.", image: "/vayziq/product-hoodie.png", sortOrder: 2 },
      { name: "Men's T-Shirts", slug: "mens-tshirts", description: "Classic T-shirts for men.", image: "/vayziq/product-tshirt.png", sortOrder: 3 },
      { name: "Men's Tracksuits", slug: "mens-tracksuits", description: "Co-ordinated tracksuits for men.", image: "/vayziq/fashion-grid.png", sortOrder: 4 },
      { name: "Men's Accessories", slug: "mens-accessories", description: "Caps and everyday accessories for men.", image: "/vayziq/fashion-grid.png", sortOrder: 5 },
    ],
  },
  {
    parent: {
      name: "Women",
      slug: "women",
      description: "Confident everyday wear and athleisure for women.",
      image: "/vayziq/category-women.png",
      sortOrder: 11,
    },
    children: [
      { name: "Women's Joggers", slug: "womens-joggers", description: "Relaxed joggers for women.", image: "/vayziq/category-joggers.png", sortOrder: 1 },
      { name: "Women's Hoodies", slug: "womens-hoodies", description: "Comfortable hoodies for women.", image: "/vayziq/category-women.png", sortOrder: 2 },
      { name: "Women's T-Shirts", slug: "womens-tshirts", description: "Soft everyday T-shirts for women.", image: "/vayziq/product-tshirt.png", sortOrder: 3 },
      { name: "Women's Tracksuits", slug: "womens-tracksuits", description: "Matching tracksuits for women.", image: "/vayziq/category-women.png", sortOrder: 4 },
      { name: "Women's Accessories", slug: "womens-accessories", description: "Caps and finishing accessories for women.", image: "/vayziq/fashion-grid.png", sortOrder: 5 },
    ],
  },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const group of catalogue) {
      const parent = await tx.category.upsert({
        where: { slug: group.parent.slug },
        create: { ...group.parent, featured: true, status: "active" },
        update: { ...group.parent, featured: true, status: "active", parentId: null },
      });

      for (const child of group.children) {
        await tx.category.upsert({
          where: { slug: child.slug },
          create: { ...child, parentId: parent.id, status: "active" },
          update: { ...child, parentId: parent.id, status: "active" },
        });
      }
    }
  });

  console.log("VAYZIQ Men and Women category hierarchy is ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
