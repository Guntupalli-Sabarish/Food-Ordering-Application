import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { login as apiLogin, register as apiRegister } from "@/apis";
import type { Role, User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: Role
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "foodapp.auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { user: User; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  const persist = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken })
    );
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiLogin(email, password);
      persist(response.user, response.token);
      toast({ title: "Welcome back!", description: "Login successful." });
    },
    [persist, toast]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: Role = "CUSTOMER"
    ) => {
      const response = await apiRegister(name, email, password, role);
      persist(response.user, response.token);
      toast({ title: "Account created", description: "Welcome aboard!" });
    },
    [persist, toast]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "Logged out", description: "See you soon!" });
  }, [toast]);

  const value = useMemo(
    () => ({ user, token, login, logout, register }),
    [user, token, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
