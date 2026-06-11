import { useMemo, useState } from "react";
import { SlidersHorizontal, Store } from "lucide-react";
import { RestaurantCard } from "@/components/common/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";

const filterOptions = ["All", "Top Rated", "Fast Delivery", "Budget", "Premium"];

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="h-44 shimmer" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 shimmer rounded-md" />
      <div className="h-3 w-1/2 shimmer rounded-md" />
      <div className="h-3 w-1/3 shimmer rounded-md" />
    </div>
  </div>
);

export const RestaurantsPage = () => {
  usePageTitle("Restaurants");
  const { data, loading } = useRestaurants();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const matchFilter =
        activeFilter === "All" ||
        (activeFilter === "Top Rated" && parseFloat(String(r.rating)) >= 4.0) ||
        (activeFilter === "Fast Delivery" && r.etaMinutes <= 30) ||
        (activeFilter === "Budget" && r.priceLevel === "₹") ||
        (activeFilter === "Premium" && r.priceLevel === "₹₹₹");
      return matchFilter;
    });
  }, [data, activeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          <Store className="inline mr-2 h-6 w-6 text-brand-500" />
          Restaurants
        </h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${data.length} restaurants available`}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 border ${
                activeFilter === f
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/30"
                  : "bg-card text-muted-foreground border-border hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>



      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length > 0 ? (
          filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-foreground">No restaurants found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <button
              className="mt-4 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
              onClick={() => setActiveFilter("All")}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
