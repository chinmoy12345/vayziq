"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return <button type="button" onClick={logout} className={compact ? "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 whitespace-nowrap hover:bg-red-50 hover:text-red-600" : "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"}><LogOut className={compact ? "h-4 w-4" : "h-4.5 w-4.5"} /><span>Logout</span></button>;
}
