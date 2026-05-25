import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/format";
import { usePageTitle } from "@/hooks/usePageTitle";

export const OrderHistoryPage = () => {
  usePageTitle("Orders");
  const navigate = useNavigate();
  const { data } = useOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order history"
        subtitle="Track your recent deliveries"
      />
      <div className="space-y-4">
        {data.map((order) => (
          <Card key={order.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {order.restaurantName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary">{order.status}</Badge>
              <p className="font-semibold">{formatCurrency(order.total)}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${order.id}/track`)}
                >
                  Track
                </Button>
                <Button variant="ghost">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reorder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
