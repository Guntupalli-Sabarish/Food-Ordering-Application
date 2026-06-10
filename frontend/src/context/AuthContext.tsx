import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getProfile, login as apiLogin, logout as apiLogout, register as apiRegister, oauth2Exchange } from "@/apis";
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

/** Persist only the user profile (no token — session is cookie-based). */
const persistUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
};

const clearStorage = () => localStorage.removeItem(STORAGE_KEY);

const loadStoredUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { user?: User };
    return parsed.user ?? null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(loadStoredUser());
  const [ready, setReady] = useState(false);

  const clearAuth = useCallback(() => {
    setUser(null);
    clearStorage();
  }, []);

  // ── OAuth code exchange (Google redirect) ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const isNewParam = params.get("isNew");

    if (codeParam) {
      oauth2Exchange(codeParam)
        .then((parsedUser) => {
          setUser(parsedUser);
          persistUser(parsedUser);
          setReady(true);
          if (isNewParam === "true") {
            toast({ title: "Welcome to FoodFlow!", description: "Your account was successfully created via Google." });
          } else {
            toast({ title: "Welcome back!", description: "Signed in with Google." });
          }
        })
        .catch(() => {
          clearAuth();
          setReady(true);
          toast({ title: "Login failed", description: "Google authentication failed.", variant: "destructive" });
        })
        .finally(() => {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        });
    }
  }, [clearAuth, toast]);

  // ── Session hydration on mount ─────────────────────────────────────────────
  // Always call /api/auth/profile to verify the HttpOnly cookie is still valid.
  useEffect(() => {
    let active = true;
    const hydrateProfile = async () => {
      try {
        const profile = await getProfile();
        if (active) {
          setUser(profile);
          persistUser(profile);
        }
      } catch {
        // Cookie absent or expired — clear stale UI state
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
  }, [clearAuth]);

  // ── Email / password login ─────────────────────────────────────────────────
  // The backend now sets the HttpOnly cookie in its response.
  // We call /api/auth/profile immediately after to get a verified user object.
  const login = useCallback(
    async (email: string, password: string) => {
      // This call now sets the cookie via Set-Cookie header
      await apiLogin(email, password);
      // Hydrate user from profile endpoint (proves the cookie works)
      const profile = await getProfile();
      setUser(profile);
      persistUser(profile);
      setReady(true);
      toast({ title: "Welcome back!", description: "Login successful." });
      return profile;
    },
    [toast]
  );

  // ── Registration ──────────────────────────────────────────────────────────
  // - If email verification is bypassed (dev), backend returns a cookie → profile hydration succeeds → user is signed in.
  // - If email verification is required, backend returns no cookie → profile hydration fails → we show the "check inbox" message.
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ) => {
      await apiRegister(name, email, password);

      // Try to hydrate the session. Succeeds only when a valid cookie was set.
      try {
        const profile = await getProfile();
        setUser(profile);
        persistUser(profile);
        toast({
          title: "Account created",
          description: "You are now signed in.",
        });
        return true;
      } catch {
        // No cookie was set — verification email was sent
        clearAuth();
        toast({
          title: "Verify your email",
          description: "We sent a verification link to your inbox.",
        });
        return false;
      }
    },
    [clearAuth, toast]
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    apiLogout().catch(() => undefined);
    clearAuth();
    toast({ title: "Logged out", description: "See you soon!" });
  }, [clearAuth, toast]);

  const value = useMemo(
    () => ({ user, token: null, ready, login, logout, register }),
    [user, ready, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
