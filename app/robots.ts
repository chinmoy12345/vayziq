import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/cart", "/checkout", "/login", "/register", "/wishlist", "/api/"],
    },
    sitemap: "https://vayziq.com/sitemap.xml",
    host: "https://vayziq.com",
  };
}
