import { useEffect, useState } from "react";
import { getOrders } from "@/apis";
import type { Order } from "@/types";

export const useOrders = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getOrders(page, 5)
      .then((res) => {
        if (active) {
          setData(res.content);
          setTotalPages(res.totalPages);
          setTotalElements(res.totalElements);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
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
  }, [page]);

  return { data, loading, error, page, setPage, totalPages, totalElements };
};
