import { redirect } from "next/navigation";
import InventoryManagement from "@/components/admin/InventoryManagement";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  if (!(await requireAdminPermission("inventory", "view"))) redirect("/admin/dashboard");
  return <InventoryManagement />;
}
