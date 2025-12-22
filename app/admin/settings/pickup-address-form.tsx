'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { updatePickupAddress } from "./actions";
import { Loader2, MapPin, Phone, Building2, User } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PickupAddressFormProps {
    initialData: {
        pickupName: string | null;
        pickupCompany: string | null;
        pickupContact: string | null;
        pickupAddr1: string | null;
        pickupAddr2: string | null;
        pickupCity: string | null;
        pickupState: string | null;
        pickupPostcode: string | null;
    };
}

const MALAYSIAN_STATES = [
    { value: 'jhr', label: 'Johor' },
    { value: 'kdh', label: 'Kedah' },
    { value: 'ktn', label: 'Kelantan' },
    { value: 'mlk', label: 'Melaka' },
    { value: 'nsn', label: 'Negeri Sembilan' },
    { value: 'phg', label: 'Pahang' },
    { value: 'prk', label: 'Perak' },
    { value: 'pls', label: 'Perlis' },
    { value: 'png', label: 'Pulau Pinang' },
    { value: 'sbh', label: 'Sabah' },
    { value: 'swk', label: 'Sarawak' },
    { value: 'sgr', label: 'Selangor' },
    { value: 'trg', label: 'Terengganu' },
    { value: 'kul', label: 'Kuala Lumpur' },
    { value: 'lbn', label: 'Labuan' },
    { value: 'pjy', label: 'Putrajaya' },
];

export function PickupAddressForm({ initialData }: PickupAddressFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedState, setSelectedState] = useState(initialData.pickupState || '');

    async function handleSubmit(formData: FormData) {
        // Add state to form data
        formData.set('pickupState', selectedState);

        setIsLoading(true);
        try {
            const result = await updatePickupAddress(formData);

            if (result?.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            } else {
                toast({
                    title: "Success",
                    description: "Pickup address has been updated.",
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

    const isConfigured = Boolean(initialData.pickupPostcode);

    return (
        <form action={handleSubmit} className="space-y-6">
            {!isConfigured && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ Pickup address is required for EasyParcel shipments. Please configure it before creating shipments.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Name */}
                <div className="space-y-2">
                    <Label htmlFor="pickupName" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Contact Name *
                    </Label>
                    <Input
                        id="pickupName"
                        name="pickupName"
                        type="text"
                        defaultValue={initialData.pickupName || ''}
                        placeholder="John Doe"
                        required
                    />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                    <Label htmlFor="pickupCompany" className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Company Name
                    </Label>
                    <Input
                        id="pickupCompany"
                        name="pickupCompany"
                        type="text"
                        defaultValue={initialData.pickupCompany || ''}
                        placeholder="FlyCloth Sdn Bhd"
                    />
                </div>

                {/* Contact Number */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pickupContact" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        Contact Number *
                    </Label>
                    <Input
                        id="pickupContact"
                        name="pickupContact"
                        type="text"
                        defaultValue={initialData.pickupContact || ''}
                        placeholder="0123456789"
                        required
                    />
                </div>

                {/* Address Line 1 */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pickupAddr1" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Address Line 1 *
                    </Label>
                    <Input
                        id="pickupAddr1"
                        name="pickupAddr1"
                        type="text"
                        defaultValue={initialData.pickupAddr1 || ''}
                        placeholder="No 123, Jalan ABC"
                        required
                    />
                </div>

                {/* Address Line 2 */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="pickupAddr2" className="text-sm font-medium">
                        Address Line 2
                    </Label>
                    <Input
                        id="pickupAddr2"
                        name="pickupAddr2"
                        type="text"
                        defaultValue={initialData.pickupAddr2 || ''}
                        placeholder="Taman XYZ"
                    />
                </div>

                {/* City */}
                <div className="space-y-2">
                    <Label htmlFor="pickupCity" className="text-sm font-medium">
                        City *
                    </Label>
                    <Input
                        id="pickupCity"
                        name="pickupCity"
                        type="text"
                        defaultValue={initialData.pickupCity || ''}
                        placeholder="Kuala Lumpur"
                        required
                    />
                </div>

                {/* State */}
                <div className="space-y-2">
                    <Label htmlFor="pickupState" className="text-sm font-medium">
                        State *
                    </Label>
                    <Select
                        value={selectedState}
                        onValueChange={setSelectedState}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                            {MALAYSIAN_STATES.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                    {state.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Postcode */}
                <div className="space-y-2">
                    <Label htmlFor="pickupPostcode" className="text-sm font-medium">
                        Postcode *
                    </Label>
                    <Input
                        id="pickupPostcode"
                        name="pickupPostcode"
                        type="text"
                        defaultValue={initialData.pickupPostcode || ''}
                        placeholder="50000"
                        required
                        maxLength={5}
                    />
                </div>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Pickup Address
            </Button>
        </form>
    );
}
