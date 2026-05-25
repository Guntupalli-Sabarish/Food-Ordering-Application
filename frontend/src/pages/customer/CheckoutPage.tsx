import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { useCart } from "@/hooks/useCart";
import { placeOrder } from "@/apis";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

export const CheckoutPage = () => {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    try {
      setSubmitting(true);
      await placeOrder();
      await clearCart();
      toast({
        title: "Order placed",
        description: "Your delivery is on the way.",
      });
      navigate("/orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order failed";
      toast({ title: "Order failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Checkout" subtitle="Confirm address and payment" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-500" />
              <h3 className="text-lg font-semibold">Delivery address</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Street address" />
              <Input placeholder="City" />
              <Textarea placeholder="Delivery instructions" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-500" />
              <h3 className="text-lg font-semibold">Payment method</h3>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="card" className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit / Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI / Wallet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Order summary</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Payable amount</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
            <Button className="w-full" onClick={handlePlaceOrder} disabled={submitting}>
              {submitting ? "Placing order..." : "Place order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
