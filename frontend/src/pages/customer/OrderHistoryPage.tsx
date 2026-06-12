import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  RefreshCw,
  ChevronRight,
  ShoppingBag,
  Store,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<
  string,
  { label: string; className: string; emoji: string }
> = {
  PENDING_PAYMENT: { 
    label: "Unpaid", 
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", 
    emoji: "💳" 
  },
  PLACED: { 
    label: "Placed", 
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", 
    emoji: "📦" 
  },
  ACCEPTED: { 
    label: "Accepted", 
    className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", 
    emoji: "🤝" 
  },
  PREPARING: { 
    label: "Preparing", 
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", 
    emoji: "👨‍🍳" 
  },
  OUT_FOR_DELIVERY: { 
    label: "On the way", 
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", 
    emoji: "🛵" 
  },
  DELIVERED: { 
    label: "Delivered", 
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", 
    emoji: "✅" 
  },
  CANCELLED: { 
    label: "Cancelled", 
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", 
    emoji: "❌" 
  },
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
  const { data, loading, page, setPage, totalPages, totalElements } = useOrders();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Filter & UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const handleReorder = async (e: React.MouseEvent, items: any[], orderId: string) => {
    e.stopPropagation();
    try {
      setReorderingId(orderId);
      toast({
        title: "Reordering...",
        description: "Adding items from this order to your cart.",
      });

      for (const orderItem of items) {
        if (orderItem.item) {
          for (let i = 0; i < orderItem.quantity; i++) {
            await addItem(orderItem.item);
          }
        }
      }

      toast({
        title: "Reordered successfully!",
        description: "Redirecting to your cart.",
      });
      
      setTimeout(() => {
        navigate("/cart");
      }, 800);
    } catch (err) {
      toast({
        title: "Reorder failed",
        description: "Could not add items to your cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReorderingId(null);
    }
  };

  const getRestaurantInitials = (name: string) => {
    if (!name) return "R";
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getRestaurantAvatarStyle = (name: string) => {
    const bgColors = [
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const colorClass = bgColors[sum % bgColors.length];
    return colorClass;
  };

  // Local filtering logic on the retrieved page's data
  const filteredData = data.filter((order) => {
    const isActive = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "PENDING_PAYMENT"].includes(order.status);
    const isCompleted = order.status === "DELIVERED";
    const isCancelled = order.status === "CANCELLED";

    if (activeTab === "active" && !isActive) return false;
    if (activeTab === "completed" && !isCompleted) return false;
    if (activeTab === "cancelled" && !isCancelled) return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchRestaurant = order.restaurantName?.toLowerCase().includes(query);
      const matchItems = order.items?.some((i) => i.item?.name?.toLowerCase().includes(query));
      if (!matchRestaurant && !matchItems) return false;
    }

    return true;
  });

  const renderOrderProgress = (status: string) => {
    const stepsList = [
      { key: "PLACED", label: "Placed" },
      { key: "ACCEPTED", label: "Accepted" },
      { key: "PREPARING", label: "Preparing" },
      { key: "OUT_FOR_DELIVERY", label: "On the way" },
    ];
    
    const currentStepIdx = stepsList.findIndex((s) => s.key === status);
    if (currentStepIdx === -1 && status !== "PENDING_PAYMENT") return null;

    if (status === "PENDING_PAYMENT") {
      return (
        <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex-1">
            Awaiting Payment completion
          </div>
        </div>
      );
    }

    return (
      <div className="mt-5 space-y-2.5">
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-muted-foreground">
          <span>Order Track Status</span>
          <span className="text-brand-600 dark:text-brand-400 animate-pulse font-extrabold">
            {statusConfig[status]?.label || status}
          </span>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-1 text-xs flex rounded bg-secondary">
            <div
              style={{ width: `${((currentStepIdx + 1) / stepsList.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-brand-500 to-orange-500 transition-all duration-700 ease-out"
            />
          </div>
          <div className="flex justify-between -mt-2.5">
            {stepsList.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/25"
                        : "bg-background border-border text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-brand-500/20 scale-110" : ""}`}
                  >
                    {isCompleted ? (
                      <span className="text-[8px]">✓</span>
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] mt-1.5 font-bold transition-colors ${
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    } ${isCurrent ? "text-brand-600 dark:text-brand-400" : ""}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="h-8 w-8 text-brand-500" />
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {loading ? "Loading your order history..." : `You've placed ${totalElements} order${totalElements !== 1 ? "s" : ""} so far.`}
          </p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      {!loading && data.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {/* Card 1: Total Orders */}
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border/80 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-500" />
            <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{totalElements}</p>
            </div>
          </div>

          {/* Card 2: Active Orders */}
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group hover:border-border/80 transition-colors">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Orders</p>
              <p className="text-2xl font-black text-foreground mt-0.5">
                {data.filter((o) => ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status)).length}
              </p>
            </div>
          </div>

          {/* Card 3: Explore */}
          <button
            onClick={() => navigate("/restaurants")}
            className="rounded-2xl border border-border bg-gradient-to-br from-brand-500/10 to-orange-500/5 hover:from-brand-500/20 hover:to-orange-500/10 transition-all p-5 flex items-center gap-4 shadow-sm text-left relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
            <div className="h-12 w-12 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Hungry?</p>
              <p className="text-sm font-black text-foreground mt-0.5 flex items-center gap-1">
                Browse Restaurants <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Main List & Controls */}
      <div className="space-y-6">
        {/* Filters & Search controls */}
        {!loading && data.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-secondary/30 backdrop-blur-sm border border-border/40 w-full sm:w-auto">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-black tracking-wide uppercase transition-all duration-300 ${
                      isSelected
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Search restaurant or food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border/50 hover:border-border/80 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs font-medium placeholder-muted-foreground outline-none transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonOrder key={i} />)
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-5 border border-dashed border-border rounded-3xl bg-card/20 backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10 shadow-inner">
              <ShoppingBag className="h-10 w-10 text-brand-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">No orders yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Once you order from a restaurant, your history will appear here.
              </p>
            </div>
            <Button
              onClick={() => navigate("/restaurants")}
              className="btn-brand-gradient rounded-full px-8 h-12 border-0 text-white font-bold shadow-lg shadow-brand-500/20"
            >
              Browse Restaurants
            </Button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-border/60 rounded-3xl bg-card/10 backdrop-blur-sm animate-fade-in">
            <div className="text-4xl">🍽️</div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-foreground">No matching orders</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No orders match your filter or search query on this page. Try clearing your search query or switching tabs.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5">
              {filteredData.map((order) => {
                const status = statusConfig[order.status] ?? {
                  label: order.status,
                  className: "bg-muted text-muted-foreground",
                  emoji: "📋",
                };
                const isActive = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "PENDING_PAYMENT"].includes(order.status);
                const isUnpaid = order.status === "PENDING_PAYMENT";
                const isExpanded = !!expandedOrders[order.id];

                return (
                  <div
                    key={order.id}
                    className="group rounded-2xl border border-border/80 bg-card/90 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 p-5 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
                    onClick={() => navigate(`/orders/${order.id}/track`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate(`/orders/${order.id}/track`)}
                    aria-label={`View order from ${order.restaurantName}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Restaurant info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black tracking-wider transition-all duration-300 group-hover:scale-105 shadow-inner ${getRestaurantAvatarStyle(
                            order.restaurantName ?? "Restaurant"
                          )}`}
                        >
                          {getRestaurantInitials(order.restaurantName ?? "Restaurant")}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-foreground group-hover:text-brand-500 transition-colors">
                            {order.restaurantName ?? "Restaurant"}
                          </h3>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                            <span className="flex items-center gap-0.5 text-foreground bg-secondary px-1.5 py-0.5 rounded font-mono">
                              #{String(order.id).slice(-6).toUpperCase()}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status + chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border transition-colors shadow-sm ${status.className}`}
                        >
                          {isActive && !isUnpaid && (
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                          )}
                          {isUnpaid && (
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                          )}
                          {status.label}
                        </span>
                        <ChevronRight className="hidden sm:block h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    {/* Progress tracker for active orders */}
                    {isActive && renderOrderProgress(order.status)}

                    {/* Receipt-style collapsible item list */}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 space-y-2 border-t border-border/40 pt-4">
                        {order.items
                          .slice(0, isExpanded ? order.items.length : 2)
                          .map((oi, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm items-center hover:bg-secondary/20 p-1.5 rounded-lg transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-extrabold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-lg text-xs shrink-0">
                                  {oi.quantity}x
                                </span>
                                <span className="font-medium text-foreground truncate">
                                  {oi.item?.name ?? "Item"}
                                </span>
                              </div>
                              {oi.item?.price && (
                                <span className="font-mono text-muted-foreground text-xs shrink-0 ml-2">
                                  {formatCurrency(oi.item.price * oi.quantity)}
                                </span>
                              )}
                            </div>
                          ))}

                        {order.items.length > 2 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedOrders((prev) => ({
                                ...prev,
                                [order.id]: !prev[order.id],
                              }));
                            }}
                            className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500 mt-2 transition-colors focus:outline-none"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="h-3.5 w-3.5" />
                              </>
                            ) : (
                              <>
                                Show {order.items.length - 2} more items{" "}
                                <ChevronDown className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Paid Amount</p>
                        <p className="text-xl font-black text-foreground mt-0.5">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-9 px-4 font-bold border-border/80 hover:bg-secondary transition-colors"
                          onClick={() => navigate(`/orders/${order.id}/track`)}
                        >
                          {isActive ? "Track Order" : "View Details"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={reorderingId === order.id}
                          className="rounded-full text-xs h-9 px-4 font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-all"
                          onClick={(e) => handleReorder(e, order.items, order.id)}
                        >
                          {reorderingId === order.id ? (
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Reorder
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-6 border-t border-border/40 mt-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Page <span className="text-foreground font-bold">{page + 1}</span> of <span className="text-foreground font-bold">{totalPages}</span>
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold h-9"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold h-9"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
