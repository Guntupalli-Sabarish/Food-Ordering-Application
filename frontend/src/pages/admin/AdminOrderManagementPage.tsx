import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { usePageTitle } from "@/hooks/usePageTitle";

export const AdminOrderManagementPage = () => {
  usePageTitle("Order Management");
  const { orders } = useAdminOrders();

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
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell>{order.restaurantName}</TableCell>
              <TableCell>₹{order.total}</TableCell>
              <TableCell>
                <Select defaultValue={order.status}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
