import { Sparkles, Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/common/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="space-y-10 animate-fade-in">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-orange-400 p-8 text-white shadow-2xl">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative space-y-4 max-w-lg">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Curated for your cravings
          </p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            Food you love,
            <br />
            <span className="text-white/80">delivered fast</span>
          </h1>
          <p className="text-sm text-white/75 max-w-sm">
            Discover the best restaurants near you. Track live orders and reorder your favorites in seconds.
          </p>

          <Button
            onClick={() => navigate("/restaurants")}
            className="rounded-xl bg-white text-brand-600 hover:bg-white/90 font-semibold px-6 py-2.5 shadow-md"
          >
            Explore Restaurants
          </Button>
        </div>
      </section>

      {/* ─── Promo Cards ─── */}
      <section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {promoCards.map((card) => (
            <div
              key={card.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} p-5 text-white cursor-pointer transition-transform duration-200 hover:-translate-y-1 shadow-lg`}
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
              onClick={() => navigate("/restaurants")}
              className={`group flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br ${cat.color} border border-border p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-foreground">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ─── Featured Restaurants ─── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              <Flame className="inline mr-2 h-5 w-5 text-brand-500" />
              Featured restaurants
            </h2>
            <p className="text-sm text-muted-foreground">Top-rated spots near you</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => navigate("/restaurants")}
          >
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : data.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
        </div>
      </section>
    </div>
  );
};
