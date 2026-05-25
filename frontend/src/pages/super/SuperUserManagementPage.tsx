import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { updateUserRole } from "@/apis";
import { useSuperDashboard } from "@/hooks/useSuperDashboard";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";

export const SuperUserManagementPage = () => {
  usePageTitle("User Management");
  const { users } = useSuperDashboard();
  const { toast } = useToast();
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleRoleChange = async (id: string, role: "CUSTOMER" | "ADMIN") => {
    try {
      await updateUserRole(id, role);
      setLocalUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role } : user))
      );
      toast({ title: "Role updated", description: "User role updated." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    }
  };

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
          {localUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === "SUPER_ADMIN" ? (
                  <Badge variant="secondary">{user.role}</Badge>
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value as "CUSTOMER" | "ADMIN")}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOMER">CUSTOMER</SelectItem>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                )}
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
