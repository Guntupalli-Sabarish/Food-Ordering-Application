import { useCallback, useEffect, useState } from "react";
import { getAdminOrders } from "@/apis";
import type { Order } from "@/types";

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadOrders = useCallback(() => {
    setLoading(true);
    return getAdminOrders(page, 10)
      .then((res) => {
        setOrders(res.content);
        setTotalPages(res.totalPages);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return { orders, loading, page, setPage, totalPages, setOrders, refresh: loadOrders };
};
