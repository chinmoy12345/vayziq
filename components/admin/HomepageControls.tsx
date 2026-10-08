"use client";

import { useEffect, useState } from "react";
import { HOMEPAGE_VISIBILITY_DEFAULTS, type HomepageVisibility } from "@/lib/homepage-settings";
import StorefrontMenuControls from "@/components/admin/StorefrontMenuControls";

type SettingKey = keyof HomepageVisibility;

const sectionSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "heroSlider", label: "Top full-width slider", description: "Show the large rotating banner above the campaign cards." },
  { key: "campaignBanners", label: "Campaign banners", description: "Show the existing banner cards below the main slider." },
  { key: "bestSellers", label: "Best Sellers", description: "Show the Best Sellers product carousel." },
  { key: "newArrivals", label: "New arrivals", description: "Show the latest products section." },
  { key: "ourCatalog", label: "Our Catalog", description: "Show all active products in the launch catalog section." },
  { key: "featuredCollection", label: "The Collection", description: "Show the collection image carousel." },
  { key: "youMayLike", label: "You May Like", description: "Show the recommended product carousel." },
  { key: "watchAndBuy", label: "Watch & Buy", description: "Show the video shopping section." },
  { key: "offerZone", label: "Offer banner", description: "Show the home page offer banner." },
  { key: "journal", label: "From the Journal", description: "Show the latest blog stories." },
];

const optionalHomeSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "trendingNow", label: "Trending Now", description: "Show the Trending Now product section on the homepage." },
  { key: "trendingCategories", label: "Trending Categories", description: "Show the Men's Edit and Women's Edit category section on the homepage." },
  { key: "shopByMood", label: "Shop by Mood", description: "Show the Shop by Mood section on the homepage." },
  { key: "trustBenefits", label: "Shopping benefits", description: "Show the shipping, returns, quality and payment reassurance strip on the homepage." },
];

const footerSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "footerNewsletter", label: "Footer newsletter", description: "Show the email signup area at the top of the footer." },
  { key: "footerBrand", label: "Footer social links", description: "Show configured Facebook, Instagram and YouTube links." },
  { key: "footerShopLinks", label: "Footer categories", description: "Show Men, Women and their active subcategories." },
  { key: "footerInformationLinks", label: "Footer information links", description: "Show the Shop, About, Contact and policy links." },
  { key: "footerBottomBar", label: "Footer bottom bar", description: "Show copyright and its optional links." },
];

const cardSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "productCardRating", label: "Product Card Rating", description: "Show approved review scores and review counts on product cards." },
  { key: "productCardCarousel", label: "Product Card Carousel", description: "Allow shoppers to browse product images from listing cards." },
];

const cartPageSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "cartPageHeader", label: "Cart page heading", description: "Show the Your Bag heading, title and intro text." },
  { key: "cartItemCount", label: "Cart item count", description: "Show the total item quantity above the cart list." },
  { key: "cartClearButton", label: "Clear cart button", description: "Allow shoppers to clear all items at once." },
  { key: "cartSaveForLater", label: "Save for later action", description: "Show the save-to-wishlist action on each cart item." },
  { key: "cartOffers", label: "Offers and discounts", description: "Show offer selection and applied discount in the order summary." },
  { key: "cartShippingMessage", label: "Free shipping message", description: "Show the amount needed for free shipping or the qualifying message." },
  { key: "cartTrustBenefits", label: "Checkout reassurance", description: "Show secure checkout, easy returns and quality assured notes." },
];

const productDetailSettings: { key: SettingKey; label: string; description: string }[] = [
  { key: "productDetailRating", label: "Product Details Rating", description: "Show the review score near the product title." },
  { key: "productDetailOffers", label: "Product offers", description: "Show available offers below the product price." },
  { key: "productDetailVideo", label: "Product Details Video", description: "Show the product video when one is available." },
  { key: "productDetailDelivery", label: "Delivery & care information", description: "Show shipping, returns and replacement information." },
  { key: "productDetailDescription", label: "Product details and highlights", description: "Show the product description, facts and highlights." },
  { key: "productDetailReviews", label: "Product reviews", description: "Show the review list and review form on product pages." },
  { key: "productDetailRelated", label: "You may also like", description: "Show related products below product details." },
];

const defaults: HomepageVisibility = { ...HOMEPAGE_VISIBILITY_DEFAULTS };

