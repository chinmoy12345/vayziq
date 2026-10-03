import { pageSeo } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> { return pageSeo("/login"); }

export default function PrivatePageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
