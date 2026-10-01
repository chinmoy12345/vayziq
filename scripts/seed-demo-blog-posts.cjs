require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('../lib/generated/prisma-suppliers');
const db = new PrismaClient();
const image = '/vayziq/fashion-grid.png';
const posts = [
  ['everyday-hoodie-styling', 'How to Style a Hoodie Beyond the Weekend', 'Menswear Edit', 'A practical guide to building polished hoodie outfits for travel, workdays and weekends.', '4 min read'],
  ['joggers-fit-and-care-guide', 'Joggers: Finding the Right Fit and Keeping Them Fresh', 'Fit & Care', 'Choose a comfortable jogger fit and keep the fabric looking its best through regular wear.', '3 min read'],
  ['caps-and-accessories-guide', 'The Small Accessories That Finish an Everyday Look', 'Accessories', 'Caps, bags and jewellery can add personality without making an outfit feel overdone.', '3 min read'],
  ['building-a-travel-capsule', 'Build a Travel Capsule That Works Harder', 'Wardrobe Notes', 'A concise packing approach built around layers, comfortable fabrics and easy colour combinations.', '5 min read'],
  ['weekend-athleisure-edit', 'The Weekend Athleisure Edit', 'Activewear', 'Comfort-led pieces that still look considered—from morning errands to late coffee plans.', '3 min read'],
];
async function main() {
  const key = 'blog_content';
  const setting = await db.storeSetting.findUnique({ where: { key } });
  const value = setting && typeof setting.value === 'object' && setting.value ? setting.value : {};
  const current = Array.isArray(value.posts) ? value.posts : [];
  const next = [...current];
  for (const [slug, title, category, excerpt, readTime] of posts) if (!next.some(post => post && post.slug === slug)) next.push({ slug, title, category, excerpt, readTime, date: '2026-10-01', image, imageAlt: title, published: true, sections: [{ title: 'The edit', body: [excerpt, 'Start with a piece you already enjoy wearing, then build around comfort, proportion and personal style.'] }], seoTitle: title, seoDescription: excerpt, seoKeywords: `${category}, fashion guide, VAYZIQ` });
  const content = { settings: value.settings || { pageEyebrow: 'Notes on getting dressed', pageTitle: 'The Style Journal', pageIntro: 'Ideas for wearing, caring for and enjoying the pieces you love.', seoTitle: 'Style Journal | VAYZIQ', seoDescription: 'Fashion guides from VAYZIQ.', seoKeywords: 'fashion, style, VAYZIQ' }, posts: next };
  await db.storeSetting.upsert({ where: { key }, update: { value: content }, create: { key, value: content } });
  console.log(`Blog posts ready: ${next.length}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
