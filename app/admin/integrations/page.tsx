import IntegrationManager from "@/components/admin/IntegrationManager";
import NotificationManager from "@/components/admin/NotificationManager";
import CheckoutProviderManager from "@/components/admin/CheckoutProviderManager";

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
  return <><IntegrationManager /><CheckoutProviderManager /><NotificationManager /></>;
}
