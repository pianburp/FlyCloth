'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updateStoreSettings } from "./actions";
import { Loader2, DollarSign, Truck, Percent } from "lucide-react";

interface StoreSettingsFormProps {
    initialData: {
        shippingFee: number;
        freeShippingThreshold: number;
        taxRate: number;
    };
}

export function StoreSettingsForm({ initialData }: StoreSettingsFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await updateStoreSettings(formData);

            if (result?.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            } else {
                toast({
                    title: "Success",
                    description: "Store settings have been updated.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Shipping Fee */}
            <div className="space-y-2">
                <Label htmlFor="shippingFee" className="text-sm font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    Shipping Fee (RM)
                </Label>
                <Input
                    id="shippingFee"
                    name="shippingFee"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={initialData.shippingFee}
                    placeholder="9.99"
                />
                <p className="text-xs text-muted-foreground">
                    Standard shipping fee charged when order is below free shipping threshold
                </p>
            </div>

            {/* Free Shipping Threshold */}
            <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Free Shipping Threshold (RM)
                </Label>
                <Input
                    id="freeShippingThreshold"
                    name="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={initialData.freeShippingThreshold}
                    placeholder="50.00"
                />
                <p className="text-xs text-muted-foreground">
                    Orders above this amount qualify for free shipping
                </p>
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                    Tax Rate (%)
                </Label>
                <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    defaultValue={(initialData.taxRate * 100).toFixed(1)}
                    placeholder="8.0"
                />
                <p className="text-xs text-muted-foreground">
                    Tax percentage applied to all orders (e.g., 8 for 8%)
                </p>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Store Settings
            </Button>
        </form>
    );
}
