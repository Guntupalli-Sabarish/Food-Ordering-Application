import { useEffect, useState } from "react";
import { getAdminOrders } from "@/apis";
import type { Order } from "@/types";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminOrders()
      .then((data) => {
        if (active) {
          setOrders(data);
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

  return { orders, loading };
};
