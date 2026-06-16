export type Role = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  cuisine: string;
  rating: number;
  etaMinutes: number;
  priceLevel: "$" | "$$" | "$$$" | "₹" | "₹₹" | "₹₹₹" | string;
  image: string;
  tags: string[];
  adminId?: number;
  active?: boolean;
  topRatedItem?: { name: string; price: number };
  minItem?: { name: string; price: number };
  maxItem?: { name: string; price: number };
  freeDelivery?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  category: string;
  image: string;
  availability: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  restaurantName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress?: string;
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
}

export interface ChartPoint {
  name: string;
  value: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}
