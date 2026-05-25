import { useEffect, useState } from "react";
import { getManagedRestaurants } from "@/apis";
import type { Restaurant } from "@/types";

export const useManagedRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getManagedRestaurants()
      .then((data) => {
        if (active) {
          setRestaurants(data);
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

  return { restaurants, loading };
};
