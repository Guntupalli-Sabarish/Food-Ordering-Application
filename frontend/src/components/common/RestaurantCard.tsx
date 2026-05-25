import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => (
  <Link to={`/restaurants/${restaurant.id}`}>
    <Card className="overflow-hidden transition hover:shadow-lg">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-40 w-full object-cover"
      />
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {restaurant.cuisine} • {restaurant.priceLevel}
            </p>
          </div>
          <Badge className="bg-emerald-500 text-white">
            <Star className="mr-1 h-3 w-3" />
            {restaurant.rating}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {restaurant.etaMinutes} min
        </div>
        <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  </Link>
);
