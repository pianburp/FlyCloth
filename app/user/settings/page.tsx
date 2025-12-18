import { getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-6xl mx-auto">
      {/* Luxury Page Header */}
      <div className="luxury-page-header">
        <span className="label">Account</span>
        <h1>Settings</h1>
        <p>Manage your profile and account preferences</p>
        <div className="gold-divider mt-6" />
      </div>

      {/* Profile Information */}
      <div className="luxury-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border/40">
          <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
            Profile Information
          </h3>
          <p className="text-xs text-muted-foreground/70 font-light mt-1">
            Update your personal details and shipping address
          </p>
        </div>
        <div className="p-6">
          <SettingsForm
            initialData={{
              fullName: profile.full_name || "",
              email: profile.email || "",
              phone: profile.phone || "",
              address: profile.address || "",
            }}
          />
        </div>
      </div>

      {/* Change Password */}
      <div className="luxury-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border/40">
          <h3 className="text-sm tracking-luxury uppercase text-muted-foreground">
            Security
          </h3>
          <p className="text-xs text-muted-foreground/70 font-light mt-1">
            Update your password to keep your account secure
          </p>
        </div>
        <div className="p-6">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
