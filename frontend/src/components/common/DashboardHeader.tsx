import { Link, NavLink } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  navItems: NavItem[];
}

export const DashboardHeader = ({
  title,
  subtitle,
  navItems,
}: DashboardHeaderProps) => {
  const { user, logout } = useAuth();

  const profileLink = user?.role === "SUPER_ADMIN"
    ? "/superadmin/profile"
    : user?.role === "ADMIN"
    ? "/admin/profile"
    : "/profile";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase text-brand-500">{title}</p>
            <h1 className="text-2xl font-semibold text-slate-900">{subtitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Logo />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.name || "User"}
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={profileLink}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <nav className="mt-4 flex flex-wrap gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-500 text-white"
                    : "bg-orange-50 text-slate-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};
