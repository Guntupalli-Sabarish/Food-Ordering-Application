import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";

export const CartPage = () => {
  usePageTitle("Cart");
  const navigate = useNavigate();
  const { cartItems, totalAmount, removeItem, updateQuantity } = useCart();

  const deliveryFee = 40;
  const taxes = Math.round(totalAmount * 0.08);
  const total = totalAmount + deliveryFee + taxes;

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-5 text-center animate-fade-in">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10">
          <ShoppingBag className="h-10 w-10 text-brand-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground">Add items from a restaurant to get started</p>
        </div>
        <Button
          onClick={() => navigate("/restaurants")}
          className="btn-brand-gradient rounded-full px-8 text-white border-0"
        >
          Browse restaurants
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your cart</h1>
        <p className="text-sm text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Cart items */}
        <div className="space-y-3">
          {cartItems.map((cart) => (
            <div
              key={cart.item.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 card-elevated"
            >
              {/* Thumbnail */}
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {cart.item.image ? (
                  <img
                    src={cart.item.image}
                    alt={cart.item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">🍽️</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold text-foreground">{cart.item.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(cart.item.price)} each</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/10 px-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-500/15"
                  onClick={() => updateQuantity(cart.item.id, cart.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-[1.25rem] text-center text-sm font-bold text-brand-600 dark:text-brand-400">
                  {cart.quantity}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full text-brand-600 dark:text-brand-400 hover:bg-brand-500/15"
                  onClick={() => updateQuantity(cart.item.id, cart.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Line total */}
              <p className="w-16 text-right text-sm font-semibold text-foreground shrink-0">
                {formatCurrency(cart.item.price * cart.quantity)}
              </p>

              {/* Remove */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(cart.item.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Promo code */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-4">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Enter promo code"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              Apply
            </Button>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-elevated">
            <h3 className="text-lg font-bold text-foreground">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span className="font-medium text-foreground">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & charges</span>
                <span className="font-medium text-foreground">{formatCurrency(taxes)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              className="w-full rounded-xl btn-brand-gradient border-0 text-white font-semibold py-5"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Free cancellation before kitchen starts preparing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
