"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminFooter from "@/components/admin/AdminFooter";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin login page should have no admin layout
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#faf8f6] text-[#292321]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f6] text-[#292321]">

      {/* Admin Header */}
      <AdminHeader
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <div className="flex">

        {/* Admin Sidebar */}
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">

          <main className="admin-content min-h-[calc(100vh-72px)] flex-1">
            {children}
          </main>

          {/* Admin Footer */}
          <AdminFooter />

        </div>
      </div>
    </div>
  );
}
