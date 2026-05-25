import { Leaf, Drumstick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => (
  <Card className="flex flex-col overflow-hidden">
    <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
    <CardContent className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
        {item.isVeg ? (
          <Leaf className="h-4 w-4 text-emerald-500" />
        ) : (
          <Drumstick className="h-4 w-4 text-rose-500" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{item.description}</p>
      <div className="mt-auto flex items-center justify-between">
        <span className="text-base font-semibold">₹{item.price}</span>
        <Button size="sm" onClick={() => onAdd(item)}>
          Add
        </Button>
      </div>
    </CardContent>
  </Card>
);
