import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { CartItem, MenuItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface CartContextValue {
  cartItems: CartItem[];
  totalAmount: number;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (item: MenuItem) => {
      setCartItems((prev) => {
        const existing = prev.find((cart) => cart.item.id === item.id);
        if (existing) {
          return prev.map((cart) =>
            cart.item.id === item.id
              ? { ...cart, quantity: cart.quantity + 1 }
              : cart
          );
        }
        return [...prev, { item, quantity: 1 }];
      });
      toast({ title: "Added to cart", description: item.name });
    },
    [toast]
  );

  const removeItem = useCallback((itemId: string) => {
    setCartItems((prev) => prev.filter((cart) => cart.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prev) =>
      prev
        .map((cart) =>
          cart.item.id === itemId ? { ...cart, quantity } : cart
        )
        .filter((cart) => cart.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalAmount = useMemo(
    () =>
      cartItems.reduce(
        (sum, cart) => sum + cart.item.price * cart.quantity,
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({ cartItems, totalAmount, addItem, removeItem, updateQuantity, clearCart }),
    [cartItems, totalAmount, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
