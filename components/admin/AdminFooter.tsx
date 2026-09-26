import { StoreName } from "@/components/StoreBranding";
export default function AdminFooter() {
  return (
    <footer className="border-t border-[#eee6e1] bg-white">
      <div className="flex flex-col gap-2 px-5 py-5 text-xs text-[#958b86] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        
        <p>
          © {new Date().getFullYear()} <StoreName />.
          All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <span>Admin Panel</span>
          <span className="text-[#d8cfca]">•</span>
          <span>v1.0.0</span>
        </div>

      </div>
    </footer>
  );
}