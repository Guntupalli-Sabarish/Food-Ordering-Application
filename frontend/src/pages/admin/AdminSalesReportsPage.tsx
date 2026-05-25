import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { useSalesReports } from "@/hooks/useSalesReports";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

export const AdminSalesReportsPage = () => {
  usePageTitle("Sales Reports");
  const { salesSeries, ordersSeries, loading } = useSalesReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales reports"
        subtitle="Understand revenue and order volume"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Daily revenue</h3>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesSeries}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold">Order volume</h3>
          </CardHeader>
          <CardContent className="h-72">
            {loading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersSeries}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#fb923c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
