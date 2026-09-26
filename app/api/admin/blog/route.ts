import { NextResponse } from "next/server";
import type { Prisma } from "@/lib/generated/prisma-suppliers";
import { requireAdminPermission } from "@/lib/auth";
import prisma from "@/lib/db";
import { BLOG_CONTENT_KEY, type BlogContent, type BlogPost, type BlogSection, type BlogSettings } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const settingLimits: Record<keyof BlogSettings, number> = {
  pageEyebrow: 100, pageTitle: 160, pageIntro: 500, seoTitle: 70, seoDescription: 320, seoKeywords: 500,
};
const postLimits = { slug: 120, title: 160, excerpt: 400, category: 80, readTime: 40, image: 3_000_000, imageAlt: 250, seoTitle: 70, seoDescription: 320, seoKeywords: 500 };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validImage(value: string) {
  return value.startsWith("/") || /^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value);
}
function normalizeSettings(value: unknown): BlogSettings | null {
  if (!isRecord(value)) return null;
  const result = {} as BlogSettings;
  for (const key of Object.keys(settingLimits) as (keyof BlogSettings)[]) {
    const field = value[key];
    if (typeof field !== "string" || field.length > settingLimits[key]) return null;
    result[key] = field.trim();
  }
  return result;
}
function normalizePost(value: unknown): BlogPost | null {
  if (!isRecord(value)) return null;
  for (const [key, max] of Object.entries(postLimits)) {
    if (typeof value[key] !== "string" || (value[key] as string).length > max) return null;
  }
  if (typeof value.published !== "boolean" || !Array.isArray(value.sections) || value.sections.length > 50) return null;
  const slug = value.slug as string;
  const date = value.date as string;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !validImage(value.image as string)) return null;
  const sections: BlogSection[] = [];
  for (const raw of value.sections) {
    if (!isRecord(raw) || typeof raw.title !== "string" || raw.title.length > 160 || !Array.isArray(raw.body) || raw.body.length > 100) return null;
    if (raw.body.some((paragraph) => typeof paragraph !== "string" || paragraph.length > 5000)) return null;
    sections.push({ title: raw.title.trim(), body: (raw.body as string[]).map((paragraph) => paragraph.trim()).filter(Boolean) });
  }
  return {
    slug, title: (value.title as string).trim(), excerpt: (value.excerpt as string).trim(),
    category: (value.category as string).trim(), date, readTime: (value.readTime as string).trim(),
    image: value.image as string, imageAlt: (value.imageAlt as string).trim(), sections,
    seoTitle: (value.seoTitle as string).trim(), seoDescription: (value.seoDescription as string).trim(),
    seoKeywords: (value.seoKeywords as string).trim(), published: value.published, updatedAt: new Date().toISOString(),
  };
}
export async function GET() {
  if (!(await requireAdminPermission("blog","view"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const { getBlogContent } = await import("@/lib/blog");
  return NextResponse.json({ success: true, data: await getBlogContent() });
}
export async function PUT(request: Request) {
  if (!(await requireAdminPermission("blog","update"))) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as unknown;
  if (!isRecord(body)) return NextResponse.json({ success: false, message: "Invalid blog content." }, { status: 400 });
  const settings = normalizeSettings(body.settings);
  if (!settings || !Array.isArray(body.posts) || body.posts.length > 500) {
    return NextResponse.json({ success: false, message: "Check the blog page fields and article list." }, { status: 400 });
  }
  const posts = body.posts.map(normalizePost);
  if (posts.some((post) => post === null)) {
    return NextResponse.json({ success: false, message: "Each article needs a valid slug, date, image, content and publication status." }, { status: 400 });
  }
  const validPosts = posts as BlogPost[];
  if (new Set(validPosts.map((post) => post.slug)).size !== validPosts.length) {
    return NextResponse.json({ success: false, message: "Article URL slugs must be unique." }, { status: 400 });
  }
  const content: BlogContent = { settings, posts: validPosts };
  const json = content as unknown as Prisma.InputJsonValue;
  await prisma.storeSetting.upsert({
    where: { key: BLOG_CONTENT_KEY },
    update: { value: json },
    create: { key: BLOG_CONTENT_KEY, value: json },
  });
  return NextResponse.json({ success: true, data: content });
}
