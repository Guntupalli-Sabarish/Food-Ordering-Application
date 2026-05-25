import { Outlet } from "react-router-dom";
import { AppFooter } from "@/components/common/AppFooter";

export const PublicLayout = () => (
  <div className="min-h-screen bg-warm-gradient">
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10">
      <Outlet />
    </main>
    <AppFooter />
  </div>
);
