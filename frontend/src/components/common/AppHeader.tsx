import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, User, LogOut, Search, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Logo } from "@/components/common/Logo";

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Logo />
        <div className="hidden flex-1 items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 shadow-sm md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants, cuisines, dishes"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <nav className="flex items-center gap-3">
          <NavLink
            to="/restaurants"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-brand-600" : "text-muted-foreground"
              }`
            }
          >
            Restaurants
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-brand-600" : "text-muted-foreground"
              }`
            }
          >
            Orders
          </NavLink>
          {user?.role !== "CUSTOMER" && (
            <NavLink
              to={user?.role === "SUPER_ADMIN" ? "/superadmin" : "/admin"}
              className="hidden text-sm font-medium text-muted-foreground md:block"
            >
              <LayoutDashboard className="mr-1 inline h-4 w-4" />
              Dashboard
            </NavLink>
          )}
          <Link to="/cart" className="relative">
            <Button variant="outline" size="icon" className="rounded-full">
              <ShoppingBag className="h-4 w-4" />
            </Button>
            {cartItems.length > 0 && (
              <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full bg-brand-500 text-white">
                {cartItems.length}
              </Badge>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name ?? "Guest"}
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};
