import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { usePageTitle } from "@/hooks/usePageTitle";
import { updateOrderStatus } from "@/apis";
import { useToast } from "@/hooks/use-toast";
import type { Order } from "@/types";

export const AdminOrderManagementPage = () => {
  usePageTitle("Order Management");
  const { orders, refresh } = useAdminOrders();
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
                      <SelectItem value="PLACED">PLACED</SelectItem>
                      <SelectItem value="PREPARING">PREPARING</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</SelectItem>
                      <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
