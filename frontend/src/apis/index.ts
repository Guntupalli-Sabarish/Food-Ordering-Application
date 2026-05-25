import type {
  CartItem,
  ChartPoint,
  DashboardMetric,
  MenuItem,
  Order,
  Restaurant,
  Role,
  User,
} from "@/types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUsers: Array<User & { password: string }> = [
  {
    id: "u1",
    name: "Asha Verma",
    email: "customer@food.app",
    role: "CUSTOMER",
    password: "password123",
  },
  {
    id: "u2",
    name: "Admin Kapoor",
    email: "admin@food.app",
    role: "ADMIN",
    password: "admin123",
  },
  {
    id: "u3",
    name: "Super Admin",
    email: "super@food.app",
    role: "SUPER_ADMIN",
    password: "super123",
  },
];

const restaurants: Restaurant[] = [
  {
    id: "r1",
    name: "Spice & Spark",
    cuisine: "North Indian",
    rating: 4.6,
    etaMinutes: 28,
    priceLevel: "$$",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
    tags: ["Bestseller", "Family"],
  },
  {
    id: "r2",
    name: "Umami Street",
    cuisine: "Asian Fusion",
    rating: 4.4,
    etaMinutes: 32,
    priceLevel: "$$$",
    image:
      "https://images.unsplash.com/photo-1548940740-204726a19be3?auto=format&fit=crop&w=800&q=80",
    tags: ["New", "Chef Special"],
  },
  {
    id: "r3",
    name: "Green Bowl",
    cuisine: "Healthy",
    rating: 4.5,
    etaMinutes: 22,
    priceLevel: "$$",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    tags: ["Vegan", "Low Cal"],
  },
  {
    id: "r4",
    name: "Crust & Co.",
    cuisine: "Italian",
    rating: 4.3,
    etaMinutes: 26,
    priceLevel: "$$",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    tags: ["Pasta", "Pizza"],
  },
];

const menuItems: MenuItem[] = [
  {
    id: "m1",
    restaurantId: "r1",
    name: "Butter Chicken Bowl",
    description: "Creamy tomato gravy, basmati rice, garlic naan crumbs.",
    price: 289,
    isVeg: false,
    category: "Bowls",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m2",
    restaurantId: "r1",
    name: "Paneer Tikka Plate",
    description: "Char-grilled paneer with mint chutney and salad.",
    price: 249,
    isVeg: true,
    category: "Starters",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m3",
    restaurantId: "r2",
    name: "Korean BBQ Bao",
    description: "Soft bao buns with bulgogi, kimchi slaw.",
    price: 199,
    isVeg: false,
    category: "Small Plates",
    image:
      "https://images.unsplash.com/photo-1540648639573-28bc2a45f7f6?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m4",
    restaurantId: "r3",
    name: "Rainbow Power Bowl",
    description: "Quinoa, roasted veggies, avocado, citrus dressing.",
    price: 239,
    isVeg: true,
    category: "Bowls",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "m5",
    restaurantId: "r4",
    name: "Truffle Mushroom Pizza",
    description: "Sourdough crust, truffle oil, parmesan, wild mushrooms.",
    price: 329,
    isVeg: true,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1548365328-8b849e6f3d55?auto=format&fit=crop&w=800&q=80",
  },
];

let orders: Order[] = [
  {
    id: "o1",
    restaurantName: "Spice & Spark",
    items: [
      { item: menuItems[0], quantity: 1 },
      { item: menuItems[1], quantity: 1 },
    ],
    total: 538,
    status: "OUT_FOR_DELIVERY",
    createdAt: "2026-05-25T10:24:00Z",
  },
  {
    id: "o2",
    restaurantName: "Green Bowl",
    items: [{ item: menuItems[3], quantity: 2 }],
    total: 478,
    status: "DELIVERED",
    createdAt: "2026-05-20T12:24:00Z",
  },
];

