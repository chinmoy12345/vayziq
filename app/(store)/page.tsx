import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
import VayziqHome from "@/components/home/VayziqHome";
import { getBlogPosts } from "@/lib/blog";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getVayziqHomeData } from "@/lib/vayziq-home-data";
import { getStoreMenuSettings } from "@/lib/store-menu-settings";

export async function generateMetadata(): Promise<Metadata> { return pageSeo("/"); }

export default async function Home() {
  const [initialData, visibility, journalPosts, menuSettings] = await Promise.all([
    getVayziqHomeData(),
    getHomepageVisibility(),
    getBlogPosts(),
    getStoreMenuSettings(),
  ]);
  return <VayziqHome initialData={initialData} visibility={visibility} journalPosts={journalPosts.slice(0, 3)} menuSettings={menuSettings} />;
}
