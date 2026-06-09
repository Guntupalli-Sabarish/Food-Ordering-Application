import { useCallback, useEffect, useState } from "react";
import { getMenuItems } from "@/apis";
import type { MenuItem } from "@/types";

export const useAdminMenu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    setLoading(true);
    return getMenuItems()
      .then((data) => {
        setItems(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return { items, loading, refresh: loadItems };
};
