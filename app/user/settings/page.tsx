import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="container w-full py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and shipping address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm 
            initialData={{
              fullName: profile.full_name || "",
              email: profile.email || "",
              phone: profile.phone || "",
              address: profile.address || "",
            }} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
