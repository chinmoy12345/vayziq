import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getStoreBranding } from "@/lib/store-branding";
import { getActiveNavigationCategories } from "@/lib/storefront";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getStoreMenuSettings } from "@/lib/store-menu-settings";
import { ProductCardSettingsProvider } from "@/components/product/ProductCardSettings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [branding, categories, visibility, menuSettings] = await Promise.all([getStoreBranding(), getActiveNavigationCategories(), getHomepageVisibility(), getStoreMenuSettings()]);
  return (
    <>
      <Header branding={branding} categories={categories} menuSettings={menuSettings} />

      <ProductCardSettingsProvider settings={{ productCardRating: visibility.productCardRating, productCardCarousel: visibility.productCardCarousel }}>
        <main className="min-h-screen">
          {children}
        </main>
      </ProductCardSettingsProvider>

      <Footer branding={branding} settings={{ newsletter: visibility.footerNewsletter, brand: visibility.footerBrand, shopLinks: visibility.footerShopLinks, informationLinks: visibility.footerInformationLinks, contact: visibility.footerContact, bottomBar: visibility.footerBottomBar }} />
    </>
  );
}
