import { useCallback, useEffect, useState } from "react";
import { getAdminOrders } from "@/apis";
import type { Order } from "@/types";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(() => {
    setLoading(true);
    return getAdminOrders()
      .then((data) => {
        setOrders(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    loadOrders();
    return () => {
      active = false;
    };
  }, [loadOrders]);

  return { orders, loading, setOrders, refresh: loadOrders };
};
