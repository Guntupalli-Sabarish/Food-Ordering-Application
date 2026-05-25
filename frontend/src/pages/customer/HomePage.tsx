import { Search, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RestaurantCard } from "@/components/common/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";

const categories = [
  "Biryani",
  "Healthy Bowls",
  "Pizza",
  "Burgers",
  "Desserts",
  "South Indian",
];

const popularDishes = [
  {
    name: "Fiery Ramen",
    description: "Sichuan broth, slow-cooked pork, silky noodles.",
  },
  {
    name: "Avocado Poke",
    description: "Fresh tuna, pickled veggies, sesame crunch.",
  },
  {
    name: "Truffle Gnocchi",
    description: "Potato gnocchi, brown butter, herbs.",
  },
];

export const HomePage = () => {
  usePageTitle("Home");
  const { data, loading } = useRestaurants();

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl bg-white/80 p-8 shadow-lg md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Curated for your cravings
          </p>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Discover meals that feel crafted just for you.
          </h1>
          <p className="text-muted-foreground">
            Track live orders, browse best-rated kitchens, and reorder favorites in
            minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for dishes or restaurants"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <Button className="rounded-full">Explore now</Button>
          </div>
        </div>
        <div className="space-y-4 rounded-2xl bg-warm-gradient p-6">
          <h3 className="text-lg font-semibold text-slate-900">Popular dishes</h3>
          {popularDishes.map((dish) => (
            <Card key={dish.name} className="bg-white/80 shadow-sm">
              <CardContent className="space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-brand-500" />
                  <p className="font-semibold text-slate-900">{dish.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{dish.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Browse categories</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Card key={category} className="shadow-sm">
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-medium text-slate-900">{category}</span>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">
            Featured restaurants
          </h2>
          <Button variant="outline">View all</Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-2xl" />
              ))
            : data.slice(0, 4).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
        </div>
      </section>
    </div>
  );
};
