import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, Tag, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getRestaurantById, getMenuForRestaurant } from "@/apis";
import type { Restaurant, MenuItem } from "@/types";

export const CartPage = () => {
  usePageTitle("Cart");
  const navigate = useNavigate();
  const { cartItems, totalAmount, removeItem, updateQuantity, addItem } = useCart();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [, setLoadingMenu] = useState(false);

  useEffect(() => {
    if (cartItems.length > 0) {
      const restaurantId = cartItems[0].item.restaurantId;
      setLoadingRestaurant(true);
      getRestaurantById(restaurantId)
        .then(setRestaurant)
        .catch(console.error)
        .finally(() => setLoadingRestaurant(false));
    } else {
      setRestaurant(null);
    }
  }, [cartItems]);

  useEffect(() => {
    if (restaurant) {
      setLoadingMenu(true);
      getMenuForRestaurant(restaurant.id)
        .then(setMenuItems)
        .catch(console.error)
        .finally(() => setLoadingMenu(false));
    } else {
      setMenuItems([]);
    }
  }, [restaurant]);

  const recommendations = useMemo(() => {
    const inCartIds = new Set(cartItems.map((ci) => ci.item.id));
    return menuItems.filter((item) => !inCartIds.has(item.id) && item.price < 200);
  }, [menuItems, cartItems]);

  const isFreeDelivery = restaurant?.freeDelivery || totalAmount >= 299;
  const deliveryFee = isFreeDelivery ? 0 : 40;
  const taxes = Math.round(totalAmount * 0.08);
  const total = totalAmount + deliveryFee + taxes;

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 text-center animate-fade-in p-4">
        <div className="w-64 h-64 mb-4">
          <img 
            src="https://illustrations.popsy.co/amber/taking-notes.svg" 
            alt="Empty Cart" 
            className="w-full h-full object-contain opacity-80"
          />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Your cart is empty</h2>
          <p className="text-muted-foreground text-base">
            Looks like you haven't added anything yet.<br/>Browse restaurants and discover something delicious.
          </p>
        </div>
        <Button
          onClick={() => navigate("/restaurants")}
          size="lg"
          className="mt-4 rounded-full px-10 btn-brand-gradient text-white border-0 shadow-lg shadow-brand-500/25"
        >
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-32 lg:pb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your cart</h1>
          <p className="text-sm text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Restaurant & Cart Items */}
          <div className="space-y-6">
            
            {/* Restaurant Summary Card */}
            {loadingRestaurant ? (
              <div className="h-24 rounded-2xl border border-border bg-card animate-pulse flex items-center justify-center">
                 <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
              </div>
            ) : restaurant ? (
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500" />
                <div>
                  <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">Ordering From</p>
                  <h2 className="text-xl font-bold text-foreground">{restaurant.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{restaurant.cuisine}</span>
                    <span>•</span>
                    <span>{restaurant.etaMinutes} mins</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" /> 
                      {restaurant.rating}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block shrink-0">
                  <div className="h-16 w-16 rounded-xl overflow-hidden border border-border">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Free Delivery Progress Bar */}
            {restaurant && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <span className="text-xl">🚚</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {isFreeDelivery 
                        ? "🎉 You qualify for FREE delivery!" 
                        : `Add ${formatCurrency(299 - totalAmount)} more for FREE delivery!`
                      }
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isFreeDelivery 
                        ? "Your order qualifies for free delivery from this restaurant." 
                        : `Get free delivery when you spend ₹299 or more.`
                      }
                    </p>
                  </div>
                </div>
                
                {/* Progress track */}
                <div className="relative w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      isFreeDelivery ? "bg-emerald-500" : "btn-brand-gradient"
                    }`}
                    style={{ width: `${Math.min((totalAmount / 299) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="space-y-4">
              {cartItems.map((cart) => (
                <div
                  key={cart.item.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand-500/20"
                >
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
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
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-semibold text-foreground">{cart.item.name}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(cart.item.id)}
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{formatCurrency(cart.item.price)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm font-bold text-foreground">
                        {formatCurrency(cart.item.price * cart.quantity)}
                      </p>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-3 rounded-full border border-border bg-background px-1 py-1 shadow-sm">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-full text-foreground hover:bg-muted"
                          onClick={() => updateQuantity(cart.item.id, cart.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="min-w-[1.25rem] text-center text-sm font-semibold text-foreground">
                          {cart.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 rounded-full text-foreground hover:bg-muted"
                          onClick={() => updateQuantity(cart.item.id, cart.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Add-ons Carousel */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                  Complete your meal
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col bg-card border border-border rounded-2xl p-3 shadow-sm w-44 shrink-0 hover:border-brand-500/20 transition-all group relative"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted mb-2 relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                        )}
                        {/* Veg / Non-Veg Indicator Overlay */}
                        <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm p-1 rounded-md">
                          {item.isVeg ? (
                            <span className="flex h-3 w-3 items-center justify-center rounded border border-emerald-500 shrink-0 bg-white">
                              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                            </span>
                          ) : (
                            <span className="flex h-3 w-3 items-center justify-center rounded border border-rose-500 shrink-0 bg-white">
                              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <p className="font-semibold text-xs text-foreground line-clamp-1 group-hover:text-brand-500 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                            {item.category}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-foreground">
                            {formatCurrency(item.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addItem(item)}
                            className="h-7 px-3 text-[10px] font-bold rounded-full btn-brand-gradient text-white border-0 hover:scale-105 transition-transform"
                          >
                            + Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo code */}
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-brand-500/30 bg-brand-500/5 p-4">
              <Tag className="h-5 w-5 text-brand-500 shrink-0" />
              <input
                placeholder="Have a promo code?"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground font-medium outline-none"
              />
              <Button size="sm" variant="ghost" className="text-brand-600 font-bold hover:bg-brand-500/10 rounded-full">
                Apply
              </Button>
            </div>
          </div>

          {/* Right Column: Order summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground tracking-tight">Order Summary</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Items ({cartItems.length})</span>
                  <span className="font-medium text-foreground">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery fee</span>
                  <span className="font-medium text-foreground">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-1">Taxes <Info className="h-3 w-3" /></span>
                  <span className="font-medium text-foreground">{formatCurrency(taxes)}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-foreground text-base">Grand Total</span>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Desktop Checkout Button */}
              <Button
                className="hidden lg:flex w-full rounded-xl btn-brand-gradient border-0 text-white font-bold py-6 text-lg shadow-lg shadow-brand-500/25 transition-transform hover:-translate-y-0.5"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="hidden lg:flex items-center justify-center gap-2 mt-6 text-xs font-medium text-muted-foreground">
              <ShieldIcon className="h-4 w-4" />
              Secure checkout powered by FoodFlow
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-50 px-4 lg:hidden animate-fade-in">
        <div className="mx-auto flex max-w-lg w-full items-center justify-between rounded-2xl glass-card p-4 shadow-2xl">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Total Pay</span>
            <span className="text-lg font-black text-foreground leading-none mt-1">{formatCurrency(total)}</span>
          </div>
          <Button
            className="rounded-xl btn-brand-gradient border-0 text-white font-bold h-12 px-6 text-sm shadow-md"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </>
  );
};

// --- Icons ---
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
