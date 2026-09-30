import type { Metadata } from "next";
import VayziqHome from "@/components/home/VayziqHome";
import { getBlogPosts } from "@/lib/blog";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getVayziqHomeData } from "@/lib/vayziq-home-data";

export const metadata: Metadata = { title: { absolute: "VAYZIQ | Everyday wear" }, description: "Premium everyday wear. Move freely, live boldly." };

export default async function Home() {
  const [initialData, visibility, journalPosts] = await Promise.all([
    getVayziqHomeData(),
    getHomepageVisibility(),
    getBlogPosts(),
  ]);
  return <VayziqHome initialData={initialData} visibility={visibility} journalPosts={journalPosts.slice(0, 3)} />;
}
