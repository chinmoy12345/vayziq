import { getStoreBranding } from "@/lib/store-branding";
import { StoreBrandingProvider } from "@/components/StoreBranding";
import type { Metadata } from "next";
import "./globals.css";
export async function generateMetadata(): Promise<Metadata> {
  const branding = await getStoreBranding();
  return {
  metadataBase: new URL("https://tantuka.in"),
  icons: { icon: "/vayziq/favicon.svg", shortcut: "/vayziq/favicon.svg", apple: "/vayziq/favicon.svg" },
  applicationName: `${branding.name}`,
  title: { default: "Women's Ethnic Wear Online", template: `%s | ${branding.name}` },
  description: `Shop women's sarees, kurtis and nightwear online at ${branding.name}. Discover thoughtful styles, new arrivals and everyday elegance, with delivery across India.`,
  openGraph: { type: "website", siteName: `${branding.name}`, locale: "en_IN", title: `Women's Ethnic Wear Online | ${branding.name}`, description: `Shop women's sarees, kurtis and nightwear online at ${branding.name}. Discover thoughtful styles and new arrivals, with delivery across India.`, images: [{ url: "/logo.png", alt: `${branding.name} women's fashion` }] },
  twitter: { card: "summary", title: `Women's Ethnic Wear Online | ${branding.name}`, description: `Shop sarees, kurtis and nightwear online at ${branding.name}.` },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  other: { "msapplication-config": "/browserconfig.xml" },
};
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: branding.name, url: "https://tantuka.in", description: "Women's sarees, kurtis and nightwear online.", potentialAction: { "@type": "SearchAction", target: "https://tantuka.in/search?q={search_term_string}", "query-input": "required name=search_term_string" } }).replace(/</g, "\\u003c") }} />
        <StoreBrandingProvider branding={branding}>{children}</StoreBrandingProvider>
      </body>
    </html>
  );
}
