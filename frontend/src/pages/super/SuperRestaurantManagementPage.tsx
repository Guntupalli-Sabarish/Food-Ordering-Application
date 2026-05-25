import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { useManagedRestaurants } from "@/hooks/useManagedRestaurants";
import { usePageTitle } from "@/hooks/usePageTitle";

export const SuperRestaurantManagementPage = () => {
  usePageTitle("Restaurant Management");
  const { restaurants } = useManagedRestaurants();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant approvals"
        subtitle="Review new onboarding requests"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Restaurant</TableHead>
            <TableHead>Cuisine</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((restaurant, index) => (
            <TableRow key={restaurant.id}>
              <TableCell className="font-medium">{restaurant.name}</TableCell>
              <TableCell>{restaurant.cuisine}</TableCell>
              <TableCell>
                <Badge variant={index % 2 === 0 ? "secondary" : "default"}>
                  {index % 2 === 0 ? "Pending" : "Approved"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
