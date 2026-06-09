import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, ArrowLeft, Loader2, Store, ReceiptText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { placeOrder, getCheckoutQuote, getRestaurantById } from "@/apis";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import type { Restaurant } from "@/types";

interface QuoteState {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export const CheckoutPage = () => {
  usePageTitle("Checkout");
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState(false);
  const [quote, setQuote] = useState<QuoteState | null>(null);
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  // Form states
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    let active = true;
    setLoadingQuote(true);
    setQuoteError(false);
    
    // Fetch quote
    getCheckoutQuote()
      .then((data) => {
        if (active) setQuote(data);
      })
      .catch((error) => {
        if (!active) return; // Component unmounted — do not show stale toasts
        const message = error instanceof Error ? error.message : "Failed to load quote";
        // Match backend messages: "Cart is empty", "no longer available", "unavailable", "empty cart"
        const isEmptyCart = message.toLowerCase().includes("cart is empty") ||
          message.toLowerCase().includes("empty cart");
        const isStaleItemError = isEmptyCart ||
          message.toLowerCase().includes("unavailable") ||
          message.toLowerCase().includes("no longer");
        if (isEmptyCart) {
          // Cart is empty — stay silent; the empty-cart UI will be shown instead
          if (active) setQuoteError(true);
        } else if (isStaleItemError) {
          setQuoteError(true);
          toast({
            title: "Some items are no longer available",
            description: "Please review your cart before continuing.",
            variant: "destructive",
          });
        } else {
          toast({ title: "Checkout Quote failed", description: message, variant: "destructive" });
        }
      })
      .finally(() => {
        if (active) setLoadingQuote(false);
      });
      
    // Fetch Restaurant
    if (cartItems.length > 0) {
      getRestaurantById(cartItems[0].item.restaurantId)
        .then((data) => {
          if (active) setRestaurant(data);
        })
        .catch(console.error);
    }

    return () => { active = false; };
  }, [toast, cartItems]);

  const handlePlaceOrder = async () => {
    if (submitting || loadingQuote) return;
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
      const order = await placeOrder(deliveryAddress, paymentMethod);
      // Online payment initiation is disabled until a real payment provider is integrated.
      // COD orders are accepted immediately.

      await clearCart();
      toast({ title: "Order placed successfully!", description: "Your delivery is being prepared." });
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-5">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
        <p className="text-base font-medium text-muted-foreground">Preparing your secure checkout...</p>
      </div>
    );
  }

  if (!quote || quote.total === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center p-4">
        <div className="w-48 h-48 mb-2 opacity-70">
          <img src="https://illustrations.popsy.co/amber/taking-notes.svg" alt="Empty" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground max-w-sm mb-4">You need to add items to your cart before you can checkout.</p>
        <Button onClick={() => navigate("/restaurants")} size="lg" className="rounded-full px-8 btn-brand-gradient">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-32 lg:pb-8 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground font-medium">Almost there, secure your order</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        
        {/* Left Column: Forms */}
        <div className="space-y-6">
          
          {/* Ordering From Summary */}
          {restaurant && (
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
              <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 border border-border">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Ordering From</p>
                <h3 className="text-lg font-bold text-foreground leading-tight">{restaurant.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{restaurant.cuisine} • {restaurant.etaMinutes} mins</p>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 flex flex-row items-center gap-2">
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold">Delivery Address</h3>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor="street" className="text-xs uppercase font-bold text-muted-foreground">Street & Area *</Label>
                <Input
                  id="street"
                  placeholder="e.g. 123 Main St, Apartment 4B"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="rounded-xl h-12"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs uppercase font-bold text-muted-foreground">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g. Vijayawada, AP"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="rounded-xl h-12"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="instructions" className="text-xs uppercase font-bold text-muted-foreground">Delivery Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g. Please ring the doorbell and leave at the front gate."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="rounded-xl resize-none min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 flex flex-row items-center gap-2">
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold">Payment Method</h3>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-800 dark:text-amber-300">
                <span className="text-lg leading-none">⚠️</span>
                <p>Online payment (Card &amp; UPI) is currently unavailable. Only Cash on Delivery is supported at this time.</p>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                <Label htmlFor="cod" className="flex items-center gap-3 p-4 rounded-xl border border-brand-500 bg-brand-500/5 cursor-pointer">
                  <RadioGroupItem value="cod" id="cod" />
                  <span className="font-semibold text-sm flex-1">Cash on Delivery</span>
                  <Store className="h-5 w-5 text-muted-foreground" />
                </Label>
                <Label htmlFor="card" className="flex items-center gap-3 p-4 rounded-xl border border-border opacity-40 cursor-not-allowed select-none">
                  <RadioGroupItem value="card" id="card" disabled />
                  <span className="font-semibold text-sm flex-1 text-muted-foreground">Credit / Debit Card (unavailable)</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-blue-600/50 rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                    <div className="w-8 h-5 bg-red-500/50 rounded flex items-center justify-center text-[8px] text-white font-bold">MC</div>
                  </div>
                </Label>
                <Label htmlFor="upi" className="flex items-center gap-3 p-4 rounded-xl border border-border opacity-40 cursor-not-allowed select-none">
                  <RadioGroupItem value="upi" id="upi" disabled />
                  <span className="font-semibold text-sm flex-1 text-muted-foreground">UPI / Wallet (unavailable)</span>
                  <div className="text-[10px] font-black italic text-muted-foreground">UPI</div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Order Review */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4 flex flex-row items-center gap-2">
              <div className="bg-brand-500/10 p-2 rounded-lg">
                <ReceiptText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-lg font-bold">Order Review</h3>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              
              {/* Item List Summary */}
              <div className="space-y-3">
                {cartItems.map(c => (
                  <div key={c.item.id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2 text-muted-foreground">
                      <span className="font-semibold text-foreground">{c.quantity}x</span>
                      <span className="line-clamp-2 pr-2">{c.item.name}</span>
                    </div>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatCurrency(c.item.price * c.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-border/70" />

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm font-medium text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(quote.deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxes (8%)</span>
                  <span>{formatCurrency(quote.tax)}</span>
                </div>
              </div>
              
              <div className="border-t border-border" />
              
              <div className="flex items-center justify-between font-black text-lg">
                <span>Final Total</span>
                <span className="text-brand-600 dark:text-brand-400">{formatCurrency(quote.total)}</span>
              </div>

              {/* Desktop Button */}
              <Button
                className="hidden lg:flex w-full rounded-xl btn-brand-gradient border-0 text-white font-bold h-14 text-lg shadow-lg shadow-brand-500/25 transition-transform hover:-translate-y-0.5"
                onClick={handlePlaceOrder}
                disabled={submitting || loadingQuote || quoteError}
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  `Place Order • ${formatCurrency(quote.total)}`
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="hidden lg:flex items-center justify-center gap-2 mt-6 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            100% secure payment processing
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/90 backdrop-blur-md border-t border-border lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full rounded-xl btn-brand-gradient border-0 text-white font-bold h-14 text-[17px] shadow-lg shadow-brand-500/25"
            onClick={handlePlaceOrder}
            disabled={submitting || loadingQuote || quoteError}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
            ) : (
              `Place Order • ${formatCurrency(quote.total)}`
            )}
          </Button>
        </div>
      </div>

    </div>
  );
};
