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
    </div>
  );
}
