import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { OrderTimeline } from "@/components/common/OrderTimeline";
import { useOrders } from "@/hooks/useOrders";
import { usePageTitle } from "@/hooks/usePageTitle";

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const { data } = useOrders();
  const order = data.find((item) => item.id === id);
  usePageTitle("Order Tracking");

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">Order not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tracking ${order.restaurantName}`}
        subtitle={`Order ${order.id} • ${order.status}`}
      />
      <Card>
        <CardContent className="p-6">
          <OrderTimeline current={order.status} />
        </CardContent>
      </Card>
    </div>
  );
};
