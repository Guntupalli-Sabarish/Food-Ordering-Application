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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { createRestaurant, deleteRestaurant, getUsers, updateRestaurant } from "@/apis";
import { useManagedRestaurants } from "@/hooks/useManagedRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";

const CUISINE_TYPES = [
  "AMERICAN",
  "BBQ",
  "BURGERS",
  "PIZZA",
  "STEAKHOUSE",
  "TEX_MEX",
  "CANADIAN",
  "CHINESE",
  "INDIAN",
  "JAPANESE",
  "KOREAN",
  "THAI",
  "VIETNAMESE",
  "ASIAN_FUSION",
  "SUSHI",
  "ITALIAN",
  "FRENCH",
  "SPANISH",
  "GREEK",
  "BRITISH",
  "GERMAN",
  "MEXICAN",
  "BRAZILIAN",
  "ARGENTINIAN",
  "CARIBBEAN",
  "PERUVIAN",
  "MIDDLE_EASTERN",
  "MEDITERRANEAN",
  "LEBANESE",
  "TURKISH",
  "ETHIOPIAN",
  "MOROCCAN",
  "VEGAN",
  "VEGETARIAN",
  "SEAFOOD",
  "BAKERY",
  "CAFE",
  "DESSERT",
  "FAST_FOOD",
];

export const SuperRestaurantManagementPage = () => {
  usePageTitle("Restaurant Management");
  const { restaurants, loading, page, setPage, totalPages, refresh } = useManagedRestaurants();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [adminId, setAdminId] = useState("");
  const [active, setActive] = useState("true");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [admins, setAdmins] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let activeFlag = true;
    getUsers(0, 1000)
      .then((data) => {
        if (activeFlag) {
          setAdmins(data.content.filter((user: User) => user.role === "ADMIN"));
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
    if (!name || !address || cuisines.length === 0 || !adminId) {
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
        cuisine: cuisines.join(", "),
        adminId: parsedAdminId,
        active: active === "true",
      });
      await refresh();
      setName("");
      setAddress("");
      setCuisines([]);
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
    if (!name || !address || cuisines.length === 0 || !adminId) {
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
        cuisine: cuisines.join(", "),
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
    const selected = (restaurant.cuisine ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    setCuisines(selected);
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

  const toggleCuisine = (value: string) => {
    setCuisines((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const cuisineLabel = cuisines.length === 0
    ? "Select cuisines"
    : `${cuisines.length} selected`;

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
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Cuisine types</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {cuisineLabel}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
                      {CUISINE_TYPES.map((type) => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={cuisines.includes(type)}
                          onCheckedChange={() => toggleCuisine(type)}
                        >
                          {type.replace(/_/g, " ")}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Cuisine types</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {cuisineLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">
                  {CUISINE_TYPES.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={cuisines.includes(type)}
                      onCheckedChange={() => toggleCuisine(type)}
                    >
                      {type.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
