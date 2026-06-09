import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@/types";

interface RoleRouteProps {
  allow: Role[];
}

export const RoleRoute = ({ allow }: RoleRouteProps) => {
  const { user, ready } = useAuth();
  const { toast } = useToast();

  const isUnauthorized = ready && user && !allow.includes(user.role);

  useEffect(() => {
    if (isUnauthorized) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page.",
        variant: "destructive",
      });
    }
  }, [isUnauthorized, toast]);

  if (!ready) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!allow.includes(user.role)) {
    if (user.role === "CUSTOMER") {
      return <Navigate to="/" replace />;
    }
    if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "SUPER_ADMIN") {
      return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
