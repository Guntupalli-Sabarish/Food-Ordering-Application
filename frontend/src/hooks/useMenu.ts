import { useEffect, useState } from "react";
import { getMenuForRestaurant, getRestaurantById } from "@/apis";
import type { MenuItem, Restaurant } from "@/types";

export const useMenu = (restaurantId: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getRestaurantById(restaurantId), getMenuForRestaurant(restaurantId)])
      .then(([restaurantData, menuData]) => {
        if (active) {
          setRestaurant(restaurantData);
          setItems(menuData);
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
  }, [restaurantId]);

  return { restaurant, items, loading, error };
};
