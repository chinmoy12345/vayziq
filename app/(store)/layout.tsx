import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCardSettingsProvider } from "@/components/product/ProductCardSettings";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getStoreBranding } from "@/lib/store-branding";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [branding, visibility] = await Promise.all([
    getStoreBranding(),
    getHomepageVisibility(),
  ]);

  return (
    <>
      <Header />
      <ProductCardSettingsProvider settings={{
        productCardRating: visibility.productCardRating,
        productCardCarousel: visibility.productCardCarousel,
      }}>
        <main className="storefront-shell min-h-screen">{children}</main>
      </ProductCardSettingsProvider>
      <Footer branding={branding} settings={{
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
