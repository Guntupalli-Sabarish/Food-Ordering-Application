import { Link } from "react-router-dom";
import { Star, Clock, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => (
  <Link to={`/restaurants/${restaurant.id}`} className="group block">
    <article className="overflow-hidden rounded-2xl bg-card border border-border card-elevated cursor-pointer">
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Rating badge pinned on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-white">{restaurant.rating}</span>
        </div>
        {/* ETA badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
          <Clock className="h-3 w-3 text-white" />
          <span className="text-xs font-semibold text-white">{restaurant.etaMinutes} min</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {restaurant.cuisine} · {restaurant.priceLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bike className="h-3.5 w-3.5 shrink-0" />
          <span>{restaurant.freeDelivery ? "Free delivery" : "Delivery: ₹39"}</span>
          <span className="mx-1 text-border">·</span>
          <span>Min. ₹149</span>
        </div>

        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {restaurant.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Dynamic Menu Statistics Section */}
        {restaurant.topRatedItem && (
          <div className="pt-2.5 mt-2.5 border-t border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                ⭐ Top Item:
              </span>
              <span className="truncate text-foreground font-medium max-w-[130px]" title={restaurant.topRatedItem.name}>
                {restaurant.topRatedItem.name}
              </span>
              <span className="font-bold text-foreground ml-auto">
                ₹{restaurant.topRatedItem.price}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
              <span className="truncate max-w-[150px]">Min: {restaurant.minItem?.name}</span>
              <span className="font-medium text-foreground">₹{restaurant.minItem?.price}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[10px] opacity-80">
              <span className="truncate max-w-[150px]">Max: {restaurant.maxItem?.name}</span>
              <span className="font-medium text-foreground">₹{restaurant.maxItem?.price}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  </Link>
);
