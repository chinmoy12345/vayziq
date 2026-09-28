import prisma from "../lib/db";

const banners = [
  {
    title: "Move freely. Live boldly.",
    subtitle: "VAYZIQ everyday essentials",
    image: "/vayziq/hero-paired-v2.png",
    link: "/shop",
    sortOrder: 0,
  },
  {
    title: "Women's everyday wear",
    subtitle: "Comfort with confidence",
    image: "/vayziq/category-women.png",
    link: "/women",
    sortOrder: 1,
  },
  {
    title: "Men's streetwear",
    subtitle: "Built for movement",
    image: "/vayziq/category-men.png",
    link: "/men",
    sortOrder: 2,
  },
  {
    title: "Everyday essentials",
    subtitle: "Joggers, hoodies and more",
    image: "/vayziq/fashion-grid.png",
    link: "/shop",
    sortOrder: 3,
  },
];

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.banner.deleteMany({ where: { placement: "home" } });
    await tx.banner.createMany({ data: banners.map((banner) => ({ ...banner, placement: "home", active: true })) });
  });
  console.log(`Replaced home slider with ${banners.length} VAYZIQ banners.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
