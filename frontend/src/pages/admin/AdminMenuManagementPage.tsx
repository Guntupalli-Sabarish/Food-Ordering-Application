import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { createMenuItem, deleteMenuItem, updateMenuItem } from "@/apis";
import { useAdminMenu } from "@/hooks/useAdminMenu";
import { useAdminRestaurant } from "@/hooks/useAdminRestaurant";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";

export const AdminMenuManagementPage = () => {
  usePageTitle("Menu Management");
  const { items, refresh } = useAdminMenu();
  const { restaurant } = useAdminRestaurant();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!restaurant) {
      toast({
        title: "Restaurant not found",
        description: "Assign a restaurant before adding menu items.",
        variant: "destructive",
      });
      return;
    }
    if (!itemName || !description || !category || !price) {
      toast({
        title: "Missing fields",
        description: "Provide name, description, category, and price.",
        variant: "destructive",
      });
      return;
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a positive number.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await createMenuItem({
        restaurantId: Number(restaurant.id),
        itemName,
        description,
        category,
        price: parsedPrice,
        availability: true,
      });
      await refresh();
      setItemName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setOpen(false);
      toast({ title: "Menu item added", description: "Item saved successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!restaurant || !editingId) {
      return;
    }
    if (!itemName || !description || !category || !price) {
      toast({
        title: "Missing fields",
        description: "Provide name, description, category, and price.",
        variant: "destructive",
      });
      return;
    }
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast({
        title: "Invalid price",
        description: "Price must be a positive number.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      await updateMenuItem(editingId, {
        restaurantId: Number(restaurant.id),
        itemName,
        description,
        category,
        price: parsedPrice,
        availability: true,
      });
      await refresh();
      setEditOpen(false);
      setEditingId(null);
      toast({ title: "Menu item updated", description: "Changes saved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: (typeof items)[number]) => {
    setEditingId(item.id);
    setItemName(item.name ?? "");
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setPrice(String(item.price ?? ""));
    setEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this menu item?")) {
      return;
    }
    try {
      await deleteMenuItem(id);
      await refresh();
      toast({ title: "Menu item deleted", description: "Item removed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast({ title: "Delete failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu management"
        subtitle="Update pricing and availability"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add menu item</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                  <Input
                    placeholder="Item name"
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  <Input
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
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
            <DialogTitle>Edit menu item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Item name"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
            />
            <Input
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <Input
              placeholder="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <Input
              placeholder="Price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
