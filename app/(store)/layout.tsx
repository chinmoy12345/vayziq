import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCardSettingsProvider } from "@/components/product/ProductCardSettings";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getStoreBranding } from "@/lib/store-branding";
import { getSocialLinks } from "@/lib/social-links";
import prisma from "@/lib/db";
import { getStoreMenuSettings } from "@/lib/store-menu-settings";
import MaintenancePage from "@/components/store/MaintenancePage";
import ChannelVisitTracker from "@/components/store/ChannelVisitTracker";
import { Suspense } from "react";
import WhatsAppFloat from "@/components/store/WhatsAppFloat";
import ShoppingChat from "@/components/store/ShoppingChat";
import { getChatbotSettings } from "@/lib/chatbot-settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const visibility = await getHomepageVisibility();
  if (visibility.maintenanceMode) {
    const branding = await getStoreBranding();
    return <MaintenancePage branding={branding} />;
  }

  const [branding, socialLinks, footerCategories, menuSettings] = await Promise.all([
    getStoreBranding(),
    getSocialLinks(),
    prisma.category.findMany({
      where: { parentId: null, status: "active", slug: { in: ["men", "women"] } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, slug: true,
        children: {
          where: { status: "active" },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    getStoreMenuSettings(),
  ]);

  return (
    <>
      <Suspense fallback={null}><ChannelVisitTracker /></Suspense>
      <Header menuSettings={menuSettings} />
      <ProductCardSettingsProvider settings={{
        productCardRating: visibility.productCardRating,
        productCardCarousel: visibility.productCardCarousel,
      }}>
        <main className="storefront-shell min-h-screen">{children}</main>
      </ProductCardSettingsProvider>
      <WhatsAppFloat branding={branding} />
      <StoreShoppingChat whatsapp={branding.whatsapp} />
      <Footer branding={branding} socialLinks={socialLinks} categories={footerCategories} settings={{
        newsletter: visibility.footerNewsletter,
        brand: visibility.footerBrand,
        shopLinks: visibility.footerShopLinks,
        informationLinks: visibility.footerInformationLinks,
        contact: visibility.footerContact,
        bottomBar: visibility.footerBottomBar,
      }} />
    </>
  );
}

async function StoreShoppingChat({ whatsapp }: { whatsapp: string }) {
  const { config } = await getChatbotSettings();
  return <ShoppingChat enabled={config.enabled} name={config.name} greeting={config.greeting} supportUrl={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} />;
}
