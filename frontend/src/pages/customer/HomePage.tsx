import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Flame, ArrowRight, Sun, Moon, Monitor, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/common/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTheme } from "@/context/ThemeProvider";

const categories = [
  { name: "Biryani", emoji: "🍛", color: "from-amber-500/20 to-orange-400/10" },
  { name: "Pizza", emoji: "🍕", color: "from-red-500/20 to-rose-400/10" },
  { name: "Burgers", emoji: "🍔", color: "from-yellow-500/20 to-amber-400/10" },
  { name: "Healthy", emoji: "🥗", color: "from-emerald-500/20 to-green-400/10" },
  { name: "Desserts", emoji: "🍰", color: "from-pink-500/20 to-rose-400/10" },
  { name: "South Indian", emoji: "🥘", color: "from-orange-500/20 to-amber-400/10" },
];

const promoCards = [
  {
    title: "50% off your first order",
    subtitle: "Use code FIRST50 at checkout",
    bg: "from-brand-500 to-orange-400",
    emoji: "🎉",
  },
  {
    title: "Free delivery today",
    subtitle: "On all orders above ₹299",
    bg: "from-emerald-500 to-teal-400",
    emoji: "🚀",
  },
  {
    title: "New kitchens added",
    subtitle: "Explore fresh local restaurants",
    bg: "from-violet-500 to-purple-400",
    emoji: "✨",
  },
];

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

export const HomePage = () => {
  usePageTitle("Home");
  const navigate = useNavigate();
  const { data, loading } = useRestaurants();
  const { mode, setMode } = useTheme();

  // Search and Category states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const quickCuisines = ["Biryani", "Pizza", "Burgers", "Healthy", "Desserts"];

  // Real-time filtering logic
  const filteredRestaurants = data.filter((restaurant) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      restaurant.name.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* ─── Top Bar (Welcome + Theme Switcher) ─── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Welcome to FoodFlow
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Satisfy your cravings with fast delivery and great food.
          </p>
        </div>
        
        {/* Sleek Theme Switcher Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border/60 shadow-sm backdrop-blur-sm self-start sm:self-auto">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((themeOpt) => {
            const isSelected = mode === themeOpt.id;
            const Icon = themeOpt.icon;
            return (
              <button
                key={themeOpt.id}
                onClick={() => setMode(themeOpt.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black tracking-wide uppercase transition-all duration-300 ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
                title={`${themeOpt.label} mode`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{themeOpt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-orange-400 p-8 text-white shadow-2xl">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative space-y-5 max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Curated for your cravings
          </p>
          <h1 className="text-3xl font-black leading-tight md:text-4xl lg:text-5xl tracking-tight">
            Food you love,
            <br />
            <span className="text-white/80">delivered fast</span>
          </h1>
          <p className="text-sm text-white/85 max-w-md">
            Discover the best restaurants near you. Track live orders and reorder your favorites in seconds.
          </p>

          {/* Search Bar inside Hero Card */}
          <div className="relative max-w-md w-full bg-white/15 backdrop-blur-md border border-white/20 hover:border-white/30 focus-within:border-white/50 rounded-2xl flex items-center px-4 py-2.5 transition-all shadow-lg group">
            <Search className="h-5 w-5 text-white/75 shrink-0" />
            <input
              type="text"
              placeholder="Search for restaurants, cuisines, or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 pl-3 pr-2 text-sm text-white placeholder-white/70 outline-none focus:ring-0 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors mr-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <Button
              onClick={() => navigate("/restaurants")}
              className="bg-white text-brand-600 hover:bg-white/95 text-xs font-bold px-4 py-1.5 rounded-xl transition-all hover:scale-105 shrink-0 shadow h-8"
            >
              Explore
            </Button>
          </div>

          {/* Quick Cuisine Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-white/70 font-semibold mr-1">Popular:</span>
            {quickCuisines.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => {
                  setSelectedCategory(cuisine);
                  setSearchQuery("");
                }}
                className="text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 px-3.5 py-1 rounded-full transition-all text-white"
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Promo Cards ─── */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {promoCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-5 text-white cursor-pointer transition-transform duration-300 hover:-translate-y-1 shadow-lg`}
            >
              <div className="pointer-events-none absolute -right-4 -top-4 text-6xl opacity-25 select-none">
                {card.emoji}
              </div>
              <p className="text-sm font-bold">{card.title}</p>
              <p className="mt-0.5 text-xs text-white/75">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Browse categories</h2>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"
            onClick={() => navigate("/restaurants")}
          >
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`group flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${cat.color} border p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                selectedCategory === cat.name
                  ? "border-brand-500 ring-2 ring-brand-500/20 scale-105"
                  : "border-border"
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
              <span className={`text-xs font-semibold ${selectedCategory === cat.name ? "text-brand-600 dark:text-brand-400 font-black" : "text-foreground"}`}>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Featured Restaurants ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-brand-500 animate-pulse" />
              {searchQuery || selectedCategory ? (
                <>
                  Found spots
                  <span className="text-sm font-semibold text-muted-foreground ml-1.5 bg-secondary px-2 py-0.5 rounded-lg border border-border">
                    {filteredRestaurants.length}
                  </span>
                </>
              ) : (
                "Featured restaurants"
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedCategory
                ? `Matching spots for ${selectedCategory ? selectedCategory : ""} ${
                    searchQuery ? `"${searchQuery}"` : ""
                  }`
                : "Top-rated spots near you"}
            </p>
          </div>
          
          {(searchQuery || selectedCategory) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants
              .slice(0, searchQuery || selectedCategory ? undefined : 6)
              .map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-border rounded-3xl bg-card/10 backdrop-blur-sm">
              <div className="text-5xl">🍽️</div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">No restaurants found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  We couldn't find any restaurants matching your selection. Try clearing filters or typing a different search query.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-semibold text-xs rounded-xl"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
