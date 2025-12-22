import { requireAdmin, getUserProfile } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminSettingsForm } from "./admin-settings-form";
import { AdminChangePasswordForm } from "./admin-change-password-form";
import { StoreSettingsForm } from "./store-settings-form";
import { PickupAddressForm } from "./pickup-address-form";
import { getStoreSettingsUncached } from "@/lib/services/store-settings";
import { Shield, User, Lock, Info, Store, Truck } from "lucide-react";

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

  const storeSettings = await getStoreSettingsUncached();

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your admin profile, account security, and store settings
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

        {/* Store Settings Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <CardTitle>Store Settings</CardTitle>
            </div>
            <CardDescription>
              Configure shipping fees, free shipping threshold, and tax rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StoreSettingsForm
              initialData={{
                shippingFee: storeSettings.shipping_fee,
                freeShippingThreshold: storeSettings.free_shipping_threshold,
                taxRate: storeSettings.tax_rate,
              }}
            />
          </CardContent>
        </Card>

        {/* EasyParcel Pickup Address Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <CardTitle>EasyParcel Pickup Address</CardTitle>
            </div>
            <CardDescription>
              Configure the pickup address for EasyParcel shipments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PickupAddressForm
              initialData={{
                pickupName: storeSettings.pickup_name || null,
                pickupCompany: storeSettings.pickup_company || null,
                pickupContact: storeSettings.pickup_contact || null,
                pickupAddr1: storeSettings.pickup_addr1 || null,
                pickupAddr2: storeSettings.pickup_addr2 || null,
                pickupCity: storeSettings.pickup_city || null,
                pickupState: storeSettings.pickup_state || null,
                pickupPostcode: storeSettings.pickup_postcode || null,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
