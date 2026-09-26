import { getStoreBranding } from "@/lib/store-branding";
import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getStoreBranding();
  return {
    name: `${branding.name} — Women’s Ethnic Wear`, short_name: `${branding.name}`, description: `Shop sarees, kurtis and nightwear at ${branding.name}.`,
    start_url: "/", scope: "/", display: "standalone", background_color: "#fffdfc", theme_color: "#2b2525",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/android-chrome-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
