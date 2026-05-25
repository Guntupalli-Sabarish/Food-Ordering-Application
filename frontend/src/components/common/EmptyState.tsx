import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <Card className="border-dashed">
    <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
        <Icon className="h-6 w-6 text-brand-500" />
      </span>
      <div>
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </CardContent>
  </Card>
);
