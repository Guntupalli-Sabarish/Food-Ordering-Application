import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, MapPin, Star, ShoppingBag, ArrowLeft, ChevronRight, Search, X } from "lucide-react";
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
  
  // Interactive Filter States
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  usePageTitle(restaurant?.name ?? "Menu");

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.category)));
  }, [items]);

  // Real-time filtering logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVeg = !vegOnly || item.isVeg === true;

      return matchesSearch && matchesVeg;
    });
  }, [items, searchQuery, vegOnly]);

  // Determine which categories actually have matching items
  const activeCategories = useMemo(() => {
    return categories.filter((cat) =>
      filteredItems.some((item) => item.category === cat)
    );
  }, [categories, filteredItems]);

  const scrollToCategory = (cat: string) => {
    const elementId = `category-${cat.replace(/\s+/g, "-")}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return <SkeletonMenu />;
  }

  return (
    <>
      <div className="space-y-0 animate-fade-in pb-20">
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

        {/* Search & Veg Toggle Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-card border border-border shadow-sm mb-6">
          {/* Search bar inside menu */}
          <div className="relative w-full sm:max-w-md bg-secondary/50 border border-border focus-within:border-brand-500 rounded-xl flex items-center px-3 py-2 transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search items on this menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 pl-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-0.5 rounded-full hover:bg-secondary text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              vegOnly
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400"
            }`}
          >
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded border-2 border-emerald-500 shrink-0">
              <span className={`h-2.5 w-2.5 rounded-full bg-emerald-500 transition-all ${vegOnly ? "scale-100 animate-scale-bounce" : "scale-0"}`} />
            </span>
            Veg Only
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* Category sidebar – desktop (Sticky) */}
          {activeCategories.length > 1 && (
            <nav className="hidden md:flex flex-col gap-1 w-44 shrink-0 sticky top-24 h-fit max-h-[70vh] overflow-y-auto pr-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Menu</p>
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    scrollToCategory(cat);
                  }}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all text-left ${
                    (activeCategory ?? activeCategories[0]) === cat
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
                </button>
              ))}
            </nav>
          )}

          {/* Category tabs – mobile (Sticky below header) */}
          {activeCategories.length > 1 && (
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sticky top-16 bg-background/95 backdrop-blur-md z-40 py-2 border-b border-border">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    scrollToCategory(cat);
                  }}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                    (activeCategory ?? activeCategories[0]) === cat
                      ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                      : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Menu items grouped by category */}
          <div className="flex-1 space-y-8 min-w-0">
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => {
                const catItems = filteredItems.filter((item) => item.category === cat);
                const vegItems = catItems.filter((item) => item.isVeg);
                const nonVegItems = catItems.filter((item) => !item.isVeg);
                return (
                  <section
                    key={cat}
                    id={`category-${cat.replace(/\s+/g, "-")}`}
                    className="space-y-4 scroll-mt-24 md:scroll-mt-28"
                  >
                    <h2 className="text-base font-extrabold text-foreground border-b border-border pb-2 px-1 uppercase tracking-wider flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-28 md:top-24 z-10 py-1.5">
                      <span>{cat}</span>
                      <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                        {catItems.length}
                      </span>
                    </h2>
                    
                    <div className="space-y-6 pt-1">
                      {vegItems.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 rounded-xl w-fit shadow-sm">
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-emerald-500 shrink-0 bg-white dark:bg-card">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            </span>
                            Vegetarian Selection
                          </div>
                          <div className="space-y-3">
                            {vegItems.map((item) => (
                              <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                            ))}
                          </div>
                        </div>
                      )}

                      {nonVegItems.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-500/5 border border-rose-500/10 rounded-xl w-fit shadow-sm">
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded border border-rose-500 shrink-0 bg-white dark:bg-card">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            </span>
                            Non-Vegetarian Selection
                          </div>
                          <div className="space-y-3">
                            {nonVegItems.map((item) => (
                              <MenuItemCard key={item.id} item={item} onAdd={addItem} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-20 text-center border border-dashed border-border rounded-3xl bg-card/10 backdrop-blur-sm">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-lg font-bold text-foreground">No menu items found</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                  No dishes matched your search or diet filters. Try resetting search or checking another category.
                </p>
                {(searchQuery || vegOnly) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setVegOnly(false);
                    }}
                    className="mt-4 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating cart bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-50 md:bottom-6 px-4 animate-fade-in">
          <button
            onClick={() => navigate("/cart")}
            className="mx-auto flex max-w-lg w-full items-center justify-between rounded-2xl btn-brand-gradient px-5 py-3.5 text-white shadow-2xl transition-transform hover:scale-[1.02]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingBag className="h-4 w-4" />
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
            </span>
            <span className="text-sm font-bold">{formatCurrency(totalAmount)} →</span>
          </button>
        </div>
      )}
    </>
  );
};
