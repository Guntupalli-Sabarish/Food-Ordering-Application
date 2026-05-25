import { useCallback, useEffect, useState } from "react";
import { getSuperRestaurants } from "@/apis";
import type { Restaurant } from "@/types";

export const useManagedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return getSuperRestaurants()
      .then((data) => {
        setRestaurants(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    if (active) {
      refresh();
    }
    return () => {
      active = false;
    };
  }, [refresh]);

  return { restaurants, loading, refresh };
};
