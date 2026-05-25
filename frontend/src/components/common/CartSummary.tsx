import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

export const CartSummary = ({ subtotal, onCheckout }: CartSummaryProps) => {
  const deliveryFee = 40;
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + deliveryFee + taxes;

  return (
    <Card className="sticky top-24">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Delivery</span>
            <span>{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{formatCurrency(taxes)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-4 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <Button className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};
