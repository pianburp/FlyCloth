import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "./category-form";
import { deleteCategory } from "./actions";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    try {
        await requireAdmin();
    } catch {
        redirect("/user");
    }

    const supabase = await createClient();

    // Fetch all categories with product count
    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, created_at')
        .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
    }

    // Fetch product counts per category
    const { data: products } = await supabase
        .from('products')
        .select('category_id');

    const categoryWithCounts = (categories || []).map((category) => ({
        ...category,
        product_count: products?.filter(p => p.category_id === category.id).length || 0,
    }));

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Category Management</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Organize your products into categories
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Category */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            <CardTitle>Add New Category</CardTitle>
                        </div>
                        <CardDescription>
                            Create a new product category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm />
                    </CardContent>
                </Card>

                {/* Categories List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-primary" />
                            <CardTitle>All Categories</CardTitle>
                        </div>
                        <CardDescription>
                            {categoryWithCounts.length} categor{categoryWithCounts.length !== 1 ? 'ies' : 'y'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categoryWithCounts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No categories yet. Create one!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categoryWithCounts.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CategoryForm
                                                categoryId={category.id}
                                                initialName={category.name}
                                                isEdit
                                            />
                                            <form action={deleteCategory}>
                                                <input type="hidden" name="id" value={category.id} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="submit"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    disabled={category.product_count > 0}
                                                    title={category.product_count > 0 ? "Cannot delete category with products" : "Delete category"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