export const login = async (email: string, password: string) => {
  await delay(650);
  const user = mockUsers.find(
    (item) => item.email === email && item.password === password
  );
  if (!user) {
    throw new Error("Invalid credentials");
  }
  return {
    token: `mock-token-${user.id}`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: Role = "CUSTOMER"
) => {
  await delay(650);
  if (mockUsers.some((item) => item.email === email)) {
    throw new Error("User already exists");
  }
  const newUser: User & { password: string } = {
    id: `u${mockUsers.length + 1}`,
    name,
    email,
    role,
    password,
  };
  mockUsers.push(newUser);
  return {
    token: `mock-token-${newUser.id}`,
    user: { id: newUser.id, name, email, role },
  };
};

export const getProfile = async (email: string) => {
  await delay(300);
  const user = mockUsers.find((item) => item.email === email);
  if (!user) {
    throw new Error("User not found");
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const updateProfile = async (payload: Partial<User>) => {
  await delay(400);
  return payload;
};

export const getRestaurants = async () => {
  await delay(500);
  return restaurants;
};

export const getRestaurantById = async (id: string) => {
  await delay(350);
  return restaurants.find((item) => item.id === id) ?? null;
};

export const getMenuForRestaurant = async (restaurantId: string) => {
  await delay(450);
  return menuItems.filter((item) => item.restaurantId === restaurantId);
};

export const addToCart = async () => {
  await delay(200);
  return { status: "ok" };
};

export const placeOrder = async (cartItems: CartItem[]) => {
  await delay(700);
  const total = cartItems.reduce(
    (sum, cart) => sum + cart.item.price * cart.quantity,
    0
  );
  const newOrder: Order = {
    id: `o${orders.length + 1}`,
    restaurantName: cartItems[0]?.item.restaurantId ?? "Mixed",
    items: cartItems,
    total,
    status: "PLACED",
    createdAt: new Date().toISOString(),
  };
  orders = [newOrder, ...orders];
  return newOrder;
};

export const getOrders = async () => {
  await delay(500);
  return orders;
};

export const getAdminMetrics = async (): Promise<DashboardMetric[]> => {
  await delay(300);
  return [
    { title: "Orders Today", value: "1,248", change: "+12%" },
    { title: "Revenue", value: "$42.6K", change: "+8%" },
    { title: "Active Users", value: "9.4K", change: "+5%" },
  ];
};

export const getSalesSeries = async (): Promise<ChartPoint[]> => {
  await delay(350);
  return [
    { name: "Mon", value: 3200 },
    { name: "Tue", value: 4100 },
    { name: "Wed", value: 3800 },
    { name: "Thu", value: 4600 },
    { name: "Fri", value: 5200 },
    { name: "Sat", value: 6100 },
    { name: "Sun", value: 5700 },
  ];
};

export const getOrderVolumeSeries = async (): Promise<ChartPoint[]> => {
  await delay(350);
  return [
    { name: "Breakfast", value: 420 },
    { name: "Lunch", value: 860 },
    { name: "Snacks", value: 520 },
    { name: "Dinner", value: 1120 },
  ];
};

export const getCategoryDistribution = async (): Promise<ChartPoint[]> => {
  await delay(300);
  return [
    { name: "Indian", value: 38 },
    { name: "Asian", value: 24 },
    { name: "Italian", value: 18 },
    { name: "Healthy", value: 20 },
  ];
};

export const getPlatformMetrics = async (): Promise<DashboardMetric[]> => {
  await delay(350);
  return [
    { title: "Live Restaurants", value: "1,920", change: "+4%" },
    { title: "Conversion", value: "3.4%", change: "+0.2%" },
    { title: "Latency", value: "220ms", change: "-14%" },
  ];
};

export const getUsers = async () => {
  await delay(300);
  return mockUsers.map(({ password, ...user }) => user);
};

export const getSystemLogs = async () => {
  await delay(250);
  return [
    {
      id: "log1",
      level: "INFO",
      message: "Auto-scaling triggered for peak orders.",
      time: "10:24 AM",
    },
    {
      id: "log2",
      level: "WARN",
      message: "Payment latency above threshold in Zone 2.",
      time: "11:02 AM",
    },
    {
      id: "log3",
      level: "INFO",
      message: "New restaurant onboarded: Spice & Spark.",
      time: "11:45 AM",
    },
  ];
};

export const getMenuItems = async () => {
  await delay(300);
  return menuItems;
};

export const getAdminOrders = async () => {
  await delay(300);
  return orders;
};

export const getManagedRestaurants = async () => {
  await delay(300);
  return restaurants;
};
