"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Check, X, Loader2 } from "lucide-react";
import { updateStock } from "./actions";
import type { VariantWithProduct } from "./page";

interface InventoryTableProps {
    items: VariantWithProduct[];
}

export function InventoryTable({ items }: InventoryTableProps) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "low" | "out">("all");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [isPending, startTransition] = useTransition();

    const filteredItems = items.filter((item) => {
        // Search filter
        const searchLower = search.toLowerCase();
        const matchesSearch =
            item.product_name.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower) ||
            item.color.toLowerCase().includes(searchLower) ||
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
        setEditValue(item.stock_quantity);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValue(0);
    };

    const handleSaveEdit = (variantId: string) => {
        startTransition(async () => {
            await updateStock(variantId, editValue);
            setEditingId(null);
        });
    };

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
                        placeholder="Search by product, SKU, color, size..."
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Product</th>
                            <th className="text-left py-3 px-2 font-medium">Variant</th>
                            <th className="text-center py-3 px-2 font-medium">Status</th>
                            <th className="text-center py-3 px-2 font-medium">Stock</th>
                            <th className="text-right py-3 px-2 font-medium">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-2">
                                    <div>
                                        <p className="font-medium line-clamp-1">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">{item.product_sku}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center gap-2">
                                        {item.color_hex && (
                                            <div
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: item.color_hex }}
                                                title={item.color}
                                            />
                                        )}
                                        <span>{item.size} / {item.color}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.sku}</p>
                                </td>
                                <td className="py-3 px-2 text-center">
                                    {getStockBadge(item.stock_quantity)}
                                </td>
                                <td className="py-3 px-2">
                                    {editingId === item.id ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={editValue}
                                                onChange={(e) => setEditValue(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-20 h-8 text-center"
                                                autoFocus
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={() => handleSaveEdit(item.id)}
                                                disabled={isPending}
                                            >
                                                {isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                                onClick={handleCancelEdit}
                                                disabled={isPending}
                                            >
                                                <X className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <button
                                            className="w-full text-center font-medium hover:text-primary transition-colors cursor-pointer"
                                            onClick={() => handleStartEdit(item)}
                                        >
                                            {item.stock_quantity}
                                        </button>
                                    )}
                                </td>
                                <td className="py-3 px-2 text-right font-medium">
                                    RM{Number(item.price).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        No items match your filters.
                    </p>
                )}
            </div>
        </>
    );
}
