import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";

// ── Lazy-loaded pages (each becomes its own JS chunk) ─────────────────────────
const LandingPage                   = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const LoginPage                     = lazy(() => import("@/pages/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage                  = lazy(() => import("@/pages/auth/RegisterPage").then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage            = lazy(() => import("@/pages/auth/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage             = lazy(() => import("@/pages/auth/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const HomePage                      = lazy(() => import("@/pages/customer/HomePage").then(m => ({ default: m.HomePage })));
const RestaurantsPage               = lazy(() => import("@/pages/customer/RestaurantsPage").then(m => ({ default: m.RestaurantsPage })));
const MenuPage                      = lazy(() => import("@/pages/customer/MenuPage").then(m => ({ default: m.MenuPage })));
const CartPage                      = lazy(() => import("@/pages/customer/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage                  = lazy(() => import("@/pages/customer/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const OrderTrackingPage             = lazy(() => import("@/pages/customer/OrderTrackingPage").then(m => ({ default: m.OrderTrackingPage })));
const OrderHistoryPage              = lazy(() => import("@/pages/customer/OrderHistoryPage").then(m => ({ default: m.OrderHistoryPage })));
const ProfilePage                   = lazy(() => import("@/pages/customer/ProfilePage").then(m => ({ default: m.ProfilePage })));
const AdminDashboardPage            = lazy(() => import("@/pages/admin/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminMenuManagementPage       = lazy(() => import("@/pages/admin/AdminMenuManagementPage").then(m => ({ default: m.AdminMenuManagementPage })));
const AdminOrderManagementPage      = lazy(() => import("@/pages/admin/AdminOrderManagementPage").then(m => ({ default: m.AdminOrderManagementPage })));
const AdminSalesReportsPage         = lazy(() => import("@/pages/admin/AdminSalesReportsPage").then(m => ({ default: m.AdminSalesReportsPage })));
const SuperAnalyticsPage            = lazy(() => import("@/pages/super/SuperAnalyticsPage").then(m => ({ default: m.SuperAnalyticsPage })));
const SuperRestaurantManagementPage = lazy(() => import("@/pages/super/SuperRestaurantManagementPage").then(m => ({ default: m.SuperRestaurantManagementPage })));
const SuperUserManagementPage       = lazy(() => import("@/pages/super/SuperUserManagementPage").then(m => ({ default: m.SuperUserManagementPage })));
const SuperMonitoringPage           = lazy(() => import("@/pages/super/SuperMonitoringPage").then(m => ({ default: m.SuperMonitoringPage })));

// ── Minimal loading spinner shown while a chunk is fetching ───────────────────
const PageLoader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#0f1117",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      border: "3px solid rgba(249,115,22,0.2)",
      borderTopColor: "#f97316",
      animation: "spin 0.7s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public landing page — no layout wrapper needed */}
      <Route path="/landing" element={<LandingPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allow={["CUSTOMER"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/"                  element={<HomePage />} />
            <Route path="/restaurants"       element={<RestaurantsPage />} />
            <Route path="/restaurants/:id"   element={<MenuPage />} />
            <Route path="/cart"              element={<CartPage />} />
            <Route path="/checkout"          element={<CheckoutPage />} />
            <Route path="/orders"            element={<OrderHistoryPage />} />
            <Route path="/orders/:id/track"  element={<OrderTrackingPage />} />
            <Route path="/profile"           element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin"         element={<AdminDashboardPage />} />
            <Route path="/admin/menu"    element={<AdminMenuManagementPage />} />
            <Route path="/admin/orders"  element={<AdminOrderManagementPage />} />
            <Route path="/admin/reports" element={<AdminSalesReportsPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allow={["SUPER_ADMIN"]} />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/superadmin"             element={<SuperAnalyticsPage />} />
            <Route path="/superadmin/analytics"   element={<SuperAnalyticsPage />} />
            <Route path="/superadmin/restaurants" element={<SuperRestaurantManagementPage />} />
            <Route path="/superadmin/users"       element={<SuperUserManagementPage />} />
            <Route path="/superadmin/monitoring"  element={<SuperMonitoringPage />} />
            <Route path="/superadmin/profile"     element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  </Suspense>
);
