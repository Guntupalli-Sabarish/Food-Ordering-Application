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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CartContextValue {
  cartItems: CartItem[];
  totalAmount: number;
  addItem: (item: MenuItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface PendingCartAdd {
  item: MenuItem;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingAdd, setPendingAdd] = useState<PendingCartAdd | null>(null);

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

  const doAddItem = useCallback(
    async (item: MenuItem) => {
      try {
        const items = await addToCart(item.id, 1);
        setCartItems(items);
        toast({ title: "Added to cart", description: item.name });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to add item";
        toast({ title: "Cart update failed", description: message, variant: "destructive" });
      }
    },
    [toast]
  );

  const addItem = useCallback(
    async (item: MenuItem) => {
      if (!user) {
        toast({ title: "Login required", description: "Sign in to add items." });
        return;
      }
      // Cross-restaurant guard: detect if new item is from a different restaurant
      if (cartItems.length > 0 && cartItems[0].item.restaurantId !== item.restaurantId) {
        setPendingAdd({ item });
        return;
      }
      await doAddItem(item);
    },
    [toast, user, cartItems, doAddItem]
  );

  const handleConflictConfirm = useCallback(async () => {
    if (!pendingAdd) return;
    const item = pendingAdd.item;
    setPendingAdd(null);
    // Clear the cart first, then add the new item
    try {
      await apiClearCart();
      setCartItems([]);
      const items = await addToCart(item.id, 1);
      setCartItems(items);
      toast({ title: "Added to cart", description: item.name });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add item";
      toast({ title: "Cart update failed", description: message, variant: "destructive" });
    }
  }, [pendingAdd, toast]);

  const handleConflictCancel = useCallback(() => {
    setPendingAdd(null);
  }, []);

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

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Cross-restaurant conflict dialog using existing Dialog component */}
      <Dialog open={!!pendingAdd} onOpenChange={(open) => { if (!open) handleConflictCancel(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your cart contains items from another restaurant.</DialogTitle>
            <DialogDescription>
              Adding an item from a different restaurant will clear the existing cart.
              <br /><br />
              Continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleConflictCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConflictConfirm}>
              Clear cart &amp; continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CartContext.Provider>
  );
};
