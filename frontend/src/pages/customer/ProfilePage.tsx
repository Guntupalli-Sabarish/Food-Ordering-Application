import { useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

export const ProfilePage = () => {
  usePageTitle("Profile");
  const { user } = useAuth();
  const { profile, loading, save } = useProfile(user?.email);
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");

  const handleSave = async () => {
    await save({ name });
    toast({ title: "Profile updated" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <Card>
        <CardHeader className="text-sm text-muted-foreground">
          Account information
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setName(event.target.value)
            }
            placeholder={profile?.name ?? "Full name"}
            disabled={loading}
          />
          <Input value={profile?.email ?? user?.email ?? ""} disabled />
          <Button onClick={handleSave} disabled={loading}>
            Save changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
