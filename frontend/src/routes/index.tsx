import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { HomePage } from "@/pages/customer/HomePage";
import { RestaurantsPage } from "@/pages/customer/RestaurantsPage";
import { MenuPage } from "@/pages/customer/MenuPage";
import { CartPage } from "@/pages/customer/CartPage";
import { CheckoutPage } from "@/pages/customer/CheckoutPage";
import { OrderTrackingPage } from "@/pages/customer/OrderTrackingPage";
import { OrderHistoryPage } from "@/pages/customer/OrderHistoryPage";
import { ProfilePage } from "@/pages/customer/ProfilePage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminMenuManagementPage } from "@/pages/admin/AdminMenuManagementPage";
import { AdminOrderManagementPage } from "@/pages/admin/AdminOrderManagementPage";
import { AdminSalesReportsPage } from "@/pages/admin/AdminSalesReportsPage";
import { SuperAnalyticsPage } from "@/pages/super/SuperAnalyticsPage";
import { SuperRestaurantManagementPage } from "@/pages/super/SuperRestaurantManagementPage";
import { SuperUserManagementPage } from "@/pages/super/SuperUserManagementPage";
import { SuperMonitoringPage } from "@/pages/super/SuperMonitoringPage";

export const AppRoutes = () => (
  <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<RoleRoute allow={["CUSTOMER"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id/track" element={<OrderTrackingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["ADMIN"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/menu" element={<AdminMenuManagementPage />} />
          <Route path="/admin/orders" element={<AdminOrderManagementPage />} />
          <Route path="/admin/reports" element={<AdminSalesReportsPage />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["SUPER_ADMIN"]} />}>
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin" element={<SuperAnalyticsPage />} />
          <Route path="/superadmin/analytics" element={<SuperAnalyticsPage />} />
          <Route path="/superadmin/restaurants" element={<SuperRestaurantManagementPage />} />
          <Route path="/superadmin/users" element={<SuperUserManagementPage />} />
          <Route path="/superadmin/monitoring" element={<SuperMonitoringPage />} />
          <Route path="/superadmin/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);
