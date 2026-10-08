import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCardSettingsProvider } from "@/components/product/ProductCardSettings";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getStoreBranding } from "@/lib/store-branding";
import { getSocialLinks } from "@/lib/social-links";
import prisma from "@/lib/db";
import { getStoreMenuSettings } from "@/lib/store-menu-settings";
import MaintenancePage from "@/components/store/MaintenancePage";

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
      <Header menuSettings={menuSettings} />
      <ProductCardSettingsProvider settings={{
        productCardRating: visibility.productCardRating,
        productCardCarousel: visibility.productCardCarousel,
      }}>
        <main className="storefront-shell min-h-screen">{children}</main>
      </ProductCardSettingsProvider>
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
