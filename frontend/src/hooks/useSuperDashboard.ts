import { useEffect, useState } from "react";
import {
  getOrderVolumeSeries,
  getPlatformMetrics,
  getSalesSeries,
  getSystemLogs,
  getUsers,
} from "@/apis";
import type { ChartPoint, DashboardMetric, User } from "@/types";

export const useSuperDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [orderVolume, setOrderVolume] = useState<ChartPoint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
        getUsers(),
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
        setUsers(results[3].value);
      }
      if (results[4].status === "fulfilled") {
        setLogs(results[4].value);
      }
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return { metrics, salesSeries, orderVolume, users, logs, loading };
};
