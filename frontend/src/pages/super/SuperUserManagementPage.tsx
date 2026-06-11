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
import { updateUserRole, getUsers } from "@/apis";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";

export const SuperUserManagementPage = () => {
  usePageTitle("User Management");
  const { toast } = useToast();
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers(page, 10);
      setLocalUsers(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

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
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
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

          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted-foreground">
              Page {totalPages > 0 ? page + 1 : 0} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1 || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
