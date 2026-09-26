import { redirect } from "next/navigation";
import SupplierManagement from "@/components/admin/SupplierManagement";
import { requireAdminPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  if (!(await requireAdminPermission("suppliers", "view"))) redirect("/admin/dashboard");
  return <SupplierManagement />;
}
