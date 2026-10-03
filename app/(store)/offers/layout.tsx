import { pageSeo } from "@/lib/seo";
export async function generateMetadata() { return pageSeo("/offers"); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
