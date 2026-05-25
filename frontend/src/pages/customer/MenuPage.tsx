import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuItemCard } from "@/components/common/MenuItemCard";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";

export const MenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurant, items, loading } = useMenu(id ?? "");
  const { cartItems, totalAmount, addItem } = useCart();

  usePageTitle(restaurant?.name ?? "Menu");

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category)));
  }, [items]);

  return (
    <div className="space-y-6">
      {loading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : restaurant ? (
        <Card className="overflow-hidden">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold text-slate-900">
                {restaurant.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {restaurant.cuisine} • {restaurant.priceLevel}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {restaurant.etaMinutes} min delivery
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  1.2 km away
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4 text-sm">
              <p className="font-semibold text-slate-900">Cart summary</p>
              <p className="text-muted-foreground">{cartItems.length} items</p>
              <p className="mt-2 text-lg font-semibold">
                {formatCurrency(totalAmount)}
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => navigate("/cart")}
              >
                View cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900">{category}</h3>
            <div className="grid gap-6 md:grid-cols-3">
              {items
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
