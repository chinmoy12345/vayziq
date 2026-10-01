import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";
import { getBlogPost } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return { title: "Story not found", robots: { index: false, follow: false } };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: (post.seoKeywords || "").split(",").map(keyword => keyword.trim()).filter(Boolean),
    alternates: { canonical: "/blog/" + post.slug },
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, url: "/blog/" + post.slug, type: "article", publishedTime: new Date(post.date).toISOString(), modifiedTime: new Date(post.updatedAt || post.date).toISOString(), images: [{ url: post.image, alt: post.imageAlt }] },
    twitter: { card: "summary_large_image", title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, images: [post.image] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const branding = await getStoreBranding();
  const post = await getBlogPost((await params).slug);
  if (!post) notFound();
  const structuredData = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt,
    image: post.image.startsWith("data:") ? post.image : "https://tantuka.in" + post.image, datePublished: new Date(post.date).toISOString(), dateModified: new Date(post.updatedAt || post.date).toISOString(),
    author: { "@type": "Organization", name: `${branding.name}` },
    publisher: { "@type": "Organization", name: `${branding.name}`, logo: { "@type": "ImageObject", url: "https://tantuka.in/logo.png" } },
    mainEntityOfPage: "https://tantuka.in/blog/" + post.slug,
  };
  return <main className="min-h-screen bg-[#FFFDFC]"><article>
    <header className="mx-auto max-w-4xl px-5 pb-8 pt-10 sm:px-8 sm:pt-14">
      <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-medium text-[#965B5B] hover:text-[#5B3030]"><ArrowLeft className="h-4 w-4" />Style Journal</Link>
      <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9F5E5E]">{post.category}</p><h1 className="mt-3 font-serif text-4xl leading-tight text-[#2B2525] sm:text-5xl">{post.title}</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-[#756565]">{post.excerpt}</p>
      <div className="mt-5 flex items-center gap-4 text-xs text-[#887777]"><time dateTime={post.date}>{new Date(post.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{post.readTime}</span></div>
    </header>
    <div className="relative mx-auto aspect-[16/8] max-h-[560px] max-w-6xl overflow-hidden bg-[#F4ECE8] sm:rounded-xl">{post.image.startsWith("data:") ? <img src={post.image} alt={post.imageAlt} className="absolute inset-0 h-full w-full object-cover" /> : <Image src={post.image} alt={post.imageAlt} fill priority sizes="100vw" className="object-cover" />}</div>
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="space-y-10">{post.sections.map((section, index) => <section key={`${section.title}-${index}`}><h2 className="font-serif text-2xl text-[#2B2525] sm:text-3xl">{section.title}</h2>{section.image && <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl bg-[#F4ECE8]">{section.image.startsWith("data:") ? <img src={section.image} alt={section.imageAlt || ""} className="absolute inset-0 h-full w-full object-cover" /> : <Image src={section.image} alt={section.imageAlt || ""} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />}</div>}<div className="mt-4 space-y-4 text-[15px] leading-8 text-[#594D4D]">{section.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div></section>)}</div>
      <div className="mt-12 border-t border-[#E8DADA] pt-7"><Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#2B2525] px-6 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#493B3B]">Explore the collection</Link></div>
    </div>
  </article></main>;
}
