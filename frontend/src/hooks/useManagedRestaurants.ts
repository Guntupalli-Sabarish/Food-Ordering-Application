import { useCallback, useEffect, useState } from "react";
import { getSuperRestaurants } from "@/apis";
import type { Restaurant } from "@/types";

export const useManagedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const refresh = useCallback(() => {
    setLoading(true);
    return getSuperRestaurants(page, 10)
      .then((res) => {
        setRestaurants(res.content);
        setTotalPages(res.totalPages);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { restaurants, loading, page, setPage, totalPages, refresh };
};
