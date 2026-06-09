import { CheckCircle2, CookingPot, Bike, Package, CreditCard } from "lucide-react";
import type { OrderStatus } from "@/types";

const steps: Array<{ status: OrderStatus; label: string; icon: typeof Bike }> = [
  { status: "PENDING_PAYMENT", label: "Awaiting Payment", icon: CreditCard },
  { status: "PLACED", label: "Order placed", icon: Package },
  { status: "PREPARING", label: "Kitchen prep", icon: CookingPot },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery", icon: Bike },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2 },
];

interface OrderTimelineProps {
  current: OrderStatus;
}

export const OrderTimeline = ({ current }: OrderTimelineProps) => {
  // For normal orders (PLACED and beyond), hide the PENDING_PAYMENT step
  const visibleSteps =
    current === "PENDING_PAYMENT"
      ? steps
      : steps.filter((s) => s.status !== "PENDING_PAYMENT");

  return (
    <div className="space-y-4">
      {current === "PENDING_PAYMENT" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-800 dark:text-amber-300 mb-2">
          <span className="text-lg leading-none">⚠️</span>
          <p className="font-medium">This order is awaiting payment confirmation before it can be prepared.</p>
        </div>
      )}
      {visibleSteps.map((step) => {
        const currentIndex = visibleSteps.findIndex((s) => s.status === current);
        const stepIndex = visibleSteps.findIndex((s) => s.status === step.status);
        const isActive = currentIndex >= stepIndex;
        const Icon = step.icon;
        return (
          <div key={step.status} className="flex items-center gap-4">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isActive
                  ? step.status === "PENDING_PAYMENT"
                    ? "bg-amber-500 text-white"
                    : "bg-brand-500 text-white"
                  : "bg-orange-100 text-brand-500"
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
};
