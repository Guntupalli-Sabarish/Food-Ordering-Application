import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/apis";
import type { User } from "@/types";

export const useProfile = (email?: string) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }
    let active = true;
    getProfile(email)
      .then((data) => {
        if (active) {
          setProfile(data);
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
  }, [email]);

  const save = async (payload: Partial<User>) => {
    const updated = await updateProfile(payload);
    setProfile((prev) => ({ ...(prev ?? {}), ...updated } as User));
  };

  return { profile, loading, save };
};
