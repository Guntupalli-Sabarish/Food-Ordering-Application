import type {
  ChartPoint,
  DashboardMetric,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  Role,
  User,
} from "@/types";
import { getRestaurantImage, getMenuItemImage } from "@/utils/images";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  status: number;
};

type AuthResponse = {
  token: string | null;
  userId: number;
  name: string;
  email: string;
  role: Role;
};

type MenuItemDTO = {
  menuItemId: number;
  restaurantId: number;
  itemName: string;
  description: string;
  category: string;
  price: number;
  availability: boolean;
};

type CartItemDTO = {
  menuItem: MenuItemDTO;
  quantity: number;
};

type CartDTO = {
  cartId: number;
  userId: number;
  items: CartItemDTO[];
};

type RestaurantDTO = {
  restaurantId: number;
  name: string;
  address: string;
  cuisine: string;
  adminId: number;
  active: boolean;
};

type UserDTO = {
  userId: number;
  name: string;
  email: string;
  role: Role;
};

type OrderItemDTO = {
  menuItemId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  menuItemName?: string;
};

type OrderDTO = {
  orderId: number;
  userId: number;
  restaurantId: number;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  items: OrderItemDTO[];
  restaurantName?: string;
};

type PaymentDTO = {
  paymentId: number;
  orderId: number;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  createdAt: string;
};

const _rawApiUrl = import.meta.env.VITE_API_BASE_URL;
if (!_rawApiUrl && import.meta.env.PROD) {
  throw new Error(
    "[Config Error] VITE_API_BASE_URL is required for production builds. " +
    "Set it in your .env or deployment environment."
  );
}
const API_BASE_URL = _rawApiUrl ?? "http://localhost:8080";
const DEFAULT_MENU_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80";

const getStoredAuth = () => {
  const stored = localStorage.getItem("foodapp.auth");
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as { user: User; token: string };
  } catch {
    return null;
  }
};

const getAuthToken = () => getStoredAuth()?.token ?? null;

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as Partial<ApiResponse<unknown>> & {
      message?: string;
    };
    return payload.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

const apiRequest = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = getAuthToken();
  const headers = new Headers(options?.headers);
  headers.set("Accept", "application/json");
  if (options?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Global 401 handler: clear session and redirect to login on unauthorized
    if (response.status === 401) {
      localStorage.removeItem("foodapp.auth");
      // Avoid redirect loop if we are already on the login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    const msg = await parseApiError(response);
    throw new ApiError(msg, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const unwrapApiResponse = async <T>(path: string, options?: RequestInit) => {
  const payload = await apiRequest<ApiResponse<T>>(path, options);
  return payload.data;
};

const toOrderStatus = (status: string): OrderStatus => {
  switch (status) {
    case "PENDING_PAYMENT":
      return "PENDING_PAYMENT";
    case "PENDING":
      return "PLACED";
    case "ACCEPTED":
      return "PREPARING";
    case "PREPARING":
      return "PREPARING";
    case "OUT_FOR_DELIVERY":
      return "OUT_FOR_DELIVERY";
    case "DELIVERED":
      return "DELIVERED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PLACED";
  }
};

const toBackendOrderStatus = (status: string) => {
  if (status === "PLACED") {
    return "PENDING";
  }
  return status;
};

const mapRestaurant = (dto: RestaurantDTO): Restaurant => ({
  id: String(dto.restaurantId ?? ""),
  name: dto.name ?? "Restaurant",
  address: dto.address ?? "",
  cuisine: dto.cuisine ?? "",
  rating: 4.5,
  etaMinutes: 30,
  priceLevel: "$$",
  image: getRestaurantImage(String(dto.restaurantId ?? ""), dto.name ?? "", dto.cuisine ?? ""),
  tags: dto.active ? ["Open"] : ["Closed"],
  adminId: dto.adminId,
  active: dto.active,
});

const mapMenuItem = (dto: MenuItemDTO): MenuItem => ({
  id: String(dto.menuItemId ?? ""),
  restaurantId: String(dto.restaurantId ?? ""),
  name: dto.itemName ?? "Item",
  description: dto.description ?? "",
  price: Number(dto.price ?? 0),
  isVeg: false,
  category: dto.category ?? "Main",
  image: getMenuItemImage(String(dto.menuItemId ?? ""), dto.itemName ?? "", dto.category ?? ""),
});

const mapUser = (dto: UserDTO): User => ({
  id: String(dto.userId ?? ""),
  name: dto.name ?? "",
  email: dto.email ?? "",
  role: dto.role ?? "CUSTOMER",
});

const mapOrder = (dto: OrderDTO): Order => ({
  id: String(dto.orderId ?? ""),
  restaurantName: dto.restaurantName || (dto.restaurantId ? `Restaurant #${dto.restaurantId}` : "Restaurant"),
  items: (dto.items ?? []).map((item) => ({
    item: {
      id: String(item.menuItemId ?? ""),
      restaurantId: String(dto.restaurantId ?? ""),
      name: item.menuItemName || `Item #${item.menuItemId ?? ""}`,
      description: "",
      price: Number(item.unitPrice ?? 0),
      isVeg: false,
      category: "Main",
      image: DEFAULT_MENU_IMAGE,
    },
    quantity: item.quantity ?? 1,
  })),
  total: Number(dto.totalAmount ?? 0),
  status: toOrderStatus(dto.orderStatus ?? "PENDING"),
  createdAt: dto.createdAt ?? new Date().toISOString(),
});

export const login = async (email: string, password: string) => {
  const data = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return {
    token: data.token ?? "",
    user: {
      id: String(data.userId ?? ""),
      name: data.name,
      email: data.email,
      role: data.role,
    },
  };
};

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const data = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return {
    token: data.token ?? "",
    user: {
      id: String(data.userId ?? ""),
      name: data.name,
      email: data.email,
      role: data.role,
    },
  };
};

export const logout = async () => {
  await apiRequest("/api/auth/logout", { method: "POST" });
};

export const forgotPassword = async (email: string) => {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, token, newPassword }),
  });
};

