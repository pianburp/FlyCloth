"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Check, X, Loader2, Trash2, Edit2 } from "lucide-react";
import { updateVariant, deleteVariant } from "./actions";
import type { VariantWithProduct } from "./page";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface InventoryTableProps {
    items: VariantWithProduct[];
}

export function InventoryTable({ items }: InventoryTableProps) {
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "low" | "out">("all");
    const [editingId, setEditingId] = useState<string | null>(null);

    // Edit states
    const [editStock, setEditStock] = useState<number>(0);
    const [editPrice, setEditPrice] = useState<number>(0);

    const [isPending, startTransition] = useTransition();

    const filteredItems = items.filter((item) => {
        // Search filter
        const searchLower = search.toLowerCase();
        const matchesSearch =
            item.product_name.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower) ||
            item.fit.toLowerCase().includes(searchLower) ||
            item.size.toLowerCase().includes(searchLower);

        // Stock filter
        let matchesFilter = true;
        if (filter === "low") {
            matchesFilter = item.stock_quantity < 25 && item.stock_quantity > 0;
        } else if (filter === "out") {
            matchesFilter = item.stock_quantity === 0;
        }

        return matchesSearch && matchesFilter;
    });

    const handleStartEdit = (item: VariantWithProduct) => {
        setEditingId(item.id);
        setEditStock(item.stock_quantity);
        setEditPrice(item.price);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleSaveEdit = (variantId: string) => {
        startTransition(async () => {
            try {
                await updateVariant(variantId, { stock: editStock, price: editPrice });
                setEditingId(null);
                toast({ title: "Success", description: "Variant updated" });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to update" });
            }
        });
    };

    const handleToggleStatus = (variantId: string, currentStatus: boolean) => {
        startTransition(async () => {
            try {
                await updateVariant(variantId, { is_active: !currentStatus });
                toast({ title: "Success", description: "Status updated" });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to update status" });
            }
        });
    }

    const handleDelete = (variantId: string) => {
        if (!confirm("Are you sure you want to delete this variant?")) return;

        startTransition(async () => {
            try {
                await deleteVariant(variantId);
                toast({ title: "Success", description: "Variant deleted" });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to delete" });
            }
        });
    }

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) {
            return <Badge variant="destructive">Out of Stock</Badge>;
        } else if (quantity < 25) {
            return <Badge className="bg-orange-500 hover:bg-orange-600">Low Stock</Badge>;
        }
        return <Badge variant="secondary">In Stock</Badge>;
    };

    return (
        <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by product, SKU, fit, size..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === "low" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter("low")}
                        className={filter === "low" ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                        Low Stock
                    </Button>
                    <Button
                        variant={filter === "out" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setFilter("out")}
                    >
                        Out of Stock
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium">Product</th>
                                <th className="text-left py-3 px-4 font-medium">Variant</th>
                                <th className="text-center py-3 px-4 font-medium">Status</th>
                                <th className="text-center py-3 px-4 font-medium">Stock</th>
                                <th className="text-right py-3 px-4 font-medium">Price</th>
                                <th className="text-right py-3 px-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => {
                                const isEditing = editingId === item.id;
                                return (
                                    <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium line-clamp-1">{item.product_name}</p>
                                                <p className="text-xs text-muted-foreground">{item.product_sku}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{item.size}</Badge>
                                                <span className="text-muted-foreground">/</span>
                                                <span>{item.fit}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {item.gsm ? `${item.gsm} GSM` : '-'}
                                            </p>
                                            <p className="text-xs font-mono text-muted-foreground">{item.sku}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getStockBadge(item.stock_quantity)}
                                                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                                                    <span className={`text-[10px] ${item.is_active ? "text-green-600" : "text-muted-foreground"}`}>
                                                        {item.is_active ? "Active" : "Inactive"}
                                                    </span>
                                                    <Switch
                                                        checked={item.is_active}
                                                        onCheckedChange={() => handleToggleStatus(item.id, item.is_active)}
                                                        className="scale-75"
                                                        disabled={isPending}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-center min-w-[100px]">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100000"
                                                    step="1"
                                                    value={editStock}
                                                    onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-20 h-8 text-center mx-auto"
                                                />
                                            ) : (
                                                <span
                                                    className="font-medium cursor-pointer hover:underline underline-offset-4 decoration-dashed"
                                                    onClick={() => handleStartEdit(item)}
                                                >
                                                    {item.stock_quantity}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right min-w-[100px]">
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={editPrice}
                                                    onChange={(e) => setEditPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                                    className="w-24 h-8 text-right ml-auto"
                                                />
                                            ) : (
                                                <span>RM{Number(item.price).toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {isEditing ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleSaveEdit(item.id)}
                                                        disabled={isPending}
                                                    >
                                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={handleCancelEdit}
                                                        disabled={isPending}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                        onClick={() => handleStartEdit(item)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border-t">
                        <p>No items match your filters.</p>
                    </div>
                )}
            </div>
        </>
    );
}
