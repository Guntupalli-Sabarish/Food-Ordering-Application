import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppFooter } from "@/components/common/AppFooter";

export const PublicLayout = () => {
  const { user, ready } = useAuth();

  if (ready && user) {
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "SUPER_ADMIN") {
      return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-warm-gradient">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};