export const getProfile = async (_email?: string) => {
  const data = await apiRequest<AuthResponse>("/api/auth/profile");
  return {
    id: String(data.userId ?? ""),
    name: data.name,
    email: data.email,
    role: data.role,
  } as User;
};

export const updateProfile = async (payload: Partial<User>) => {
  const body: Record<string, string> = {};
  if (payload.name) body.name = payload.name;
  if (payload.email) body.email = payload.email;
  const data = await apiRequest<AuthResponse>("/api/auth/profile/update", {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return {
    id: String(data.userId ?? ""),
    name: data.name,
    email: data.email,
    role: data.role,
  } as User;
};

export const getRestaurants = async () => {
  const data = await apiRequest<RestaurantDTO[]>("/api/customer/restaurants");
  return data.map(mapRestaurant);
};

export const getRestaurantById = async (id: string) => {
  const data = await apiRequest<RestaurantDTO>(`/api/customer/restaurants/${id}`);
  return mapRestaurant(data);
};

export const getMenuForRestaurant = async (restaurantId: string) => {
  const data = await apiRequest<MenuItemDTO[]>(
    `/api/customer/menu/${restaurantId}`
  );
  return data.map(mapMenuItem);
};

export const getMenuItems = async () => {
  const data = await apiRequest<MenuItemDTO[]>("/api/admin/menu");
  return data.map(mapMenuItem);
};

export const getAdminRestaurant = async () => {
  const data = await apiRequest<RestaurantDTO>("/api/admin/restaurant");
  return mapRestaurant(data);
};

export const updateAdminRestaurant = async (payload: {
  name: string;
  address: string;
  cuisine: string;
}) => {
  const data = await apiRequest<RestaurantDTO>("/api/admin/restaurant", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapRestaurant(data);
};

export const getSuperRestaurants = async () => {
  const data = await apiRequest<RestaurantDTO[]>("/api/superadmin/restaurants");
  return data.map(mapRestaurant);
};

export const createRestaurant = async (payload: {
  name: string;
  address: string;
  cuisine: string;
  adminId: number;
  active?: boolean;
}) => {
  const data = await apiRequest<RestaurantDTO>("/api/superadmin/restaurants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapRestaurant(data);
};

export const updateRestaurant = async (id: string, payload: {
  name: string;
  address: string;
  cuisine: string;
  adminId: number;
  active?: boolean;
}) => {
  const data = await apiRequest<RestaurantDTO>(`/api/superadmin/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapRestaurant(data);
};

export const deleteRestaurant = async (id: string) => {
  await apiRequest(`/api/superadmin/restaurants/${id}`, { method: "DELETE" });
};

export const updateRestaurantStatus = async (id: string, active: boolean) => {
  const data = await apiRequest<RestaurantDTO>(
    `/api/superadmin/restaurants/${id}/status?active=${active}`,
    { method: "PUT" }
  );
  return mapRestaurant(data);
};

export const createMenuItem = async (payload: {
  restaurantId: number;
  itemName: string;
  description: string;
  category: string;
  price: number;
  availability?: boolean;
}) => {
  const data = await apiRequest<MenuItemDTO>("/api/admin/menu", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapMenuItem(data);
};

export const updateMenuItem = async (id: string, payload: {
  restaurantId: number;
  itemName: string;
  description: string;
  category: string;
  price: number;
  availability?: boolean;
}) => {
  const data = await apiRequest<MenuItemDTO>(`/api/admin/menu/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return mapMenuItem(data);
};

export const deleteMenuItem = async (id: string) => {
  await apiRequest(`/api/admin/menu/${id}`, { method: "DELETE" });
};

export const getCart = async () => {
  const data = await apiRequest<CartDTO>("/api/customer/cart");
  return data.items.map((item) => ({
    item: mapMenuItem(item.menuItem),
    quantity: item.quantity,
  }));
};

export const addToCart = async (menuItemId: string, quantity = 1) => {
  const data = await apiRequest<CartDTO>("/api/customer/cart/add", {
    method: "POST",
    body: JSON.stringify({ menuItemId: Number(menuItemId), quantity }),
  });
  return data.items.map((item) => ({
    item: mapMenuItem(item.menuItem),
    quantity: item.quantity,
  }));
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const data = await apiRequest<CartDTO>(`/api/customer/cart/update/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return data.items.map((item) => ({
    item: mapMenuItem(item.menuItem),
    quantity: item.quantity,
  }));
};

export const removeCartItem = async (itemId: string) => {
  const data = await apiRequest<CartDTO>(`/api/customer/cart/remove/${itemId}`, {
    method: "DELETE",
  });
  return data.items.map((item) => ({
    item: mapMenuItem(item.menuItem),
    quantity: item.quantity,
  }));
};

export const clearCart = async () => {
  const data = await apiRequest<CartDTO>("/api/customer/cart/clear", {
    method: "DELETE",
  });
  return data.items.map((item) => ({
    item: mapMenuItem(item.menuItem),
    quantity: item.quantity,
  }));
};

export const placeOrder = async (deliveryAddress: string, paymentMethod: string) => {
  const data = await apiRequest<OrderDTO>("/api/customer/orders", {
    method: "POST",
    body: JSON.stringify({ deliveryAddress, paymentMethod }),
  });
  return mapOrder(data);
};

export const getCheckoutQuote = async () => {
  return apiRequest<{ subtotal: number; deliveryFee: number; tax: number; total: number }>(
    "/api/customer/orders/quote"
  );
};

export const getOrders = async () => {
  const data = await apiRequest<OrderDTO[]>("/api/customer/orders");
  return data.map(mapOrder);
};

export const getOrderById = async (id: string) => {
  const data = await apiRequest<OrderDTO>(`/api/customer/orders/${id}`);
  return mapOrder(data);
};

export const cancelOrder = async (id: string) => {
  const data = await apiRequest<OrderDTO>(`/api/customer/orders/${id}/cancel`, {
    method: "PUT",
  });
  return mapOrder(data);
};

export const trackOrder = async (id: string) => {
  return apiRequest<{ orderId: number; status: string }>(
    `/api/customer/orders/${id}/track`
  );
};

export const getAdminOrders = async () => {
  const data = await apiRequest<OrderDTO[]>("/api/admin/orders");
  return data.map(mapOrder);
};

export const updateOrderStatus = async (id: string, status: string) => {
  const data = await apiRequest<OrderDTO>(`/api/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: toBackendOrderStatus(status) }),
  });
  return mapOrder(data);
};

export const initiatePayment = async (orderId: number, method: string) => {
  return apiRequest<PaymentDTO>("/api/customer/payments/initiate", {
    method: "POST",
    body: JSON.stringify({ orderId, method }),
  });
};

export const verifyPayment = async (paymentId: number) => {
  return apiRequest<PaymentDTO>("/api/customer/payments/verify", {
    method: "POST",
    body: JSON.stringify({ paymentId }),
  });
};

export const getPaymentsByOrder = async (orderId: number) => {
  return apiRequest<PaymentDTO[]>(`/api/customer/payments/${orderId}`);
};

export const sendEmailNotification = async (payload: {
  to: string;
  subject: string;
  body: string;
}) => {
  return unwrapApiResponse("/api/admin/notifications/send-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getAdminMetrics = async (): Promise<DashboardMetric[]> => {
  const [revenue, orders] = await Promise.all([
            unwrapApiResponse<{ total: number }>("/api/admin/analytics/revenue"),
    apiRequest<OrderDTO[]>("/api/admin/orders"),
  ]);

  return [
    { title: "Orders", value: String(orders.length), change: "" },
    { title: "Revenue", value: `$${revenue.total ?? 0}`, change: "" },
    { title: "Active", value: "-", change: "" },
  ];
};

export const getSalesSeries = async (): Promise<ChartPoint[]> => {
  try {
    const data = await unwrapApiResponse<{ daily?: Array<{ date: string; amount: number }> }>(
      "/api/superadmin/analytics/revenue"
    );
    if (data.daily?.length) {
      return data.daily.map((item) => ({ name: item.date, value: item.amount }));
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      // Fallback allowed
    } else {
      throw error;
    }
  }

  const adminRevenue = await unwrapApiResponse<{ total: number }>(
    "/api/admin/analytics/revenue"
  );
  return [{ name: "total", value: adminRevenue.total ?? 0 }];
};

export const getOrderVolumeSeries = async (): Promise<ChartPoint[]> => {
  try {
    const data = await unwrapApiResponse<{ completed: number; pending: number; cancelled: number }>(
      "/api/superadmin/analytics/orders"
    );
    return [
      { name: "Completed", value: data.completed ?? 0 },
      { name: "Pending", value: data.pending ?? 0 },
      { name: "Cancelled", value: data.cancelled ?? 0 },
    ];
  } catch {
    const orders = await apiRequest<OrderDTO[]>("/api/admin/orders");
    const counts = orders.reduce(
      (acc, order) => {
        const status = order.orderStatus ?? "PENDING";
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }
};

export const getCategoryDistribution = async (): Promise<ChartPoint[]> => {
  try {
    const data = await unwrapApiResponse<{ items: Array<{ name: string; orders: number }> }>(
      "/api/admin/analytics/top-items"
    );
    return data.items.map((item) => ({ name: item.name, value: item.orders }));
  } catch {
    return [];
  }
};

export const getPlatformMetrics = async (): Promise<DashboardMetric[]> => {
  const data = await unwrapApiResponse<{
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeUsers: number;
  }>("/api/superadmin/analytics/overview");

  return [
    { title: "Total Revenue", value: `$${data.totalRevenue ?? 0}`, change: "" },
    { title: "Total Orders", value: String(data.totalOrders ?? 0), change: "" },
    { title: "Active Users", value: String(data.activeUsers ?? 0), change: "" },
  ];
};

export const getUsers = async () => {
  const data = await apiRequest<UserDTO[]>("/api/superadmin/users");
  return data.map(mapUser);
};

export const updateUserRole = async (id: string, role: Role) => {
  const data = await apiRequest<UserDTO>(`/api/superadmin/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return mapUser(data);
};

export const deleteUser = async (id: string) => {
  await apiRequest(`/api/superadmin/users/${id}`, { method: "DELETE" });
};

export const getSystemLogs = async () => {
  return [
    {
      id: "log1",
      level: "INFO",
      message: "System logs are not exposed yet.",
      time: new Date().toLocaleTimeString(),
    },
  ];
};

export const getHealth = async () => {
  return unwrapApiResponse("/api/health");
};

export const getConfig = async () => {
  return unwrapApiResponse("/api/config");
};
