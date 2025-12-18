"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Search, Mail, Phone, Calendar, ShoppingBag, DollarSign } from "lucide-react";

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

interface CustomerTableProps {
    customers: CustomerData[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);

    const filteredCustomers = customers.filter((customer) => {
        const searchLower = search.toLowerCase();
        return (
            customer.full_name?.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.phone?.toLowerCase().includes(searchLower)
        );
    });

    const formatCurrency = (amount: number) => {
        return `RM${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            {/* Search */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, email, or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium">Customer</th>
                            <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Phone</th>
                            <th className="text-center py-3 px-2 font-medium">Orders</th>
                            <th className="text-right py-3 px-2 font-medium">Lifetime Value</th>
                            <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">Last Purchase</th>
                            <th className="text-center py-3 px-2 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-3 px-2">
                                    <div>
                                        <p className="font-medium">{customer.full_name || "No name"}</p>
                                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                                    {customer.phone || "-"}
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <Badge variant={customer.total_orders > 0 ? "default" : "secondary"}>
                                        {customer.total_orders}
                                    </Badge>
                                </td>
                                <td className="py-3 px-2 text-right font-medium">
                                    {formatCurrency(customer.lifetime_value)}
                                </td>
                                <td className="py-3 px-2 text-right text-muted-foreground hidden lg:table-cell">
                                    {formatDate(customer.last_purchase)}
                                </td>
                                <td className="py-3 px-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedCustomer(customer)}
                                    >
                                        View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        No customers match your search.
                    </p>
                )}
            </div>

            {/* Customer Detail Modal */}
            <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedCustomer?.full_name || "Customer Details"}</DialogTitle>
                        <DialogDescription>
                            Customer ID: {selectedCustomer?.id.slice(0, 8)}...
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCustomer && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedCustomer.email}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedCustomer.phone || "Not provided"}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>Joined {formatDate(selectedCustomer.created_at)}</span>
                            </div>

                            <hr />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 rounded-lg p-4 text-center">
                                    <ShoppingBag className="w-5 h-5 mx-auto mb-2 text-primary" />
                                    <p className="text-2xl font-bold">{selectedCustomer.total_orders}</p>
                                    <p className="text-xs text-muted-foreground">Total Orders</p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 text-center">
                                    <DollarSign className="w-5 h-5 mx-auto mb-2 text-primary" />
                                    <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.lifetime_value)}</p>
                                    <p className="text-xs text-muted-foreground">Lifetime Value</p>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Last purchase: {formatDate(selectedCustomer.last_purchase)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
