import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
}

export const StatCard = ({ title, value, change }: StatCardProps) => (
  <Card className="shadow-sm">
    <CardContent className="space-y-2 p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        <span className="text-sm font-medium text-emerald-600">{change}</span>
      </div>
    </CardContent>
  </Card>
);
