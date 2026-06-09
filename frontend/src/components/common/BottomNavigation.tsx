import { NavLink, useLocation } from "react-router-dom";
import { Home, Store, ShoppingBag, Clock, User } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/restaurants", icon: Store, label: "Explore" },
  { to: "/cart", icon: ShoppingBag, label: "Cart" },
  { to: "/orders", icon: Clock, label: "Orders" },
  { to: "/profile", icon: User, label: "Profile" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-surface border-t border-white/30 dark:border-white/10"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200"
              aria-label={label}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-500/15 text-brand-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span
                className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? "text-brand-500" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
