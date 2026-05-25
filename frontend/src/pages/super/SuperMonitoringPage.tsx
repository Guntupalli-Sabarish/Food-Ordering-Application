import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useSuperDashboard } from "@/hooks/useSuperDashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export const SuperMonitoringPage = () => {
  usePageTitle("Monitoring");
  const { logs } = useSuperDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform monitoring"
        subtitle="Live status and activity logs"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">System status</p>
            <p className="text-xl font-semibold text-emerald-600">All systems go</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Latency</p>
            <p className="text-xl font-semibold">220ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Incidents</p>
            <p className="text-xl font-semibold">0 active</p>
          </CardContent>
        </Card>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.time}</TableCell>
              <TableCell>{log.level}</TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
