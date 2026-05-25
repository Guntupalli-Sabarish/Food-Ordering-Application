import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/common/DashboardHeader";

export const AdminLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <DashboardHeader
      title="Admin Command Center"
      subtitle="Track orders, menus, and revenue in real time."
      navItems={[
        { label: "Dashboard", href: "/admin" },
        { label: "Menu", href: "/admin/menu" },
        { label: "Orders", href: "/admin/orders" },
        { label: "Reports", href: "/admin/reports" },
      ]}
    />
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
      <Outlet />
    </main>
  </div>
);
