import IntegrationManager from "@/components/admin/IntegrationManager";
import NotificationManager from "@/components/admin/NotificationManager";

export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
  return <><IntegrationManager /><NotificationManager /></>;
}
