import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User, LogOut, LayoutDashboard, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useTheme, type ThemeMode } from "@/context/ThemeProvider";
import { Logo } from "@/components/common/Logo";

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { mode, setMode } = useTheme();

  const ThemeIcon = mode === "dark" ? Moon : mode === "light" ? Sun : Monitor;

  return (
    <header className="sticky top-0 z-30 glass-surface border-b border-white/40 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Logo />

        <div className="flex-1 md:max-w-md" />

        {/* Right nav */}
        <nav className="flex items-center gap-1">
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 mr-2">
            <NavLink
              to="/restaurants"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              Orders
            </NavLink>
            {user?.role !== "CUSTOMER" && (
              <NavLink
                to={user?.role === "SUPER_ADMIN" ? "/superadmin" : "/admin"}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LayoutDashboard className="mr-1.5 inline h-4 w-4 -mt-0.5" />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Theme mode selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Select theme"
                id="theme-toggle-btn"
              >
                <ThemeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Appearance
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {themeOptions.map(({ mode: m, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-2 cursor-pointer ${
                    mode === m ? "text-brand-600 dark:text-brand-400 font-semibold" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {mode === m && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/cart" className="relative" aria-label="Shopping cart">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
              <ShoppingBag className="h-4 w-4" />
            </Button>
            {cartItems.length > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 h-5 w-5 justify-center rounded-full bg-brand-500 p-0 text-[10px] font-bold text-white">
                {cartItems.length > 9 ? "9+" : cartItems.length}
              </Badge>
            )}
          </Link>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:text-foreground"
                id="profile-menu-trigger"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400">
                  <span className="text-xs font-bold uppercase">
                    {user?.name?.charAt(0) ?? <User className="h-3 w-3" />}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <p className="font-semibold">{user?.name ?? "Guest"}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Order History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};
