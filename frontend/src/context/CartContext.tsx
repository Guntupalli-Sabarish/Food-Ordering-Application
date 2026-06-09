import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, MenuItem } from "@/types";
import {
  addToCart,
  clearCart as apiClearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/apis";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface CartContextValue {
  cartItems: CartItem[];
  totalAmount: number;
  addItem: (item: MenuItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refresh = useCallback(async () => {
    if (!user || user.role !== "CUSTOMER") {
      setCartItems([]);
      return;
    }
    try {
      const items = await getCart();
      setCartItems(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load cart";
      toast({ title: "Cart sync failed", description: message, variant: "destructive" });
    }
  }, [toast, user]);

  useEffect(() => {
    let active = true;
    if (!active) {
      return;
    }
    refresh();
    return () => {
      active = false;
    };
  }, [refresh]);

  const addItem = useCallback(
    async (item: MenuItem) => {
      if (!user) {
        toast({ title: "Login required", description: "Sign in to add items." });
        return;
      }
      try {
        const items = await addToCart(item.id, 1);
        setCartItems(items);
        toast({ title: "Added to cart", description: item.name });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to add item";
        toast({ title: "Cart update failed", description: message, variant: "destructive" });
      }
    },
    [toast, user]
  );

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) {
      return;
    }
    try {
      const items = await removeCartItem(itemId);
      setCartItems(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to remove item";
      toast({ title: "Cart update failed", description: message, variant: "destructive" });
    }
  }, [toast, user]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!user) {
      return;
    }
    try {
      const items = await updateCartItem(itemId, quantity);
      setCartItems(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update quantity";
      toast({ title: "Cart update failed", description: message, variant: "destructive" });
    }
  }, [toast, user]);

  const clearCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const items = await apiClearCart();
      setCartItems(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to clear cart";
      toast({ title: "Cart update failed", description: message, variant: "destructive" });
    }
  }, [toast, user]);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, cart) => sum + cart.item.price * cart.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({ cartItems, totalAmount, addItem, removeItem, updateQuantity, clearCart, refresh }),
    [cartItems, totalAmount, addItem, removeItem, updateQuantity, clearCart, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
