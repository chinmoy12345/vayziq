import { redirect } from "next/navigation";
import RoleManagement from "@/components/admin/RoleManagement";
import { requireSuperAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminRolesPage() {
  if (!(await requireSuperAdmin())) redirect("/admin/dashboard");
  return <RoleManagement />;
}
