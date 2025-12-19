"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateCSV, downloadCSV, CSVColumn } from "@/lib/export-utils";

interface InventoryItem {
    id: string;
    sku: string;
    size: string;
    fit: string;
    gsm: number | null;
    price: number;
    stock_quantity: number;
    product_name: string;
    product_sku: string;
}

interface ExportInventoryButtonProps {
    items: InventoryItem[];
}

export function ExportInventoryButton({ items }: ExportInventoryButtonProps) {
    const handleExport = () => {
        const columns: CSVColumn<InventoryItem>[] = [
            { header: 'Product', accessor: 'product_name' },
            { header: 'Product SKU', accessor: 'product_sku' },
            { header: 'Variant SKU', accessor: 'sku' },
            { header: 'Size', accessor: 'size' },
            { header: 'Fit', accessor: 'fit' },
            { header: 'GSM', accessor: (item) => item.gsm?.toString() || '' },
            { header: 'Stock', accessor: 'stock_quantity' },
            { header: 'Price (RM)', accessor: (item) => item.price.toFixed(2) },
        ];

        const csv = generateCSV(items, columns);
        const filename = `inventory_export_${new Date().toISOString().split('T')[0]}`;
        downloadCSV(filename, csv);
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={items.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
        </Button>
    );
}
