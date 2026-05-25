import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useSuperDashboard } from "@/hooks/useSuperDashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export const SuperUserManagementPage = () => {
  usePageTitle("User Management");
  const { users } = useSuperDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform users"
        subtitle="Manage access and compliance"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{user.role}</Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline">
                  Block
                </Button>
                <Button size="sm" variant="ghost">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
