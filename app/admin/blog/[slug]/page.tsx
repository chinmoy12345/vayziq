import BlogEditor from "@/components/admin/BlogEditor";

export default async function BlogEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogEditor slug={(await params).slug} />;
}