export default function HomepageControls() {
  const [settings, setSettings] = useState<HomepageVisibility>(defaults);
  // Start with the same state on server and client to avoid a hydration mismatch.
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/homepage-settings", { cache: "no-store" }).then(async response => {
      const body = await response.json() as { data?: HomepageVisibility; message?: string };
      if (!response.ok) throw new Error(body.message || "Homepage settings could not be loaded.");
      if (active && body.data) setSettings({ ...defaults, ...body.data });
    }).catch(error => { if (active) setMessage(error instanceof Error ? error.message : "Homepage settings could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/homepage-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: settings }) });
      const body = await response.json() as { data?: HomepageVisibility; message?: string };
      if (!response.ok) throw new Error(body.message || "Homepage settings could not be saved.");
      if (body.data) setSettings({ ...defaults, ...body.data });
      setMessage(settings.maintenanceMode ? "Settings saved. The public storefront is in maintenance mode." : "Settings saved. The public storefront is live.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Homepage settings could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  function rows(items: { key: SettingKey; label: string; description: string }[]) {
    return items.map(item => <label key={item.key} className="flex cursor-pointer items-center justify-between gap-4 border-b border-[#f0e9e5] px-5 py-4 last:border-0 sm:px-6">
      <span><span className="block text-sm font-medium text-[#292321]">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#857974]">{item.description}</span></span>
      <input type="checkbox" role="switch" checked={settings[item.key]} disabled={loading || saving} onChange={event => setSettings(current => ({ ...current, [item.key]: event.target.checked }))} className="h-5 w-9 shrink-0 cursor-pointer accent-[#9b5c5c] disabled:cursor-wait" aria-label={`Show ${item.label}`} />
    </label>);
  }

  return <main className="min-h-[calc(100vh-72px)] bg-[#faf8f6] p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-4xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a87567]">Storefront</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#292321]">Storefront controls</h1><p className="mt-2 text-sm text-[#857974]">Manage visible storefront sections, cart options, product features and footer content.</p></div><button type="button" onClick={() => void save()} disabled={loading || saving} className="inline-flex min-h-11 items-center rounded-lg bg-[#292321] px-5 text-sm font-medium text-white hover:bg-[#403936] disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div>
    {message && <p role="status" className="mt-5 rounded-lg border border-[#e7d3cb] bg-[#fff8f5] px-4 py-3 text-sm text-[#7d5e57]">{message}</p>}
    <section className="mt-7 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Storefront availability</h2><p className="mt-1 text-xs text-[#958b86]">Maintenance mode is on by default. The admin panel stays available.</p></div><label className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 sm:px-6"><span><span className="block text-sm font-medium text-[#292321]">Maintenance mode</span><span className="mt-1 block text-xs leading-5 text-[#857974]">When on, visitors see the maintenance page instead of the store. Turn it off and save to launch the storefront.</span></span><input type="checkbox" role="switch" checked={settings.maintenanceMode} disabled={loading || saving} onChange={event => setSettings(current => ({ ...current, maintenanceMode: event.target.checked }))} className="h-5 w-9 shrink-0 cursor-pointer accent-[#9b5c5c] disabled:cursor-wait" aria-label="Maintenance mode" /></label></section>
    <section className="mt-7 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Homepage sections</h2><p className="mt-1 text-xs text-[#958b86]">Hidden sections are removed from the homepage.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(sectionSettings)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Optional home page sections</h2><p className="mt-1 text-xs text-[#958b86]">These sections are hidden by default and affect only the home page.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(optionalHomeSettings)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Product card features</h2><p className="mt-1 text-xs text-[#958b86]">These settings apply to product cards across the storefront.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(cardSettings)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Cart page</h2><p className="mt-1 text-xs text-[#958b86]">Choose which optional elements shoppers see on the cart page.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(cartPageSettings)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Product details page</h2><p className="mt-1 text-xs text-[#958b86]">Choose which sections appear on every product details page.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(productDetailSettings)}</section>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#eee6e1] bg-white shadow-sm"><div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6"><h2 className="font-semibold text-[#292321]">Footer</h2><p className="mt-1 text-xs text-[#958b86]">Show or hide footer areas across the storefront.</p></div>{loading ? <p className="p-6 text-sm text-[#857974]">Loading settings…</p> : rows(footerSettings)}</section>
    <StorefrontMenuControls />
  </div></main>;
}
