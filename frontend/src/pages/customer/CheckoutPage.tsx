import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { useCart } from "@/hooks/useCart";
import { placeOrder, getCheckoutQuote, initiatePayment, verifyPayment } from "@/apis";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

interface QuoteState {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export const CheckoutPage = () => {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quote, setQuote] = useState<QuoteState | null>(null);

  // Form states
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    let active = true;
    setLoadingQuote(true);
    getCheckoutQuote()
      .then((data) => {
        if (active) {
          setQuote(data);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load quote";
        toast({ title: "Checkout Quote failed", description: message, variant: "destructive" });
      })
      .finally(() => {
        if (active) {
          setLoadingQuote(false);
        }
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const handlePlaceOrder = async () => {
    if (!street || !city) {
      toast({
        title: "Validation error",
        description: "Please fill in your delivery address (street and city).",
        variant: "destructive",
      });
      return;
    }

    const deliveryAddress = `${street}, ${city}${instructions ? ` (Instructions: ${instructions})` : ""}`;

    try {
      setSubmitting(true);
      
      // 1. Place the order
      const order = await placeOrder(deliveryAddress, paymentMethod);
      
      // 2. Perform payment if it is an online method (card or upi)
      if (paymentMethod === "card" || paymentMethod === "upi") {
        toast({
          title: "Processing payment...",
          description: "Initiating payment gateway.",
        });
        
        // Initiate payment record on backend
        const payment = await initiatePayment(Number(order.id), paymentMethod);
        
        // Simulate payment completion
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Verify with backend using a simulated provider transaction token
        const txnId = `TXN_SUCCESS_${order.id}`;
        await verifyPayment(payment.paymentId, txnId);
        
        toast({
          title: "Payment successful",
          description: "Payment confirmed by gateway.",
        });
      }

      await clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your delivery is being prepared.",
      });
      navigate("/orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Order failed";
      toast({ title: "Order failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingQuote) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <p className="text-sm text-muted-foreground">Calculating your checkout quote...</p>
      </div>
    );
  }

  if (!quote || quote.total === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <p className="text-lg font-medium">Your cart is empty</p>
        <Button onClick={() => navigate("/restaurants")}>Browse Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Checkout" subtitle="Confirm address and payment" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-500" />
              <h3 className="text-lg font-semibold">Delivery address</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Street address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
              <Input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Textarea
                placeholder="Delivery instructions (e.g. ring bell, leave at gate)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-500" />
              <h3 className="text-lg font-semibold">Payment method</h3>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer">Credit / Debit Card (Online)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="cursor-pointer">UPI / Wallet (Online)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-24">
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Order summary</h3>
            <div className="space-y-2 text-sm text-muted-foreground border-b pb-4">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee</span>
                <span>{formatCurrency(quote.deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taxes & Charges (8%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between font-semibold text-base">
              <span>Total Payable</span>
              <span className="text-brand-600">{formatCurrency(quote.total)}</span>
            </div>
            <Button className="w-full" onClick={handlePlaceOrder} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place order"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
