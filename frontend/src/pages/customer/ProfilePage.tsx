import { useState } from "react";
import type { ChangeEvent } from "react";
import { User, Mail, Shield, Sun, Moon, Monitor, Bell, ChevronRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTheme } from "@/context/ThemeProvider";

type Tab = "account" | "preferences";

export const ProfilePage = () => {
  usePageTitle("Profile");
  const { user } = useAuth();
  const { profile, loading, save } = useProfile(user?.email);
  const { toast } = useToast();
  const { mode, setMode } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ name });
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-card p-6 card-elevated">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-orange-300 text-3xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <button
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground truncate">{user?.name ?? "Your Name"}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <Shield className="h-3 w-3" />
              {user?.role ?? "CUSTOMER"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
        {(["account", "preferences"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all duration-200 ${
              activeTab === tab
                ? "bg-brand-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Account tab */}
      {activeTab === "account" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 card-elevated animate-fade-in">
          <h2 className="font-bold text-foreground">Account information</h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Full name
              </label>
              <input
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder={profile?.name ?? "Enter your name"}
                disabled={loading}
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email address
              </label>
              <input
                value={profile?.email ?? user?.email ?? ""}
                disabled
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || saving}
            className="w-full rounded-xl btn-brand-gradient border-0 text-white py-5 font-semibold"
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}

      {/* Preferences tab */}
      {activeTab === "preferences" && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 card-elevated animate-fade-in">
          <h2 className="font-bold text-foreground mb-4">Preferences</h2>

          {/* Theme options */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1 mb-2">Theme</p>
            {([
              { m: "light" as const, label: "Light", icon: Sun, desc: "Classic bright interface" },
              { m: "dark" as const, label: "Dark", icon: Moon, desc: "Easy on the eyes at night" },
              { m: "system" as const, label: "System", icon: Monitor, desc: "Follows your device setting" },
            ]).map(({ m, label, icon: Icon, desc }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                  mode === m
                    ? "border-brand-500/40 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                    : "border-border bg-secondary/30 text-foreground hover:bg-secondary"
                }`}
                aria-label={`Set ${label} theme`}
              >
                <Icon className={`h-5 w-5 ${mode === m ? "text-brand-500" : "text-muted-foreground"}`} />
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                {mode === m && (
                  <span className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-brand-500" />
              <div>
                <p className="text-sm font-semibold text-foreground">Push notifications</p>
                <p className="text-xs text-muted-foreground">Order updates and promotions</p>
              </div>
            </div>
            <button
              className="relative h-6 w-11 rounded-full bg-brand-500 transition-colors"
              aria-label="Toggle notifications"
              id="profile-notif-toggle"
            >
              <span className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Security */}
          <button className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/30 px-4 py-3.5 hover:bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-brand-500" />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Security & privacy</p>
                <p className="text-xs text-muted-foreground">Change password, 2FA</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};
