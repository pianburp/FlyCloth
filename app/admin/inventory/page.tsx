import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle } from "lucide-react";
import { InventoryTable } from "./inventory-table";
import { ExportInventoryButton } from "./export-inventory-button";

export const dynamic = 'force-dynamic';

export interface VariantWithProduct {
    id: string;
    sku: string;
    size: string;
    fit: string;
    gsm: number | null;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    product_id: string;
    product_name: string;
    product_sku: string;
}

export default async function InventoryPage() {
    try {
        await requireAdmin();
    } catch {
        redirect("/user");
    }

    const supabase = await createClient();

    // Fetch all variants with product info
    const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
      id,
      sku,
      size,
      fit,
      gsm,
      price,
      stock_quantity,
      is_active,
      product_id
    `)
        .order('stock_quantity', { ascending: true });

    if (error) {
        console.error("Error fetching variants:", error);
    }

    // Fetch products for names
    const { data: products } = await supabase
        .from('products')
        .select('id, name, sku');

    // Merge product info
    const inventoryItems: VariantWithProduct[] = (variants || []).map((variant) => {
        const product = products?.find(p => p.id === variant.product_id);
        return {
            ...variant,
            product_name: product?.name || 'Unknown Product',
            product_sku: product?.sku || '',
        };
    });

    const lowStockCount = inventoryItems.filter(v => v.stock_quantity < 25 && v.stock_quantity > 0).length;
    const outOfStockCount = inventoryItems.filter(v => v.stock_quantity === 0).length;

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Inventory Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Monitor and update stock levels
                    </p>
                </div>
                <ExportInventoryButton items={inventoryItems} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Variants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{inventoryItems.length}</p>
                    </CardContent>
                </Card>

                <Card className={lowStockCount > 0 ? "border-orange-500/50 bg-orange-500/5" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Low Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                    </CardContent>
                </Card>

                <Card className={outOfStockCount > 0 ? "border-destructive/50 bg-destructive/5" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-destructive flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Out of Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <CardTitle>All Inventory</CardTitle>
                    </div>
                    <CardDescription>
                        Click on stock quantity to update
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {inventoryItems.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No inventory items found.</p>
                        </div>
                    ) : (
                        <InventoryTable items={inventoryItems} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
