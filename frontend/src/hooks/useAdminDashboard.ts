import { useEffect, useState } from "react";
import { getAdminMetrics, getCategoryDistribution, getSalesSeries } from "@/apis";
import type { ChartPoint, DashboardMetric } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [categorySeries, setCategorySeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([getAdminMetrics(), getSalesSeries(), getCategoryDistribution()])
      .then(([metricsData, salesData, categoryData]) => {
        if (active) {
          setMetrics(metricsData);
          setSalesSeries(salesData);
          setCategorySeries(categoryData);
        }
      })
      .catch((error) => {
        const msg = error instanceof Error ? error.message : "Failed to load dashboard metrics";
        toast({ title: "Dashboard error", description: msg, variant: "destructive" });
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [toast]);

  return { metrics, salesSeries, categorySeries, loading };
};
