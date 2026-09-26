import CartPageClient from "@/components/cart/CartPageClient";
import { getHomepageVisibility } from "@/lib/homepage-settings";

export default async function CartPage() {
  const visibility = await getHomepageVisibility();
  return <CartPageClient visibility={visibility} />;
}
