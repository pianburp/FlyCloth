"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateCSV, downloadCSV, CSVColumn } from "@/lib/export-utils";

interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items?: { id: string }[];
}

interface ExportOrdersButtonProps {
    orders: Order[];
}

export function ExportOrdersButton({ orders }: ExportOrdersButtonProps) {
    const handleExport = () => {
        const columns: CSVColumn<Order>[] = [
            { header: 'Order ID', accessor: (order) => order.id.slice(0, 8).toUpperCase() }, // Shortened for privacy
            { header: 'Customer Ref', accessor: (order) => `CUST-${order.user_id.slice(0, 6).toUpperCase()}` }, // Anonymized reference
            { header: 'Total (RM)', accessor: (order) => order.total_amount.toFixed(2) },
            { header: 'Status', accessor: 'status' },
            { header: 'Items', accessor: (order) => order.order_items?.length || 0 },
            { header: 'Date', accessor: (order) => new Date(order.created_at).toLocaleDateString() },
        ];

        const csv = generateCSV(orders, columns);
        const filename = `orders_export_${new Date().toISOString().split('T')[0]}`;
        downloadCSV(filename, csv);
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={orders.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
        </Button>
    );
}
