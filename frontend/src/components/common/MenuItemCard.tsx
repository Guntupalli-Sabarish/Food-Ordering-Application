import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  const [count, setCount] = useState(0);

  const handleAdd = () => {
    setCount((c) => c + 1);
    onAdd(item);
  };

  const handleMinus = () => {
    if (count > 0) setCount((c) => c - 1);
  };

  return (
    <article className="group flex gap-4 rounded-xl border border-border bg-card p-4 card-elevated">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {item.isVeg ? (
              <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-emerald-500 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded border-2 border-rose-500 shrink-0">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
              </span>
            )}
            <h4 className="truncate text-sm font-semibold text-foreground">{item.name}</h4>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-foreground">₹{item.price}</span>

          {count === 0 ? (
            <Button
              size="sm"
              onClick={handleAdd}
              className="h-8 px-4 text-xs rounded-full btn-brand-gradient text-white border-0"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1 rounded-full btn-brand-gradient p-0.5 text-white shadow-sm shadow-brand-500/20">
              <Button
                size="icon"
                variant="ghost"
                onClick={handleMinus}
                className="h-7 w-7 rounded-full text-white hover:bg-white/10 hover:text-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="min-w-[1.25rem] text-center text-sm font-bold text-white">
                {count}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAdd}
                className="h-7 w-7 rounded-full text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
