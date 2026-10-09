"use client";

import { ChangeEvent, useEffect, useState } from "react";
import type { SocialLinks, SocialPlatform } from "@/lib/social-links";
import { DEFAULT_HEADER_UTILITY, type HeaderUtilitySettings } from "@/lib/header-utility-types";

type SettingsTab =
  | "store"
  | "contact"
  | "orders"
  | "social"
  | "utility"
  | "system";

function StoreIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3 10h18" />
      <path d="M5 10v10h14V10" />
      <path d="M4 10 6 4h12l2 6" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6.5 3.5h3l1.5 4-2 1.5a16 16 0 0 0 6 6l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.5 19.5 4.5 13.5 4.5 6c0-1.1.9-2.5 2-2.5Z" />
    </svg>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8.1 15a1.7 1.7 0 0 0-1.6-1H6v-2.5h.5a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5H15v.5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.5V14h-.5a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 3h12l2 2v16H5V3Z" />
      <path d="M8 3v6h8V3M8 21v-7h8v7" />
    </svg>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] =
    useState<SettingsTab>("store");

  const [storeName, setStoreName] = useState(
    "Tantuka"
  );

  const [storeLogo, setStoreLogo] = useState("/uploads/branding/tantuka-wordmark-classic.png");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hours, setHours] = useState("24*7");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [tagline, setTagline] = useState(
    "Sarees • Kurtis • Nightwear"
  );

  const [description, setDescription] = useState(
    "Discover elegant sarees, stylish kurtis and comfortable nightwear for every occasion."
  );

  const [email, setEmail] = useState("hello.vayziq@gmail.com");
  const [phone, setPhone] = useState("+91 9330755055");
  const [whatsapp, setWhatsapp] = useState("+91 9330755055");

  const [address, setAddress] = useState(
    "Mumbai"
  );

  const [pincode, setPincode] = useState("");

  useEffect(() => {
    void fetch("/api/admin/store-branding", { cache: "no-store" })
      .then(async (response) => ({ response, body: await response.json() as { data?: { name?: string; logo?: string; email: string; phone: string; whatsapp: string; hours: string; address: string; pincode: string } } }))
      .then(({ response, body }) => {
        if (!response.ok || !body.data) throw new Error("Unable to load settings");
        setEmail(body.data.email);
        setPhone(body.data.phone);
        setWhatsapp(body.data.whatsapp);
        setHours(body.data.hours);
        setAddress(body.data.address);
        setPincode(body.data.pincode);
        setIsLoaded(true);
        setStoreName(body.data.name || "Tantuka");
        setStoreLogo(body.data.logo || "/uploads/branding/tantuka-wordmark-classic.png");
      })
      .catch(() => setStatusMessage("Brand settings could not be loaded. Please try again."));
  }, []);

  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ facebook: { url: "", visible: false }, instagram: { url: "", visible: false }, youtube: { url: "", visible: false } });
  const [headerUtility, setHeaderUtility] = useState<HeaderUtilitySettings>(DEFAULT_HEADER_UTILITY);
  const [utilityLoaded, setUtilityLoaded] = useState(false);
  useEffect(() => {
    void fetch("/api/admin/header-utility", { cache: "no-store" })
      .then(async response => { const body = await response.json(); if (!response.ok || !body.data) throw new Error(body.message); return body.data as HeaderUtilitySettings; })
      .then(data => { setHeaderUtility(data); setUtilityLoaded(true); })
      .catch(() => setStatusMessage("Header utility settings could not be loaded."));
  }, []);
  const updateHeaderLink = (key: "trackOrder" | "help", value: Partial<HeaderUtilitySettings["trackOrder"]>) => setHeaderUtility(current => ({ ...current, [key]: { ...current[key], ...value } }));
  async function saveHeaderUtility() {
    if (!utilityLoaded) return;
    setIsSaving(true); setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/header-utility", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(headerUtility) });
      const body = await response.json() as { data?: HeaderUtilitySettings; message?: string };
      if (!response.ok || !body.data) throw new Error(body.message || "Unable to save header utility links.");
      setHeaderUtility(body.data); setStatusMessage("Header utility links saved.");
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : "Unable to save header utility links."); }
    finally { setIsSaving(false); }
  }
  const [socialLoaded, setSocialLoaded] = useState(false);
  useEffect(() => {
    void fetch("/api/admin/social-links", { cache: "no-store" })
      .then(async response => { const body = await response.json(); if (!response.ok) throw new Error(body.message); return body.data as SocialLinks; })
      .then(data => { setSocialLinks(data); setSocialLoaded(true); })
      .catch(() => setStatusMessage("Social links could not be loaded. Please try again."));
  }, []);
  const updateSocial = (platform: SocialPlatform, value: Partial<SocialLinks[SocialPlatform]>) => setSocialLinks(current => ({ ...current, [platform]: { ...current[platform], ...value } }));
  async function saveSocial() {
    if (!socialLoaded) return;
    setIsSaving(true); setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/social-links", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(socialLinks) });
      const body = await response.json() as { data?: SocialLinks; message?: string };
      if (!response.ok || !body.data) throw new Error(body.message || "Unable to save social links.");
      setSocialLinks(body.data);
      setStatusMessage("Footer social links saved.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save social links.");
    } finally {
      setIsSaving(false);
    }
  }

  const [currency, setCurrency] = useState("INR");

  const [taxRate, setTaxRate] = useState("5");

  const [shippingCharge, setShippingCharge] = useState("79");

  const [freeShippingAmount, setFreeShippingAmount] =
    useState("999");

  const [minimumOrder, setMinimumOrder] = useState("499");
  const [minimumQuantity, setMinimumQuantity] = useState("1");
  const [maximumQuantity, setMaximumQuantity] = useState("10");
  const [quantitySaving, setQuantitySaving] = useState(false);
  useEffect(() => {
    void fetch("/api/admin/quantity-limits", { cache: "no-store" })
      .then(response => response.json())
      .then(body => { if (body.data) { setMinimumQuantity(String(body.data.min)); setMaximumQuantity(String(body.data.max)); } });
  }, []);
  async function saveQuantityLimits() {
    setQuantitySaving(true); setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/quantity-limits", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ min: Number(minimumQuantity), max: Number(maximumQuantity) }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Unable to save quantity limits.");
      setStatusMessage("Global product quantity limits saved.");
    } catch (error) { setStatusMessage(error instanceof Error ? error.message : "Unable to save quantity limits."); }
    finally { setQuantitySaving(false); }
  }

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [allowReviews, setAllowReviews] = useState(true);

  const [guestCheckout, setGuestCheckout] = useState(true);

  const [notifyNewOrder, setNotifyNewOrder] = useState(true);

  const [notifyNewReview, setNotifyNewReview] = useState(true);
  const [notificationLoaded, setNotificationLoaded] = useState(false);
  useEffect(() => {
    void fetch("/api/admin/notification-preferences", { cache: "no-store" })
      .then(async response => { const body = await response.json(); if (!response.ok || !body.data) throw new Error(body.message); return body.data as { orders: boolean; reviews: boolean }; })
      .then(data => { setNotifyNewOrder(data.orders); setNotifyNewReview(data.reviews); setNotificationLoaded(true); })
      .catch(() => setStatusMessage("Notification preferences could not be loaded."));
  }, []);
  async function saveNotificationPreferences() {
    if (!notificationLoaded) return;
    setIsSaving(true); setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/notification-preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orders: notifyNewOrder, reviews: notifyNewReview }) });
      const body = await response.json() as { message?: string };
      if (!response.ok) throw new Error(body.message || "Unable to save notifications.");
      setStatusMessage("Admin notification preferences saved.");
    } catch (reason) { setStatusMessage(reason instanceof Error ? reason.message : "Unable to save notifications."); }
    finally { setIsSaving(false); }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatusMessage(null);
    const uploadData = new FormData();
    uploadData.append("file", file);
    try {
      const response = await fetch("/api/admin/store-branding/upload", { method: "POST", body: uploadData });
      const body = await response.json() as { image?: string; message?: string };
      if (!response.ok || !body.image) throw new Error(body.message || "Upload failed.");
      setStoreLogo(body.image);
      setStatusMessage("Logo uploaded. Click Save Changes to publish it.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Logo upload failed.");
    } finally {
      event.target.value = "";
    }
  }

  async function handleSave() {
    if (!isLoaded) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/admin/store-branding", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: storeName, logo: storeLogo, email, phone, whatsapp, hours, address, pincode }) });
      const body = await response.json() as { message?: string };
      if (!response.ok) throw new Error(body.message || "Unable to save settings.");
      setStatusMessage("Store name and contact details saved across the site.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  const tabs = [
    {
      id: "store" as SettingsTab,
      label: "Store Information",
      icon: <StoreIcon />,
    },
    {
      id: "contact" as SettingsTab,
      label: "Contact & Address",
      icon: <PhoneIcon />,
    },
    {
      id: "orders" as SettingsTab,
      label: "Order Settings",
      icon: <ShoppingBagIcon />,
    },
    {
      id: "social" as SettingsTab,
      label: "Social Links",
      icon: <GlobeIcon />,
    },
    {
      id: "utility" as SettingsTab,
      label: "Header Utility Links",
      icon: <GlobeIcon />,
    },
    {
      id: "system" as SettingsTab,
      label: "System Settings",
      icon: <SettingsIcon />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] px-5 py-7 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#292321]">
              Settings
            </h1>

            <p className="mt-1 text-sm text-[#958b86]">
              Manage your store configuration and preferences.
            </p>
          </div>

          <button
            type="button"
            disabled={isSaving || (activeTab === "social" ? !socialLoaded : activeTab === "utility" ? !utilityLoaded : activeTab === "orders" ? !notificationLoaded : !isLoaded)}
            onClick={activeTab === "social" ? saveSocial : activeTab === "utility" ? saveHeaderUtility : activeTab === "orders" ? saveNotificationPreferences : handleSave}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white transition hover:bg-[#403936]"
          >
            <SaveIcon />
            {isSaving ? "Saving…" : activeTab === "social" ? "Save Social Links" : activeTab === "utility" ? "Save Header Links" : activeTab === "orders" ? "Save Notifications" : "Save Branding"}
          </button>
        </div>

        {statusMessage && (
          <p className="mb-5 rounded-lg border border-[#e7d3cb] bg-[#fff8f5] px-4 py-3 text-sm text-[#7d5e57]" role="status">
            {statusMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside>
            <div className="overflow-hidden rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
              <div className="border-b border-[#eee6e1] px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#958b86]">
                  Settings
                </p>
              </div>

              <nav className="p-2">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                        active
                          ? "bg-[#f4ece8] text-[#7d5e57]"
                          : "text-[#655b56] hover:bg-[#faf8f6] hover:text-[#292321]"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0">
            {/* Store Information */}
            {activeTab === "store" && (
              <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#292321]">
                    Store Information
                  </h2>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Basic information displayed across your storefront.
                  </p>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Store Name
                    </label>

                    <input
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">Header & Footer Logo</label>
                    <label className="flex h-11 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#c7aaa0] bg-[#fffaf8] px-3 text-sm font-medium text-[#7d5e57] transition hover:bg-[#f8eeea]">
                      Upload logo (PNG, JPG or WEBP)
                      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="sr-only" />
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex min-h-24 items-center rounded-lg border border-[#eee6e1] bg-[#2b2525] p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={storeLogo} alt={`${storeName || "Store"} logo preview`} className="max-h-20 max-w-[240px] object-contain brightness-0 invert" />
                    </div>
                    <p className="mt-2 text-xs text-[#958b86]">This logo is used across the storefront header and footer.</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Tagline
                    </label>

                    <input
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Store Description
                    </label>

                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      className="w-full resize-none rounded-lg border border-[#ddd4cf] px-3.5 py-3 text-sm leading-6 outline-none focus:border-[#a9837a] focus:ring-2 focus:ring-[#b56f6f]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Currency
                    </label>

                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] bg-white px-3 text-sm outline-none focus:border-[#a9837a]"
                    >
                      <option value="INR">
                        INR — Indian Rupee (₹)
                      </option>

                      <option value="USD">
                        USD — US Dollar ($)
                      </option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* Contact */}
            {activeTab === "contact" && (
              <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#292321]">
                    Contact & Address
                  </h2>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Customer support and store location details.
                  </p>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      WhatsApp Number
                    </label>

                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      PIN Code
                    </label>

                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="opening-hours" className="mb-2 block text-sm font-medium text-[#403936]">Opening Hours</label>
                    <input id="opening-hours" value={hours} onChange={(e) => setHours(e.target.value)} className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Store Address
                    </label>

                    <textarea
                      rows={4}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full resize-none rounded-lg border border-[#ddd4cf] px-3.5 py-3 text-sm leading-6 outline-none focus:border-[#a9837a]"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Orders */}
            {activeTab === "orders" && (
              <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#292321]">
                    Order Settings
                  </h2>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Configure pricing, shipping and checkout options.
                  </p>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="sm:col-span-2 rounded-xl border border-[#eee6e1] p-4">
                    <h3 className="text-sm font-semibold text-[#292321]">Global quantity per product</h3>
                    <p className="mt-1 text-xs text-[#958b86]">Default limits for each product in a customer’s bag. Product-specific limits override these values.</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="text-sm">Minimum quantity<input aria-label="Global minimum quantity" type="number" min="1" max="1000" value={minimumQuantity} onChange={event => setMinimumQuantity(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-[#ddd4cf] px-3" /></label>
                      <label className="text-sm">Maximum quantity<input aria-label="Global maximum quantity" type="number" min="1" max="1000" value={maximumQuantity} onChange={event => setMaximumQuantity(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-[#ddd4cf] px-3" /></label>
                    </div>
                    <button type="button" disabled={quantitySaving} onClick={saveQuantityLimits} className="mt-4 rounded-lg bg-[#292321] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{quantitySaving ? "Saving…" : "Save quantity limits"}</button>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Tax Rate (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Shipping Charge (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={shippingCharge}
                      onChange={(e) =>
                        setShippingCharge(e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Free Shipping Above (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={freeShippingAmount}
                      onChange={(e) =>
                        setFreeShippingAmount(e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#403936]">
                      Minimum Order Value (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={minimumOrder}
                      onChange={(e) =>
                        setMinimumOrder(e.target.value)
                      }
                      className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Toggle
                      label="Guest Checkout"
                      description="Allow customers to place orders without creating an account."
                      checked={guestCheckout}
                      onChange={setGuestCheckout}
                    />

                    <Toggle
                      label="Allow Product Reviews"
                      description="Allow customers to submit reviews for purchased products."
                      checked={allowReviews}
                      onChange={setAllowReviews}
                    />

                    <Toggle
                      label="New Order Notification"
                      description="Receive a notification whenever a new order is placed."
                      checked={notifyNewOrder}
                      onChange={setNotifyNewOrder}
                    />

                    <Toggle
                      label="New Review Notification"
                      description="Receive a notification whenever a customer submits a review."
                      checked={notifyNewReview}
                      onChange={setNotifyNewReview}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === "utility" && (
              <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#292321]">Header Utility Links</h2>
                  <p className="mt-1 text-xs text-[#958b86]">Manage the links on the right side of the desktop announcement bar.</p>
                </div>
                <div className="space-y-5 p-5 sm:p-6">
                  {(["trackOrder", "help"] as const).map(key => (
                    <div key={key} className="rounded-xl border border-[#eee6e1] p-4">
                      <label className="flex items-center gap-2 text-sm font-semibold text-[#292321]"><input type="checkbox" checked={headerUtility[key].visible} onChange={event => updateHeaderLink(key, { visible: event.target.checked })} />Show {key === "trackOrder" ? "Track Order" : "Help"}</label>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-[#403936]">Display text<input type="text" maxLength={32} value={headerUtility[key].label} onChange={event => updateHeaderLink(key, { label: event.target.value })} className="mt-1 h-11 w-full rounded-lg border border-[#ddd4cf] px-3" /></label>
                        <label className="text-sm text-[#403936]">Destination path<input type="text" maxLength={200} value={headerUtility[key].href} onChange={event => updateHeaderLink(key, { href: event.target.value })} placeholder="/contact" className="mt-1 h-11 w-full rounded-lg border border-[#ddd4cf] px-3" /></label>
                      </div>
                    </div>
                  ))}
                  <label className="flex items-start gap-3 rounded-xl border border-[#eee6e1] p-4 text-sm text-[#403936]"><input type="checkbox" className="mt-1" checked={headerUtility.currency.visible} onChange={event => setHeaderUtility(current => ({ ...current, currency: { visible: event.target.checked } }))} /><span><b className="block text-[#292321]">Show 🇮🇳 INR indicator</b><small className="mt-1 block text-[#958b86]">Store prices and checkout remain in INR. This is a display indicator, not a currency switcher.</small></span></label>
                </div>
              </section>
            )}

            {/* Social */}
            {activeTab === "social" && (
              <section className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                  <h2 className="text-base font-semibold text-[#292321]">
                    Social Links
                  </h2>

                  <p className="mt-1 text-xs text-[#958b86]">
                    Add your social profiles and choose which ones appear in the footer.
                  </p>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {(["facebook", "instagram", "youtube"] as const).map(platform => (
                    <div key={platform} className="rounded-xl border border-[#eee6e1] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label htmlFor={`social-${platform}`} className="text-sm font-medium capitalize text-[#403936]">{platform === "youtube" ? "YouTube" : platform}</label>
                        <label className="flex items-center gap-2 text-xs font-medium text-[#655b56]"><input type="checkbox" checked={socialLinks[platform].visible} onChange={event => updateSocial(platform, { visible: event.target.checked })} />Show in footer</label>
                      </div>
                      <input id={`social-${platform}`} type="url" value={socialLinks[platform].url} onChange={event => updateSocial(platform, { url: event.target.value })} placeholder={`https://${platform}.com/your-profile`} className="h-11 w-full rounded-lg border border-[#ddd4cf] px-3.5 text-sm outline-none focus:border-[#a9837a]" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* System */}
            {activeTab === "system" && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                  <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-[#292321]">
                      System Settings
                    </h2>

                    <p className="mt-1 text-xs text-[#958b86]">
                      Website availability and system preferences.
                    </p>
                  </div>

                  <div className="p-5 sm:p-6">
                    <Toggle
                      label="Maintenance Mode"
                      description="Temporarily disable the storefront while making major changes."
                      checked={maintenanceMode}
                      onChange={setMaintenanceMode}
                      danger
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#eee6e1] bg-white shadow-sm">
                  <div className="border-b border-[#eee6e1] px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-[#292321]">
                      Store Status
                    </h2>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div
                      className={`flex items-center justify-between rounded-xl border p-4 ${
                        maintenanceMode
                          ? "border-amber-200 bg-amber-50"
                          : "border-emerald-200 bg-emerald-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            maintenanceMode
                              ? "text-amber-800"
                              : "text-emerald-800"
                          }`}
                        >
                          {maintenanceMode
                            ? "Store is in Maintenance Mode"
                            : "Store is Live"}
                        </p>

                        <p
                          className={`mt-1 text-xs ${
                            maintenanceMode
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {maintenanceMode
                            ? "Customers cannot access the storefront."
                            : "Customers can browse and place orders normally."}
                        </p>
                      </div>

                      <span
                        className={`h-3 w-3 rounded-full ${
                          maintenanceMode
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Mobile Save */}
            <div className="mt-6 lg:hidden">
              <button
                type="button"
                onClick={activeTab === "social" ? saveSocial : activeTab === "utility" ? saveHeaderUtility : activeTab === "orders" ? saveNotificationPreferences : handleSave}
                disabled={isSaving || (activeTab === "social" ? !socialLoaded : activeTab === "utility" ? !utilityLoaded : activeTab === "orders" ? !notificationLoaded : !isLoaded)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#292321] px-5 text-sm font-medium text-white hover:bg-[#403936]"
              >
                <SaveIcon />
                {activeTab === "social" ? "Save Social Links" : activeTab === "utility" ? "Save Header Links" : activeTab === "orders" ? "Save Notifications" : "Save Changes"}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  danger = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#eee6e1] py-4 last:border-b-0">
      <div className="min-w-0">
        <p
          className={`text-sm font-medium ${
            danger ? "text-red-700" : "text-[#403936]"
          }`}
        >
          {label}
        </p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-[#958b86]">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? danger
              ? "bg-red-600"
              : "bg-[#292321]"
            : "bg-[#d9d1cc]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
