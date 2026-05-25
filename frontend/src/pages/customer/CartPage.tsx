import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CartItemRow } from "@/components/common/CartItemRow";
import { CartSummary } from "@/components/common/CartSummary";
import { EmptyState } from "@/components/common/EmptyState";
import { useCart } from "@/hooks/useCart";
import { usePageTitle } from "@/hooks/usePageTitle";

export const CartPage = () => {
  usePageTitle("Cart");
  const navigate = useNavigate();
  const { cartItems, totalAmount, removeItem, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse restaurants and add your favorites."
        icon={ShoppingBag}
        actionLabel="Explore restaurants"
        onAction={() => navigate("/restaurants")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your cart"
        subtitle="Review items and adjust quantities"
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {cartItems.map((cart) => (
            <CartItemRow
              key={cart.item.id}
              cart={cart}
              onRemove={removeItem}
              onUpdate={updateQuantity}
            />
          ))}
        </div>
        <CartSummary
          subtotal={totalAmount}
          onCheckout={() => navigate("/checkout")}
        />
      </div>
    </div>
  );
};
