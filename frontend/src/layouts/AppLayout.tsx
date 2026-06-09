import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/common/AppHeader";
import { AppFooter } from "@/components/common/AppFooter";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { ThemeProvider } from "@/context/ThemeProvider";

export const AppLayout = () => (
  <ThemeProvider>
    <div className="min-h-screen bg-warm-gradient transition-colors duration-300">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-16">
        <Outlet />
      </main>
      <AppFooter />
      <BottomNavigation />
    </div>
  </ThemeProvider>
);
