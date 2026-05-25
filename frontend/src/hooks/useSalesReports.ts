import { useEffect, useState } from "react";
import { getSalesSeries, getOrderVolumeSeries } from "@/apis";
import type { ChartPoint } from "@/types";

export const useSalesReports = () => {
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [ordersSeries, setOrdersSeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getSalesSeries(), getOrderVolumeSeries()])
      .then(([sales, orders]) => {
        if (active) {
          setSalesSeries(sales);
          setOrdersSeries(orders);
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

  return { salesSeries, ordersSeries, loading };
};
