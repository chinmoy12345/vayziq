import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCardSettingsProvider } from "@/components/product/ProductCardSettings";
import { getHomepageVisibility } from "@/lib/homepage-settings";
import { getStoreBranding } from "@/lib/store-branding";
import { getSocialLinks } from "@/lib/social-links";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [branding, visibility, socialLinks, footerCategories] = await Promise.all([
    getStoreBranding(),
    getHomepageVisibility(),
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
