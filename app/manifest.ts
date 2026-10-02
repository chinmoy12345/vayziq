import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    name: "Vayziq — Everyday Wear", short_name: "Vayziq", description: "Discover everyday fashion at Vayziq.",
    id: "/", start_url: "/", scope: "/", display: "standalone", background_color: "#ffffff", theme_color: "#ffffff",
    icons: [
      { src: "/vayziq/vayziq-app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/vayziq/vayziq-app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/vayziq/vayziq-app-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
