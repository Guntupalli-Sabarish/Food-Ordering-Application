import { useEffect, useState } from "react";
import { getSalesSeries, getOrderVolumeSeries } from "@/apis";
import type { ChartPoint } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useSalesReports = () => {
  const [salesSeries, setSalesSeries] = useState<ChartPoint[]>([]);
  const [ordersSeries, setOrdersSeries] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    Promise.all([getSalesSeries(), getOrderVolumeSeries()])
      .then(([sales, orders]) => {
        if (active) {
          setSalesSeries(sales);
          setOrdersSeries(orders);
        }
      })
      .catch((error) => {
        const msg = error instanceof Error ? error.message : "Failed to load sales reports";
        toast({ title: "Reports error", description: msg, variant: "destructive" });
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

  return { salesSeries, ordersSeries, loading };
};
