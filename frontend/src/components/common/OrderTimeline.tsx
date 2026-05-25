import { CheckCircle2, CookingPot, Bike, Package } from "lucide-react";
import type { OrderStatus } from "@/types";

const steps: Array<{ status: OrderStatus; label: string; icon: typeof Bike }> = [
  { status: "PLACED", label: "Order placed", icon: Package },
  { status: "PREPARING", label: "Kitchen prep", icon: CookingPot },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: Bike },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

interface OrderTimelineProps {
  current: OrderStatus;
}

export const OrderTimeline = ({ current }: OrderTimelineProps) => (
  <div className="space-y-4">
    {steps.map((step) => {
      const isActive = steps.findIndex((s) => s.status === current) >=
        steps.findIndex((s) => s.status === step.status);
      const Icon = step.icon;
      return (
        <div key={step.status} className="flex items-center gap-4">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isActive ? "bg-brand-500 text-white" : "bg-orange-100 text-brand-500"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-medium text-slate-900">{step.label}</p>
            <p className="text-xs text-muted-foreground">
              {isActive ? "In progress" : "Pending"}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);
