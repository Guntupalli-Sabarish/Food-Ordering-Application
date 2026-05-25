import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { createRestaurant, deleteRestaurant, getUsers, updateRestaurant } from "@/apis";
import { useManagedRestaurants } from "@/hooks/useManagedRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";

export const SuperRestaurantManagementPage = () => {
  usePageTitle("Restaurant Management");
  const { restaurants, refresh } = useManagedRestaurants();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [adminId, setAdminId] = useState("");
  const [active, setActive] = useState("true");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let activeFlag = true;
    getUsers()
      .then((data) => {
        if (activeFlag) {
          setAdmins(data.filter((user) => user.role === "ADMIN"));
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to load admins";
        toast({ title: "Load failed", description: message, variant: "destructive" });
      });
    return () => {
      activeFlag = false;
    };
  }, [toast]);

  const adminOptions = useMemo(
    () => admins.map((admin) => ({
      value: admin.id,
      label: `${admin.name} (${admin.email})`,
    })),
    [admins]
  );

  const handleCreate = async () => {
    if (!name || !address || !cuisine || !adminId) {
      toast({
        title: "Missing fields",
        description: "Provide name, address, cuisine, and admin id.",
        variant: "destructive",
      });
      return;
    }
    const parsedAdminId = Number(adminId);
    if (Number.isNaN(parsedAdminId) || parsedAdminId <= 0) {
      toast({
        title: "Invalid admin id",
        description: "Admin id must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await createRestaurant({
        name,
        address,
        cuisine,
        adminId: parsedAdminId,
        active: active === "true",
      });
      await refresh();
      setName("");
      setAddress("");
      setCuisine("");
      setAdminId("");
      setActive("true");
      setOpen(false);
      toast({ title: "Restaurant created", description: "Restaurant added successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Create failed";
      toast({ title: "Create failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId) {
      return;
    }
    if (!name || !address || !cuisine || !adminId) {
      toast({
        title: "Missing fields",
        description: "Provide name, address, cuisine, and admin id.",
        variant: "destructive",
      });
      return;
    }
    const parsedAdminId = Number(adminId);
    if (Number.isNaN(parsedAdminId) || parsedAdminId <= 0) {
      toast({
        title: "Invalid admin id",
        description: "Admin id must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await updateRestaurant(editingId, {
        name,
        address,
        cuisine,
        adminId: parsedAdminId,
        active: active === "true",
      });
      await refresh();
      setEditOpen(false);
      setEditingId(null);
      toast({ title: "Restaurant updated", description: "Changes saved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (restaurant: (typeof restaurants)[number]) => {
    setEditingId(restaurant.id);
    setName(restaurant.name ?? "");
    setAddress(restaurant.address ?? "");
    setCuisine(restaurant.cuisine ?? "");
    setAdminId(restaurant.adminId ? String(restaurant.adminId) : "");
    setActive(restaurant.active ? "true" : "false");
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this restaurant?") ) {
      return;
    }
    try {
      await deleteRestaurant(id);
      await refresh();
      toast({ title: "Restaurant deleted", description: "Restaurant removed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant approvals"
        subtitle="Review new onboarding requests"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add restaurant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create restaurant</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Restaurant name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <Input
                  placeholder="Address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <Input
                  placeholder="Cuisine"
                  value={cuisine}
                  onChange={(event) => setCuisine(event.target.value)}
                />
                <Select value={adminId} onValueChange={setAdminId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminOptions.length === 0 ? (
                      <SelectItem value="" disabled>
                        No admins available
                      </SelectItem>
                    ) : (
                      adminOptions.map((admin) => (
                        <SelectItem key={admin.value} value={admin.value}>
                          {admin.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Select value={active} onValueChange={setActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Cuisine</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant) => (
            <TableRow key={restaurant.id}>
              <TableCell className="font-medium">{restaurant.name}</TableCell>
              <TableCell>{restaurant.cuisine}</TableCell>
              <TableCell>{restaurant.adminId ?? "-"}</TableCell>
              <TableCell>
                <Badge variant={restaurant.tags?.[0] === "Open" ? "default" : "secondary"}>
                  {restaurant.tags?.[0] === "Open" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(restaurant)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(restaurant.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit restaurant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Restaurant name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              placeholder="Address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <Input
              placeholder="Cuisine"
              value={cuisine}
              onChange={(event) => setCuisine(event.target.value)}
            />
            <Select value={adminId} onValueChange={setAdminId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign admin" />
              </SelectTrigger>
              <SelectContent>
                {adminOptions.length === 0 ? (
                  <SelectItem value="" disabled>
                    No admins available
                  </SelectItem>
                ) : (
                  adminOptions.map((admin) => (
                    <SelectItem key={admin.value} value={admin.value}>
                      {admin.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={active} onValueChange={setActive}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
