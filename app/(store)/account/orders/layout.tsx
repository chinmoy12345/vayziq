import { pageSeo } from "@/lib/seo";
export async function generateMetadata() { return pageSeo("/account/orders"); }
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
