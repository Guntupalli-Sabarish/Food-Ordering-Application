import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CookingPot, Bike, Package, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrderById } from "@/apis";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatCurrency } from "@/utils/format";
import type { Order, OrderStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

const steps: Array<{ status: OrderStatus; label: string; description: string; icon: typeof Package }> = [
  { status: "PLACED", label: "Order placed", description: "Restaurant has received your order", icon: Package },
  { status: "ACCEPTED", label: "Accepted", description: "Restaurant has accepted your order", icon: CheckCircle2 },
  { status: "PREPARING", label: "Preparing", description: "The kitchen is cooking your meal", icon: CookingPot },
  { status: "OUT_FOR_DELIVERY", label: "On the way", description: "Your rider is heading your way", icon: Bike },
  { status: "DELIVERED", label: "Delivered", description: "Enjoy your meal!", icon: CheckCircle2 },
];

const statusOrder: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle("Order Tracking");

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        if (active) {
          setOrder(res);
        }
      })
      .catch(() => {
        if (active) {
          toast({ title: "Error", description: "Failed to load order tracking details", variant: "destructive" });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-fade-in">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-foreground">Order not found</h2>
        <p className="text-sm text-muted-foreground">This order doesn't exist or may have been removed.</p>
        <button
          className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          onClick={() => navigate("/orders")}
        >
          ← Back to orders
        </button>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(order.status);
  const isActive = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      {/* Order header */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 card-elevated">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">{order.restaurantName}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Order #{String(order.id).slice(-6).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
              {formatCurrency(order.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div className="space-y-1 border-t border-border pt-4">
            {order.items.map((oi, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {oi.quantity}× {oi.item?.name ?? "Item"}
                </span>
                {oi.item?.price && (
                  <span className="font-medium text-foreground">
                    {formatCurrency(oi.item.price * oi.quantity)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delivery info */}
        <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
          <span className="line-clamp-1">{order.deliveryAddress ?? "Delivery address not specified"}</span>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="rounded-2xl border border-border bg-card p-6 card-elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-foreground">Live tracking</h2>
          {isActive && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400">
              <Clock className="h-3.5 w-3.5" />
              <span className="pulse-dot">Live</span>
            </span>
          )}
        </div>

        {/* Steps */}
        <ol className="space-y-0">
          {steps.map((step, index) => {
            const isDone = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const isLast = index === steps.length - 1;
            const Icon = step.icon;

            return (
              <li key={step.status} className="flex gap-4">
                {/* Left: icon + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                      isDone
                        ? isCurrent
                          ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                          : "bg-brand-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {!isLast && (
                    <div
                      className={`my-1 w-0.5 flex-1 rounded-full transition-all duration-700 ${
                        index < currentIndex ? "bg-brand-500" : "bg-border"
                      }`}
                      style={{ minHeight: "2rem" }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                  <p
                    className={`font-semibold transition-colors ${
                      isDone ? "text-foreground" : "text-muted-foreground"
                    } ${isCurrent ? "text-brand-600 dark:text-brand-400" : ""}`}
                  >
                    {step.label}
                    {isCurrent && isActive && (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {order.status === "DELIVERED" && (
          <div className="mt-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">🎉 Delivered!</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Your order was delivered successfully. Enjoy!</p>
          </div>
        )}
      </div>
    </div>
  );
};
