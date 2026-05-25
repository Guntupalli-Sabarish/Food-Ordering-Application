import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem } from "@/types";
import { formatCurrency } from "@/utils/format";

interface CartItemRowProps {
  cart: CartItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, quantity: number) => void;
}

export const CartItemRow = ({ cart, onRemove, onUpdate }: CartItemRowProps) => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-white p-4">
    <div>
      <p className="font-semibold text-slate-900">{cart.item.name}</p>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(cart.item.price)}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => onUpdate(cart.item.id, cart.quantity - 1)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-8 text-center font-medium">{cart.quantity}</span>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onUpdate(cart.item.id, cart.quantity + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onRemove(cart.item.id)}
      >
        <Trash2 className="h-4 w-4 text-rose-500" />
      </Button>
    </div>
  </div>
);
