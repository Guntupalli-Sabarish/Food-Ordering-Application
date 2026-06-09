import { useNavigate } from "react-router-dom";
import { Clock, RefreshCw, ChevronRight, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";

const statusConfig: Record<
  string,
  { label: string; className: string; emoji: string }
> = {
  PLACED: { label: "Placed", className: "status-placed", emoji: "📦" },
  PREPARING: { label: "Preparing", className: "status-preparing", emoji: "👨‍🍳" },
  OUT_FOR_DELIVERY: { label: "On the way", className: "status-out_for_delivery", emoji: "🛵" },
  DELIVERED: { label: "Delivered", className: "status-delivered", emoji: "✅" },
  CANCELLED: { label: "Cancelled", className: "status-cancelled", emoji: "❌" },
};

const SkeletonOrder = () => (
  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
    <div className="flex justify-between">
      <div className="space-y-2">
        <div className="h-4 w-40 shimmer rounded-md" />
        <div className="h-3 w-28 shimmer rounded-md" />
      </div>
      <div className="h-6 w-20 shimmer rounded-full" />
    </div>
    <div className="h-3 w-3/4 shimmer rounded-md" />
    <div className="h-3 w-1/2 shimmer rounded-md" />
  </div>
);

export const OrderHistoryPage = () => {
  usePageTitle("Orders");
  const navigate = useNavigate();
  const { data, loading } = useOrders();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <Clock className="inline mr-2 h-6 w-6 text-brand-500" />
          Order history
        </h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${data.length} order${data.length !== 1 ? "s" : ""} total`}
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonOrder key={i} />)
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
              <ShoppingBag className="h-8 w-8 text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No orders yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your order history will appear here
              </p>
            </div>
            <Button
              onClick={() => navigate("/restaurants")}
              className="btn-brand-gradient rounded-full px-6 border-0 text-white"
            >
              Browse restaurants
            </Button>
          </div>
        ) : (
          data.map((order) => {
            const status = statusConfig[order.status] ?? {
              label: order.status,
              className: "bg-muted text-muted-foreground",
              emoji: "📋",
            };
            const isActive = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status);

            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-border bg-card p-5 card-elevated cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}/track`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/orders/${order.id}/track`)}
                aria-label={`View order from ${order.restaurantName}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Restaurant info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-2xl">
                      {status.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {order.restaurantName ?? "Restaurant"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Order #{String(order.id).slice(-6).toUpperCase()}
                        <span className="mx-1">·</span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status + chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {isActive && (
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                      )}
                      {status.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>

                {/* Items list */}
                {order.items && order.items.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-1">
                    {order.items.map((i) => `${i.quantity}× ${i.item?.name ?? "Item"}`).join("  ·  ")}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-base font-bold text-foreground">
                    {formatCurrency(order.total)}
                  </p>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-xs h-8"
                      onClick={() => navigate(`/orders/${order.id}/track`)}
                    >
                      {isActive ? "Track order" : "View details"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full text-xs h-8 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Reorder
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
