import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

interface RoleRouteProps {
  allow: Role[];
}

export const RoleRoute = ({ allow }: RoleRouteProps) => {
  const { user, ready } = useAuth();
  if (!ready) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allow.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
