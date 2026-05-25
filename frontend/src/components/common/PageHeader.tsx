import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
    <div>
      <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
    {action}
  </div>
);
