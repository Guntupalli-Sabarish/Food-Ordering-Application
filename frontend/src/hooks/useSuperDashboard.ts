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
    Promise.all([
      getPlatformMetrics(),
      getSalesSeries(),
      getOrderVolumeSeries(),
      getUsers(),
      getSystemLogs(),
    ]).then(([metricsData, salesData, orderData, usersData, logsData]) => {
      if (active) {
        setMetrics(metricsData);
        setSalesSeries(salesData);
        setOrderVolume(orderData);
        setUsers(usersData);
        setLogs(logsData);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return { metrics, salesSeries, orderVolume, users, logs, loading };
};
