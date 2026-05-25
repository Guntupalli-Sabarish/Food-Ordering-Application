import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantCard } from "@/components/common/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { useRestaurants } from "@/hooks/useRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";

const filters = ["All", "North Indian", "Asian Fusion", "Italian", "Healthy"];

export const RestaurantsPage = () => {
  usePageTitle("Restaurants");
  const { data, loading } = useRestaurants();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(() => {
    return data.filter((restaurant) => {
      const matchQuery = restaurant.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchFilter =
        activeFilter === "All" || restaurant.cuisine === activeFilter;
      return matchQuery && matchFilter;
    });
  }, [data, query, activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        subtitle="Browse across cuisines and ratings"
        action={
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-full border px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants"
            className="border-0 bg-transparent focus-visible:ring-0"
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setQuery(event.target.value)
            }
          />
        </div>
        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
          <TabsList className="flex flex-wrap">
            {filters.map((filter) => (
              <TabsTrigger key={filter} value={filter}>
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-56 rounded-2xl" />
            ))
          : filtered.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
      </div>
    </div>
  );
};
