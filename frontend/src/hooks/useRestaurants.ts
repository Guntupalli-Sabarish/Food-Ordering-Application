import { useEffect, useState } from "react";
import { getRestaurants } from "@/apis";
import type { Restaurant } from "@/types";

export const useRestaurants = () => {
  const [data, setData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getRestaurants()
      .then((restaurants) => {
        if (active) {
          setData(restaurants);
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
  }, []);

  return { data, loading, error };
};
