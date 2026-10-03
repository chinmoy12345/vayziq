import { pageSeo } from "@/lib/seo";
import { StoreName } from "@/components/StoreBranding";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { getBlogPosts, getBlogSettings } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function generateMetadata() { return pageSeo("/blog", await originalMetadata()); }
async function originalMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings();
  return {
    title: settings.seoTitle,
    description: settings.seoDescription,
    keywords: ["streetwear", "men's clothing", "women's clothing", "unisex style"],
    alternates: { canonical: "/blog" },
    openGraph: { title: settings.seoTitle, description: settings.seoDescription, url: "/blog", type: "website" },
  };
}

export default async function BlogPage() {
  const [blogPosts, settings] = await Promise.all([getBlogPosts(), getBlogSettings()]);
  return <main className="min-h-screen bg-[#FFFDFC]">
    <header className="border-b border-[#E8DADA] bg-[#F8EFEC]"><div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9F5E5E]">{settings.pageEyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl text-[#2B2525] sm:text-6xl">{settings.pageTitle}</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#756565]">{settings.pageIntro}</p>
    </div></header>
    <section aria-label="Latest articles" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="mb-7 flex items-end justify-between border-b border-[#E8DADA] pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9F5E5E]">From <StoreName /></p><h2 className="mt-1 font-serif text-2xl text-[#2B2525]">Latest stories</h2></div><span className="text-xs text-[#887777]">{blogPosts.length} articles</span></div>
      {blogPosts.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{blogPosts.map(post => <article key={post.slug} className="group overflow-hidden rounded-xl border border-[#E8DADA] bg-white transition hover:-translate-y-1 hover:shadow-lg">
        <Link href={"/blog/" + post.slug} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#F4ECE8]">{post.image.startsWith("data:") ? <img src={post.image} alt={post.imageAlt} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />}</div>
          <div className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9F5E5E]">{post.category}</p><h2 className="mt-2 font-serif text-2xl leading-snug text-[#2B2525] group-hover:text-[#965B5B]">{post.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#756565]">{post.excerpt}</p>
            <div className="mt-5 flex items-center justify-between border-t border-[#F0E8E5] pt-4 text-[11px] text-[#887777]"><span>{new Date(post.date + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{post.readTime}</span></div>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#965B5B]">Read story <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </div>
        </Link>
      </article>)}</div> : <p className="rounded-xl border border-[#E8DADA] bg-white p-10 text-center text-sm text-[#887777]">New stories are coming soon.</p>}
    </section>
  </main>;
}
