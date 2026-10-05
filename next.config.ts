import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    // Legacy Tantuka icon routes are still cached by browsers and Android shortcuts.
    // Serve Vayziq's permanent assets for every old entry point.
    return [
      { source: "/favicon.ico", destination: "/vayziq/vayziq-app-icon.svg", permanent: true },
      { source: "/icon.png", destination: "/vayziq/vayziq-app-512.png", permanent: true },
      { source: "/apple-icon.png", destination: "/vayziq/vayziq-app-192.png", permanent: true },
    ];
  },
};

export default nextConfig;
