import { requireAdmin, getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminSettingsForm } from "./admin-settings-form";
import { AdminChangePasswordForm } from "./admin-change-password-form";
import { Shield, User, Lock, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your admin profile and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSettingsForm
              initialData={{
                fullName: profile.full_name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                address: profile.address || "",
              }}
            />
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminChangePasswordForm />
          </CardContent>
        </Card>
      </div>

      {/* Admin Role Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>Admin Role</CardTitle>
          </div>
          <CardDescription>
            Your current role and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Current Role:</span>
              <Badge variant="default" className="capitalize">
                {profile.role}
              </Badge>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Admin Privileges</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Manage all products and inventory</li>
                    <li>View and process customer orders</li>
                    <li>Access store analytics and reports</li>
                    <li>Configure store settings</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Account created on {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
