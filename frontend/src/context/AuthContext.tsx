import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProfile, login as apiLogin, logout as apiLogout, register as apiRegister } from "@/apis";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "foodapp.auth";

const loadStoredAuth = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    return JSON.parse(stored) as { user: User; token: string };
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const storedAuth = loadStoredAuth();
  const [user, setUser] = useState<User | null>(storedAuth?.user ?? null);
  const [token, setToken] = useState<string | null>(storedAuth?.token ?? null);
  const [ready, setReady] = useState(false);

  const persist = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    const userIdParam = params.get("userId");
    const nameParam = params.get("name");
    const roleParam = params.get("role");
    const isNewParam = params.get("isNew");

    if (tokenParam && userIdParam && nameParam && roleParam) {
      const parsedUser: User = {
        id: userIdParam,
        name: nameParam,
        email: params.get("email") || "",
        role: roleParam as any,
      };
      persist(parsedUser, tokenParam);
      setReady(true);
      
      if (isNewParam === "true") {
        toast({ title: "Welcome to FoodFlow!", description: "Your account was successfully created via Google." });
      } else {
        toast({ title: "Welcome back!", description: "Signed in with Google." });
      }
      
      // Clean query params from URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [persist, toast]);

  useEffect(() => {
    let active = true;
    const hydrateProfile = async () => {
      if (!token) {
        if (active) {
          setReady(true);
        }
        return;
      }
      try {
        const profile = await getProfile();
        if (active) {
          setUser(profile);
        }
      } catch {
        if (active) {
          clearAuth();
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };
    hydrateProfile();
    return () => {
      active = false;
    };
  }, [token, clearAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      persist(response.user, response.token);
      setReady(true);
      toast({ title: "Welcome back!", description: "Login successful." });
      return response.user;
    },
    [persist, toast]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ) => {
      const response = await apiRegister(name, email, password);
      if (response.token) {
        persist(response.user, response.token);
        toast({
          title: "Account created",
          description: "You are signed in now.",
        });
        return true;
      }

      clearAuth();
      toast({
        title: "Verify your email",
        description: "We sent a verification link to your inbox.",
      });
      return false;
    },
    [clearAuth, persist, toast]
  );

  const logout = useCallback(() => {
    apiLogout().catch(() => undefined);
    clearAuth();
    toast({ title: "Logged out", description: "See you soon!" });
  }, [clearAuth, toast]);

  const value = useMemo(
    () => ({ user, token, ready, login, logout, register }),
    [user, token, ready, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
