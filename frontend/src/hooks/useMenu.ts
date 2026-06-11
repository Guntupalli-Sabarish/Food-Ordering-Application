import { useEffect, useState } from "react";
import { getMenuForRestaurant, getRestaurantById } from "@/apis";
import type { MenuItem, Restaurant } from "@/types";

const menuCache = new Map<string, { restaurant: Restaurant; items: MenuItem[] }>();

export const useMenu = (restaurantId: string) => {
  const cached = menuCache.get(restaurantId);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(cached?.restaurant ?? null);
  const [items, setItems] = useState<MenuItem[]>(cached?.items ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getRestaurantById(restaurantId), getMenuForRestaurant(restaurantId)])
      .then(([restaurantData, menuData]) => {
        if (active) {
          setRestaurant(restaurantData);
          setItems(menuData);
          menuCache.set(restaurantId, { restaurant: restaurantData, items: menuData });
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [restaurantId]);

  return { restaurant, items, loading, error };
};
