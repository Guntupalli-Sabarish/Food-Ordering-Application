import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";

export const AppLayout = () => (
  <div className="min-h-screen bg-warm-gradient">
    <AppHeader />
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
      <Outlet />
    </main>
    <AppFooter />
  </div>
);
