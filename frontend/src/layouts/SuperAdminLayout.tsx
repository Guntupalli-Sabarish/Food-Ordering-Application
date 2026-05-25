import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/common/DashboardHeader";

export const SuperAdminLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <DashboardHeader
      title="Super Admin"
      subtitle="Platform-wide analytics and governance."
      navItems={[
        { label: "Analytics", href: "/super" },
        { label: "Restaurants", href: "/super/restaurants" },
        { label: "Users", href: "/super/users" },
        { label: "Monitoring", href: "/super/monitoring" },
      ]}
    />
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8">
      <Outlet />
    </main>
  </div>
);
