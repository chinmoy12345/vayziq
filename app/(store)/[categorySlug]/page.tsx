import { getStoreBranding } from "@/lib/store-branding";
import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import { notFound } from "next/navigation";
import CollectionPage from "@/components/store/CollectionPage";
import { getActiveCategory } from "@/lib/storefront";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateMetadata(props: Props) { return pageSeo("/" + (await props.params).categorySlug, await originalMetadata(props)); }
async function originalMetadata({ params }: Props): Promise<Metadata> {
  const branding = await getStoreBranding();
  const { categorySlug } = await params;
  const category = await getActiveCategory(categorySlug);
  if (!category) return { title: "Category not found", robots: { index: false, follow: false } };
  const description = (category.description?.trim() || `Shop ${category.name} at ${branding.name}. Explore the latest styles, browse the collection and find a look for every occasion.`).slice(0, 160);
  return {
    title: category.name,
    description,
    alternates: { canonical: `/${category.slug}` },
    openGraph: { title: `${category.name} | ${branding.name}`, description, type: "website", url: `/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  const category = await getActiveCategory(categorySlug);
  if (!category) notFound();
  const subtitle = category.description || `Explore our ${category.name} collection.`;
  return <CollectionPage categorySlug={category.slug} title={category.name} eyebrow={category.name.toUpperCase()} subtitle={subtitle} description={subtitle} bannerPlacement={`category:${category.slug}`} showProductFilters />;
}
