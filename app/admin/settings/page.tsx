import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/user");
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Store Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configure your FlyCloth store settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name</Label>
                <Input id="store-name" defaultValue="FlyCloth" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Store Email</Label>
                <Input id="store-email" type="email" defaultValue="contact@flycloth.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-phone">Phone Number</Label>
                <Input id="store-phone" type="tel" defaultValue="+1234567890" />
              </div>
              <Button>Save Changes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Settings</CardTitle>
            <CardDescription>Configure pricing and taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input id="tax-rate" type="number" step="0.01" defaultValue="10.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shipping-fee">Shipping Fee (RM)</Label>
                <Input id="shipping-fee" type="number" step="0.01" defaultValue="5.99" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="free-shipping">Free Shipping Threshold (RM)</Label>
                <Input id="free-shipping" type="number" step="0.01" defaultValue="100.00" />
              </div>
              <Button>Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To assign admin roles to users, update the user's role in the Supabase profiles table.
          </p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Current Role:</strong> Admin</p>
            <p className="text-sm text-muted-foreground">
              Admin users can manage products, orders, pricing, and all store settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
