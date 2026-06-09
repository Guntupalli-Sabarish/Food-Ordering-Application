import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, MapPin, Star, Search, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
import { MenuItemCard } from "@/components/common/MenuItemCard";
import { useMenu } from "@/hooks/useMenu";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";

const SkeletonMenu = () => (
  <div className="space-y-4">
    <div className="h-56 shimmer rounded-3xl" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-4">
        <div className="h-24 w-24 shimmer rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 shimmer rounded-md" />
          <div className="h-3 w-1/2 shimmer rounded-md" />
          <div className="h-3 w-1/4 shimmer rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export const MenuPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { restaurant, items, loading } = useMenu(id ?? "");
  const { cartItems, totalAmount, addItem } = useCart();
  const [menuSearch, setMenuSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  usePageTitle(restaurant?.name ?? "Menu");

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category)));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description ?? "").toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [items, menuSearch]);

  const displayCategory = activeCategory ?? categories[0] ?? null;

  const categoryItems = filteredItems.filter(
    (item) => !displayCategory || menuSearch.trim() !== "" || item.category === displayCategory
  );

  const displayItems = menuSearch.trim() !== "" ? filteredItems : categoryItems;

  if (loading) {
    return <SkeletonMenu />;
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to restaurants
      </button>

      {/* Restaurant hero */}
      {restaurant && (
        <div className="relative overflow-hidden rounded-3xl mb-6">
          {/* Banner image */}
          <div className="h-52 w-full overflow-hidden rounded-3xl bg-muted">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl" />
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <h1 className="text-2xl font-bold leading-tight">{restaurant.name}</h1>
            <p className="text-sm text-white/75 mt-0.5">
              {restaurant.cuisine} · {restaurant.priceLevel}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/80">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {restaurant.rating} rating
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {restaurant.etaMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                1.2 km away
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Menu search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search menu items…"
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-6">
        {/* Category sidebar – desktop */}
        {categories.length > 1 && menuSearch.trim() === "" && (
          <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Menu</p>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left ${
                  (activeCategory ?? categories[0]) === cat
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </nav>
        )}

        {/* Category tabs – mobile */}
        {categories.length > 1 && menuSearch.trim() === "" && (
          <div className="flex md:hidden gap-2 overflow-x-auto mb-4 pb-1 shrink-0 w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
                  (activeCategory ?? categories[0]) === cat
                    ? "bg-brand-500 text-white border-brand-500"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu items */}
        <div className="flex-1 space-y-3 min-w-0">
          {menuSearch.trim() !== "" && (
            <p className="text-sm text-muted-foreground mb-3">
              {displayItems.length} result{displayItems.length !== 1 ? "s" : ""} for &ldquo;{menuSearch}&rdquo;
            </p>
          )}
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={addItem} />
            ))
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-foreground">No items found</p>
              <p className="text-sm text-muted-foreground">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating cart bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 md:bottom-6 px-4">
          <button
            onClick={() => navigate("/cart")}
            className="mx-auto flex max-w-lg w-full items-center justify-between rounded-2xl btn-brand-gradient px-5 py-3.5 text-white shadow-2xl"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" />
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
            </span>
            <span className="text-sm font-bold">{formatCurrency(totalAmount)} →</span>
          </button>
        </div>
      )}
    </div>
  );
};
