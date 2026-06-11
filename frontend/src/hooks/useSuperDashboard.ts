import { useEffect, useState } from "react";
import {
  getOrderVolumeSeries,
  getPlatformMetrics,
  getSalesSeries,
  getSystemLogs,
} from "@/apis";
import type { ChartPoint, DashboardMetric } from "@/types";

export const useSuperDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [orderVolume, setOrderVolume] = useState<ChartPoint[]>([]);
  const [logs, setLogs] = useState<
    Array<{ id: string; level: string; message: string; time: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const results = await Promise.allSettled([
        getPlatformMetrics(),
        getSalesSeries(),
        getOrderVolumeSeries(),
        getSystemLogs(),
      ]);

      if (!active) {
        return;
      }

      if (results[0].status === "fulfilled") {
        setMetrics(results[0].value);
      }
      if (results[1].status === "fulfilled") {
        setSalesSeries(results[1].value);
      }
      if (results[2].status === "fulfilled") {
        setOrderVolume(results[2].value);
      }
      if (results[3].status === "fulfilled") {
        setLogs(results[3].value);
      }
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return { metrics, salesSeries, orderVolume, logs, loading };
};
