export type SeoEntry = { title: string; description: string; image: string; canonical: string; noindex: boolean };
export const SEO_DEFAULTS: Record<string, [string, string]> = {
  "/": ["Vayziq | Streetwear for Men, Women & Unisex", "Discover Vayziq streetwear for men, women and everyone. Shop oversized tees, hoodies, joggers and everyday essentials. Find your next fit."],
  "/shop": ["Shop Streetwear | Vayziq", "Explore men's, women's and unisex streetwear at Vayziq. Discover oversized T-shirts, hoodies, joggers and everyday essentials."],
  "/categories": ["Streetwear Collections | Vayziq", "Find your fit. Explore men's, women's and unisex clothing collections at Vayziq."],
  "/offers": ["Streetwear Deals & Offers | Vayziq", "Discover current Vayziq offers on eligible streetwear styles. Explore the collections and check each offer's conditions."],
  "/watch-buy": ["Watch & Buy Streetwear | Vayziq", "See Vayziq streetwear in motion. Watch the looks and shop the featured clothing and collections."],
  "/blog": ["Streetwear Style Journal | Vayziq", "Explore streetwear styling ideas, outfit inspiration and clothing care for men's, women's and unisex wardrobes."],
  "/about": ["About Vayziq | Everyday Streetwear", "Meet Vayziq, a streetwear clothing brand for men, women and unisex everyday style."],
  "/contact": ["Contact Vayziq", "Contact Vayziq for help with orders, products and your shopping experience."],
  "/shipping": ["Shipping & Delivery | Vayziq", "Read Vayziq's shipping and delivery information before placing your order."],
  "/returns": ["Returns & Exchanges | Vayziq", "Review Vayziq's returns and exchange policy, eligibility and how to request help."],
  "/privacy": ["Privacy Policy | Vayziq", "Learn how Vayziq handles your information and protects your privacy."],
  ...Object.fromEntries(["search", "cart", "checkout", "wishlist", "login", "register", "account", "account/profile", "account/addresses", "account/orders", "account/wishlist"].map(path => [`/${path}`, [path.split("/").at(-1)!.replace(/^./, c => c.toUpperCase()) + " | Vayziq", "Manage your Vayziq shopping experience."]])),
};
export const protectedSeoPath = (path: string) => /^\/(admin|api|account|cart|checkout|wishlist|login|register|search)(\/|$)/.test(path);
export function validateSeo(path: unknown, value: unknown): { path: string; entry: SeoEntry } {
  if (typeof path !== "string" || !/^\/(?:[A-Za-z0-9_%-]+\/?)*$/.test(path) || path.length > 500 || /^\/(admin|api)(\/|$)/.test(path)) throw new Error("Choose a valid storefront page path.");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid SEO settings.");
  const row = value as Record<string, unknown>;
  const entry = {} as SeoEntry;
  for (const [key, max] of [["title", 100], ["description", 320], ["image", 2000], ["canonical", 2000]] as const) {
    if (typeof row[key] !== "string" || row[key].length > max) throw new Error(`${key} must be text with at most ${max} characters.`);
    entry[key] = row[key].trim();
  }
  for (const key of ["image", "canonical"] as const) {
    const url = entry[key];
    if (!url) continue;
    if (/[\s\\\x00-\x1f]/.test(url) || (!url.startsWith("/") && !url.startsWith("https://")) || url.startsWith("//")) throw new Error(`${key} must be a site path or HTTPS URL.`);
    const parsed = new URL(url, "https://vayziq.com");
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error(`Invalid ${key} URL.`);
  }
  if (typeof row.noindex !== "boolean") throw new Error("Select an indexing preference.");
  entry.noindex = protectedSeoPath(path) || row.noindex;
  return { path: path === "/" ? path : path.replace(/\/$/, ""), entry };
}
