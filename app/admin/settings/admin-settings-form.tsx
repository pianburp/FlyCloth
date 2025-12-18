'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateAdminProfile } from "./actions";
import { Loader2, User, Phone, MapPin, Mail } from "lucide-react";

interface AdminSettingsFormProps {
    initialData: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
    };
}

export function AdminSettingsForm({ initialData }: AdminSettingsFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await updateAdminProfile(formData);

            if (result?.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            } else {
                toast({
                    title: "Success",
                    description: "Your profile has been updated.",
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
            {/* Email - Read Only */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                </Label>
                <Input
                    id="email"
                    value={initialData.email}
                    disabled
                    className="bg-muted/50 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                    Email address cannot be changed
                </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                </Label>
                <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={initialData.fullName}
                    placeholder="Enter your full name"
                />
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                </Label>
                <Input
                    id="phone"
                    name="phone"
                    defaultValue={initialData.phone}
                    placeholder="+60 12 345 6789"
                />
            </div>

            {/* Address */}
            <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Address
                </Label>
                <Textarea
                    id="address"
                    name="address"
                    defaultValue={initialData.address}
                    placeholder="Enter your address"
                    className="min-h-[100px] resize-none"
                />
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    );
}
