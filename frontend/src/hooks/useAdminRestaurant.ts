import { useEffect, useState } from "react";
import { getAdminRestaurant, updateAdminRestaurant } from "@/apis";
import { useAuth } from "@/hooks/useAuth";
import type { Restaurant } from "@/types";

export const useAdminRestaurant = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(user?.role === "ADMIN");

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    let active = true;
    getAdminRestaurant()
      .then((data) => {
        if (active) {
          setRestaurant(data);
        }
      })
      .catch(() => {
        if (active) {
          setRestaurant(null);
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
  }, [user?.role]);

  const save = async (payload: { name: string; address: string; cuisine: string }) => {
    if (user?.role !== "ADMIN") {
      throw new Error("Only an admin can update the restaurant");
    }
    const updated = await updateAdminRestaurant(payload);
    setRestaurant(updated);
    return updated;
  };

  return { restaurant, loading, save };
};
