import { useEffect, useState } from "react";
import { getAdminMetrics, getCategoryDistribution, getSalesSeries } from "@/apis";
import type { ChartPoint, DashboardMetric } from "@/types";

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [categorySeries, setCategorySeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

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
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { metrics, salesSeries, categorySeries, loading };
};
