import { NavLink } from "react-router-dom";
import { Logo } from "@/components/common/Logo";

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
}: DashboardHeaderProps) => (
  <header className="border-b bg-white">
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase text-brand-500">{title}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{subtitle}</h1>
        </div>
        <Logo />
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
