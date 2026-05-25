import { useEffect, useState } from "react";
import { getAdminRestaurant } from "@/apis";
import type { Restaurant } from "@/types";

export const useAdminRestaurant = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminRestaurant()
      .then((data) => {
        if (active) {
          setRestaurant(data);
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

  return { restaurant, loading };
};
