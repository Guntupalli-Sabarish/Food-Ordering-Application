import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { usePageTitle } from "@/hooks/usePageTitle";
import { updateOrderStatus } from "@/apis";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus } from "@/types";

const getAllowedNextStatuses = (current: OrderStatus): OrderStatus[] => {
  const list: OrderStatus[] = [current];
  if (current === "PLACED") {
    list.push("ACCEPTED", "CANCELLED");
  } else if (current === "ACCEPTED") {
    list.push("PREPARING", "CANCELLED");
  } else if (current === "PREPARING") {
    list.push("OUT_FOR_DELIVERY", "CANCELLED");
  } else if (current === "OUT_FOR_DELIVERY") {
    list.push("DELIVERED", "CANCELLED");
  }
  return list;
};

export const AdminOrderManagementPage = () => {
  usePageTitle("Order Management");
  const { orders, loading, page, setPage, totalPages, refresh } = useAdminOrders();
  const { toast } = useToast();

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      await refresh();
      toast({ title: "Status updated", description: "Order status updated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

  const isUnpaid = (order: Order) => order.status === "PENDING_PAYMENT";
  const isTerminal = (order: Order) =>
    order.status === "DELIVERED" || order.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Update fulfillment status"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className={isUnpaid(order) ? "bg-amber-50 dark:bg-amber-900/10" : ""}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.restaurantName}</TableCell>
              <TableCell>₹{order.total}</TableCell>
              <TableCell>
                {isUnpaid(order) ? (
                  <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-400 font-semibold">
                    ⚠️ Awaiting Payment
                  </Badge>
                ) : (
                  <Select
                    defaultValue={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    disabled={isTerminal(order)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllowedNextStatuses(order.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
        </span>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
