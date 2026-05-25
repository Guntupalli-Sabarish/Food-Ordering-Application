import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { useSuperDashboard } from "@/hooks/useSuperDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

export const SuperAnalyticsPage = () => {
  usePageTitle("Platform Analytics");
  const { metrics, salesSeries, loading } = useSuperDashboard();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))
          : metrics.map((metric) => (
              <StatCard key={metric.title} {...metric} />
            ))}
      </div>
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-semibold">Platform sales</h3>
          <p className="text-sm text-muted-foreground">
            Hourly momentum across all cities.
          </p>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesSeries}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
