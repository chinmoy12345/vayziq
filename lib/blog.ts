import { cache } from "react";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import prisma from "@/lib/db";

export type BlogSection = { title: string; body: string[]; image?: string; imageAlt?: string };
export type BlogPost = {
  slug: string; title: string; excerpt: string; category: string; date: string;
  readTime: string; image: string; imageAlt: string; sections: BlogSection[];
  seoTitle?: string; seoDescription?: string; seoKeywords?: string;
  published: boolean; updatedAt?: string;
};
export type BlogSettings = {
  pageEyebrow: string; pageTitle: string; pageIntro: string;
  seoTitle: string; seoDescription: string; seoKeywords: string;
};
export type BlogContent = { settings: BlogSettings; posts: BlogPost[] };
export const BLOG_CONTENT_KEY = "blog_content";
export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  pageEyebrow: "Notes on getting dressed", pageTitle: "The Style Journal",
  pageIntro: "Ideas for wearing, caring for and enjoying the pieces you love.",
  seoTitle: "Style Journal | Tantuka",
  seoDescription: "Explore saree, kurti and nightwear styling guides from Tantuka.",
  seoKeywords: "saree styling, kurti guide, nightwear, Indian fashion",
};

const defaultPosts: BlogPost[] = [
  {
    slug: "how-to-choose-a-saree-for-every-occasion", title: "How to Choose a Saree for Every Occasion",
    excerpt: "A guide to choosing a saree by occasion, fabric, colour and the way you want to feel in it.",
    category: "Saree Guide", date: "2026-09-24", readTime: "4 min read",
    image: "/uploads/banners/home-saree-editorial.png", imageAlt: "Saree styling from the Tantuka collection",
    published: true,
    sections: [
      { title: "Start with the occasion", body: ["For a daytime gathering, try a lighter drape and softer colours. Evening celebrations are a lovely moment for richer tones, a little shimmer or a detailed border.", "Think about how long you will wear it and whether you will be moving around. Comfort helps you enjoy the occasion as much as the look."] },
      { title: "Choose a fabric that feels right", body: ["Cotton and lighter blends are breathable choices for warm days. Silk-inspired and embellished fabrics bring a more formal finish for celebrations and dinners.", "Read the fabric and care details when shopping online. They help you understand the texture, drape and upkeep before you choose."] },
      { title: "Make the styling your own", body: ["A simple blouse, favourite earrings and a comfortable drape can be all you need. If the saree has a detailed border, keep accessories quiet; if it is understated, let one favourite piece add a personal touch."] },
    ],
  },
  {
    slug: "a-simple-guide-to-styling-kurtis", title: "A Simple Guide to Styling Kurtis",
    excerpt: "Easy kurti combinations for workdays, weekends and occasions, without overthinking your wardrobe.",
    category: "Style Notes", date: "2026-09-24", readTime: "3 min read",
    image: "/uploads/banners/home-kurti-editorial.png", imageAlt: "Relaxed kurti styling for everyday wear",
    published: true,
    sections: [
      { title: "Build an easy everyday look", body: ["Pair a straight kurti with trousers for a clean, comfortable outfit. A-line styles work beautifully with slim bottoms, while a relaxed silhouette looks easy with straight pants.", "Choose colours that already sit well with your wardrobe. A few versatile pieces make it simpler to get dressed and create more combinations."] },
      { title: "Adjust the look for the moment", body: ["For a workday, add a light layer and understated jewellery. For a family lunch or evening out, try a brighter colour, printed dupatta or expressive accessory.", "Check fabric, sleeve and length details when selecting a kurti online. The right fit should let you move comfortably and feel like yourself."] },
    ],
  },
  {
    slug: "choosing-comfortable-nightwear", title: "Choosing Nightwear You’ll Love Wearing",
    excerpt: "What to look for in soft, comfortable nightwear, from breathable fabrics to an easy fit.",
    category: "Everyday Comfort", date: "2026-09-24", readTime: "3 min read",
    image: "/uploads/categories/category-0f16158aeaa9fbfbed95baef.png", imageAlt: "Comfortable nightwear for a restful evening",
    published: true,
    sections: [
      { title: "Let comfort lead", body: ["Nightwear should feel gentle against your skin and leave room to rest. Breathable fabrics and an easy silhouette are useful choices for everyday comfort.", "Check the size guide and garment details. Choose a fit that feels relaxed without getting in the way."] },
      { title: "Think about your routine", body: ["A coordinated set is effortless, while a soft top and relaxed bottoms are easy to mix and match. Consider your room temperature when choosing fabric and sleeve length.", "Care instructions can help your favourite pieces stay soft and comfortable wash after wash."] },
    ],
  },
];

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}
function normalizePost(value: unknown): BlogPost | null {
  const row = record(value);
  if (!row) return null;
  const slug = stringValue(row.slug).trim();
  const title = stringValue(row.title).trim();
  if (!slug || !title) return null;
  const sections = Array.isArray(row.sections) ? row.sections.flatMap((value): BlogSection[] => {
    const section = record(value);
    if (!section || typeof section.title !== "string" || !Array.isArray(section.body)) return [];
    return [{ title: section.title, body: section.body.filter((paragraph): paragraph is string => typeof paragraph === "string"), image: stringValue(section.image), imageAlt: stringValue(section.imageAlt) }];
  }) : [];
  return {
    slug, title, excerpt: stringValue(row.excerpt), category: stringValue(row.category, "Style Notes"),
    date: stringValue(row.date, new Date().toISOString().slice(0, 10)), readTime: stringValue(row.readTime, "4 min read"),
    image: stringValue(row.image), imageAlt: stringValue(row.imageAlt), sections,
    seoTitle: stringValue(row.seoTitle), seoDescription: stringValue(row.seoDescription), seoKeywords: stringValue(row.seoKeywords),
    published: typeof row.published === "boolean" ? row.published : true, updatedAt: stringValue(row.updatedAt),
  };
}
function normalizeSettings(value: unknown): BlogSettings {
  const row = record(value) ?? {};
  return {
    pageEyebrow: stringValue(row.pageEyebrow, DEFAULT_BLOG_SETTINGS.pageEyebrow),
    pageTitle: stringValue(row.pageTitle, DEFAULT_BLOG_SETTINGS.pageTitle),
    pageIntro: stringValue(row.pageIntro, DEFAULT_BLOG_SETTINGS.pageIntro),
    seoTitle: stringValue(row.seoTitle, DEFAULT_BLOG_SETTINGS.seoTitle),
    seoDescription: stringValue(row.seoDescription, DEFAULT_BLOG_SETTINGS.seoDescription),
    seoKeywords: stringValue(row.seoKeywords, DEFAULT_BLOG_SETTINGS.seoKeywords),
  };
}
export const getBlogContent = cache(async (): Promise<BlogContent> => {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key: BLOG_CONTENT_KEY }, select: { value: true } });
    if (!setting) return { settings: DEFAULT_BLOG_SETTINGS, posts: defaultPosts };
    const stored = record(setting.value);
    if (!stored) return { settings: DEFAULT_BLOG_SETTINGS, posts: defaultPosts };
    const posts = Array.isArray(stored.posts)
      ? stored.posts.map(normalizePost).filter((post): post is BlogPost => post !== null)
      : defaultPosts;
    return { settings: normalizeSettings(stored.settings), posts };
  } catch {
    return { settings: DEFAULT_BLOG_SETTINGS, posts: defaultPosts };
  }
});
export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const { posts } = await getBlogContent();
  return includeDrafts ? posts : posts.filter((post) => post.published);
}
export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}
export async function getBlogSettings(): Promise<BlogSettings> {
  return (await getBlogContent()).settings;
}
export function blogContentToJson(content: BlogContent): Prisma.InputJsonValue {
  return content as unknown as Prisma.InputJsonValue;
}
