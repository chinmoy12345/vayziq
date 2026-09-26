"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { BlogContent, BlogPost, BlogSection } from "@/lib/blog";

const emptyContent: BlogContent = {
  settings: { pageEyebrow: "Notes on getting dressed", pageTitle: "The Style Journal", pageIntro: "", seoTitle: "", seoDescription: "", seoKeywords: "" },
  posts: [],
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function newPost(): BlogPost {
  return {
    slug: "",
    title: "",
    excerpt: "",
    category: "Style Notes",
    date: new Date().toLocaleDateString("en-CA"),
    readTime: "4 min read",
    image: "",
    imageAlt: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    published: false,
    sections: [{ title: "", body: [""] }],
  };
}

export default function BlogManagement() {
  const [content, setContent] = useState<BlogContent>(emptyContent);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/blog", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as { success?: boolean; data?: BlogContent; message?: string };
        if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message || "Blog content could not be loaded.");
        if (active) setContent(payload.data);
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Blog content could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const editing = activeIndex === null ? null : content.posts[activeIndex] ?? null;

  function updateSettings(key: keyof BlogContent["settings"], value: string) {
    setContent((current) => ({ ...current, settings: { ...current.settings, [key]: value } }));
  }

  function updatePost(index: number, patch: Partial<BlogPost>) {
    setContent((current) => ({ ...current, posts: current.posts.map((post, postIndex) => postIndex === index ? { ...post, ...patch } : post) }));
  }

  function updateSection(index: number, sectionIndex: number, patch: Partial<BlogSection>) {
    const post = content.posts[index];
    const sections = post.sections.map((section, currentIndex) => currentIndex === sectionIndex ? { ...section, ...patch } : section);
    updatePost(index, { sections });
  }

  function addPost() {
    const posts = [...content.posts, newPost()];
    setContent((current) => ({ ...current, posts }));
    setActiveIndex(posts.length - 1);
    setError("");
    setMessage("");
  }

  function deletePost(index: number) {
    const post = content.posts[index];
    if (!window.confirm(`Remove “${post.title || "Untitled post"}” from the blog? Save changes to apply.`)) return;
    const posts = content.posts.filter((_, postIndex) => postIndex !== index);
    setContent((current) => ({ ...current, posts }));
    setActiveIndex(null);
    setMessage("Post removed from the editor. Save changes to apply it to the site.");
  }

  async function uploadCover(file?: File) {
    if (!file) return;
    if (activeIndex === null) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/upload/banner", { method: "POST", body: formData });
      const payload = await response.json() as { image?: string; message?: string };
      if (!response.ok || !payload.image) throw new Error(payload.message || "Cover image upload failed.");
      updatePost(activeIndex, { image: payload.image });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Cover image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const payload = await response.json() as { success?: boolean; data?: BlogContent; message?: string };
      if (!response.ok || !payload.success || !payload.data) throw new Error(payload.message || "Blog changes could not be saved.");
      setContent(payload.data);
      setMessage("Blog content and SEO settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Blog changes could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-6 text-sm text-[#857974]">Loading blog manager…</main>;

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Storefront content</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Blog Management</h1><p className="mt-2 max-w-2xl text-sm text-[#857974]">Manage the Style Journal, article content, publication status, cover images and search metadata.</p></div><div className="flex gap-2"><Link href="/blog" target="_blank" className="inline-flex h-11 items-center rounded-lg border border-[#ded6d1] bg-white px-4 text-sm font-medium text-[#625954]">View blog</Link><button type="button" onClick={() => void save()} disabled={saving || uploading} className="inline-flex h-11 items-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white hover:bg-[#403936] disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div></div>

    {error && <p role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {message && <p role="status" className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

    <section className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Blog landing page &amp; SEO</h2><p className="mt-1 text-xs text-[#958b86]">These fields control the public blog heading and its search and social preview metadata.</p></div><div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <Field label="Eyebrow"><input maxLength={100} value={content.settings.pageEyebrow} onChange={(event) => updateSettings("pageEyebrow", event.target.value)} /></Field>
      <Field label="Page heading"><input maxLength={160} value={content.settings.pageTitle} onChange={(event) => updateSettings("pageTitle", event.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Introduction"><textarea rows={2} maxLength={500} value={content.settings.pageIntro} onChange={(event) => updateSettings("pageIntro", event.target.value)} /></Field></div>
      <Field label="SEO title"><input maxLength={70} value={content.settings.seoTitle} onChange={(event) => updateSettings("seoTitle", event.target.value)} /><Hint value={content.settings.seoTitle} max={70} /></Field>
      <Field label="SEO description"><textarea rows={3} maxLength={320} value={content.settings.seoDescription} onChange={(event) => updateSettings("seoDescription", event.target.value)} /><Hint value={content.settings.seoDescription} max={320} /></Field>
      <div className="sm:col-span-2"><Field label="SEO keywords (comma separated)"><input maxLength={500} value={content.settings.seoKeywords} onChange={(event) => updateSettings("seoKeywords", event.target.value)} /></Field></div>
    </div></section>

    <section className="mt-6 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee6e1] px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-[#292321]">Articles <span className="ml-1 text-xs font-normal text-[#958b86]">{content.posts.length}</span></h2><p className="mt-1 text-xs text-[#958b86]">Drafts stay private; published posts appear on the blog and sitemap.</p></div><button type="button" onClick={addPost} className="h-10 rounded-lg bg-[#292321] px-4 text-sm font-medium text-white">Add article</button></div>
      {content.posts.length === 0 ? <p className="p-7 text-sm text-[#857974]">No posts yet. Add an article to start the journal.</p> : <div className="divide-y divide-[#f0e9e5]">{content.posts.map((post, index) => <div key={`${post.slug}-${index}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-6"><div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f5eeeb]">{post.image && <img src={post.image} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-[#292321]">{post.title || "Untitled article"}</p><p className="mt-1 truncate text-xs text-[#958b86]">/blog/{post.slug || "your-article-slug"} · {post.category}</p><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${post.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{post.published ? "Published" : "Draft"}</span></div><div className="flex gap-2"><button type="button" onClick={() => { setActiveIndex(index); setError(""); setMessage(""); }} className="h-9 rounded-lg border border-[#ded6d1] px-3 text-xs font-medium text-[#625954]">Edit</button><button type="button" onClick={() => deletePost(index)} className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700">Remove</button></div></div>)}</div>}
    </section>

    {editing && activeIndex !== null && <section className="mt-6 scroll-mt-6 overflow-hidden rounded-xl border border-[#d8c7c0] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#eee6e1] px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-[#292321]">{editing.title || "New article"}</h2><p className="mt-1 text-xs text-[#958b86]">Edit article content and SEO fields, then use Save changes at the top.</p></div><button type="button" onClick={() => setActiveIndex(null)} className="h-9 rounded-lg border border-[#ded6d1] px-3 text-sm text-[#625954]">Close editor</button></div>
      <div className="space-y-6 p-5 sm:p-6">
        <section><h3 className="text-sm font-semibold text-[#403936]">Article content</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Title"><input maxLength={160} value={editing.title} onChange={(event) => { const title = event.target.value; updatePost(activeIndex, { title, ...(!editing.slug ? { slug: slugify(title) } : {}) }); }} /></Field><Field label="URL slug"><span className="mb-1 block text-[10px] text-[#958b86]">tantuka.in/blog/{editing.slug || "your-article-slug"}</span><input maxLength={120} value={editing.slug} onChange={(event) => updatePost(activeIndex, { slug: slugify(event.target.value) })} /></Field><Field label="Category"><input maxLength={80} value={editing.category} onChange={(event) => updatePost(activeIndex, { category: event.target.value })} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Publish date"><input type="date" value={editing.date} onChange={(event) => updatePost(activeIndex, { date: event.target.value })} /></Field><Field label="Reading time"><input maxLength={40} value={editing.readTime} onChange={(event) => updatePost(activeIndex, { readTime: event.target.value })} /></Field></div><div className="sm:col-span-2"><Field label="Excerpt"><textarea rows={3} maxLength={400} value={editing.excerpt} onChange={(event) => updatePost(activeIndex, { excerpt: event.target.value })} /></Field></div></div></section>

        <section className="border-t border-[#f0e9e5] pt-5"><h3 className="text-sm font-semibold text-[#403936]">Cover image</h3><div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1.3fr]"><div><Field label="Upload JPG, PNG or WebP (up to 2 MB)"><input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => void uploadCover(event.target.files?.[0])} /></Field><p className="mt-2 text-xs text-[#958b86]">{uploading ? "Uploading cover…" : "You can also paste an image path or HTTPS URL."}</p></div><Field label="Image path or HTTPS URL"><input maxLength={3000000} value={editing.image} onChange={(event) => updatePost(activeIndex, { image: event.target.value })} placeholder="/uploads/editorial.jpg" /></Field></div>{editing.image && <img src={editing.image} alt="Cover preview" className="mt-4 max-h-72 w-full rounded-lg bg-[#faf8f6] object-contain" />}<div className="mt-4 max-w-xl"><Field label="Image alt text"><input maxLength={250} value={editing.imageAlt} onChange={(event) => updatePost(activeIndex, { imageAlt: event.target.value })} /></Field></div></section>

        <section className="border-t border-[#f0e9e5] pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-[#403936]">Article body</h3><p className="mt-1 text-xs text-[#958b86]">Add section headings and paragraphs. Separate paragraphs with a blank line.</p></div><button type="button" onClick={() => updatePost(activeIndex, { sections: [...editing.sections, { title: "", body: [""] }] })} className="h-9 rounded-lg border border-[#ded6d1] px-3 text-xs font-medium text-[#625954]">Add section</button></div><div className="mt-4 space-y-4">{editing.sections.map((section, sectionIndex) => <div key={sectionIndex} className="rounded-lg border border-[#eee6e1] bg-[#fcfaf9] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-[#8c6b60]">Section {sectionIndex + 1}</p>{editing.sections.length > 1 && <button type="button" onClick={() => updatePost(activeIndex, { sections: editing.sections.filter((_, index) => index !== sectionIndex) })} className="text-xs text-rose-700">Remove</button>}</div><div className="mt-3 space-y-3"><Field label="Section heading"><input maxLength={160} value={section.title} onChange={(event) => updateSection(activeIndex, sectionIndex, { title: event.target.value })} /></Field><Field label="Paragraphs"><textarea rows={6} maxLength={30000} value={section.body.join("\n\n")} onChange={(event) => updateSection(activeIndex, sectionIndex, { body: event.target.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) })} placeholder="Write your article content here…" /></Field></div></div>)}</div></section>

        <section className="border-t border-[#f0e9e5] pt-5"><h3 className="text-sm font-semibold text-[#403936]">Search &amp; social SEO</h3><p className="mt-1 text-xs text-[#958b86]">These fields update the page title, description, keywords and social preview.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="SEO title (max 70)"><input maxLength={70} value={editing.seoTitle ?? ""} onChange={(event) => updatePost(activeIndex, { seoTitle: event.target.value })} placeholder={editing.title || "Article title"} /><Hint value={editing.seoTitle ?? ""} max={70} /></Field><Field label="SEO description"><textarea rows={3} maxLength={320} value={editing.seoDescription ?? ""} onChange={(event) => updatePost(activeIndex, { seoDescription: event.target.value })} placeholder={editing.excerpt || "Describe this article for search and social previews."} /><Hint value={editing.seoDescription ?? ""} max={320} /></Field><div className="sm:col-span-2"><Field label="SEO keywords (comma separated)"><input maxLength={500} value={editing.seoKeywords ?? ""} onChange={(event) => updatePost(activeIndex, { seoKeywords: event.target.value })} /></Field></div></div><label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-medium text-[#403936]"><input type="checkbox" checked={editing.published} onChange={(event) => updatePost(activeIndex, { published: event.target.checked })} className="h-4 w-4 accent-[#9b5c5c]" />Publish this article</label><p className="mt-1 pl-7 text-xs text-[#958b86]">Drafts are saved in the admin manager and excluded from the public blog and sitemap.</p></section>
      </div>
    </section>}
  </div></main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#625954]">{label}<span className="mt-2 block [&_input]:h-11 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-[#ded6d1] [&_input]:bg-white [&_input]:px-3 [&_input]:outline-none [&_input]:focus:border-[#a87567] [&_textarea]:w-full [&_textarea]:resize-y [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-[#ded6d1] [&_textarea]:bg-white [&_textarea]:p-3 [&_textarea]:outline-none [&_textarea]:focus:border-[#a87567] [&_input[type=file]]:h-auto [&_input[type=file]]:px-0 [&_input[type=file]]:py-2">{children}</span></label>;
}

function Hint({ value, max }: { value: string; max: number }) {
  return <span className="mt-1 block text-right text-[10px] text-[#a39a95]">{value.length}/{max}</span>;
}
