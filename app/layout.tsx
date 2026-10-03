import { getStoreBranding } from "@/lib/store-branding";
import { StoreBrandingProvider } from "@/components/StoreBranding";
import type { Metadata, Viewport } from "next";
import { pageSeo, SITE_URL } from "@/lib/seo";
export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  return { ...(await pageSeo("/")), metadataBase: new URL(SITE_URL), applicationName: "Vayziq",
    icons: { icon: "/vayziq/vayziq-app-icon.svg", shortcut: "/vayziq/vayziq-app-icon.svg", apple: "/vayziq/vayziq-app-192.png" } };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getStoreBranding();
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: branding.name, url: "https://vayziq.com", description: "Streetwear for men, women and unisex everyday style.", potentialAction: { "@type": "SearchAction", target: "https://vayziq.com/search?q={search_term_string}", "query-input": "required name=search_term_string" } }).replace(/</g, "\\u003c") }} />
        <StoreBrandingProvider branding={branding}>{children}</StoreBrandingProvider>
      </body>
    </html>
  );
}
