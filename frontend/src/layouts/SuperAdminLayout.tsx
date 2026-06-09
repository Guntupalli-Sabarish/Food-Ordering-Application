import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/common/DashboardHeader";

export const SuperAdminLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <DashboardHeader
      title="Super Admin"
      subtitle="Platform-wide analytics and governance."
      navItems={[
        { label: "Analytics", href: "/superadmin" },
        { label: "Restaurants", href: "/superadmin/restaurants" },
        { label: "Users", href: "/superadmin/users" },
        { label: "Monitoring", href: "/superadmin/monitoring" },
      ]}
    />
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
      <Outlet />
    </main>
  </div>
);
