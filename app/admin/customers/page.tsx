import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { CustomerTable } from "./customer-table";

export const dynamic = 'force-dynamic';

interface CustomerData {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    created_at: string;
    total_orders: number;
    lifetime_value: number;
    last_purchase: string | null;
}

export default async function CustomersPage() {
    try {
        await requireAdmin();
    } catch {
        redirect("/user");
    }

    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Fetch all profiles with their order statistics
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
      id,
      full_name,
      phone,
      created_at,
      role
    `)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

    if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
    }

    // Fetch auth users to get emails (requires service role key)
    const { data: authData } = await serviceClient.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    // Fetch all orders for statistics
    const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount, created_at')
        .order('created_at', { ascending: false });

    // Calculate customer statistics
    const customers: CustomerData[] = (profiles || []).map((profile) => {
        const userOrders = orders?.filter(o => o.user_id === profile.id) || [];
        const authUser = authUsers.find(u => u.id === profile.id);

        return {
            id: profile.id,
            full_name: profile.full_name,
            email: authUser?.email || 'Unknown',
            phone: profile.phone,
            created_at: profile.created_at,
            total_orders: userOrders.length,
            lifetime_value: userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
            last_purchase: userOrders[0]?.created_at || null,
        };
    });

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Customer Management</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    View and manage registered customers
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <CardTitle>All Customers</CardTitle>
                    </div>
                    <CardDescription>
                        {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {customers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No customers found.</p>
                        </div>
                    ) : (
                        <CustomerTable customers={customers} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
