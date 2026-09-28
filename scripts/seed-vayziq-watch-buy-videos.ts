import prisma from "../lib/db";

// YouTube embeds are used because the direct stock-MP4 host blocks third-party
// playback with HTTP 403. Replace these demo reels from Admin → Products when
// original VAYZIQ campaign footage is available.
const reels = [
  ["essential-joggers", "https://www.youtube.com/shorts/lZySSncN8M0"],
  ["oversized-hoodie", "https://www.youtube.com/shorts/e6qjusAhnGU"],
  ["classic-t-shirt", "https://www.youtube.com/shorts/lZySSncN8M0"],
  ["tech-joggers", "https://www.youtube.com/shorts/e6qjusAhnGU"],
  ["womens-athleisure-set", "https://www.youtube.com/shorts/lZySSncN8M0"],
] as const;

async function main() {
  await prisma.$transaction(reels.map(([slug, videoUrl]) =>
    prisma.product.update({ where: { slug }, data: { videoUrl } }),
  ));
  console.log(`Added ${reels.length} Watch & Buy video reels.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
