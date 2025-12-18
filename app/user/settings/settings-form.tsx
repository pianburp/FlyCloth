'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { updateProfile } from "./actions";
import { Loader2 } from "lucide-react";

interface SettingsFormProps {
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await updateProfile(formData);

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
    <form action={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-light">Email</Label>
        <Input
          id="email"
          value={initialData.email}
          disabled
          className="bg-muted/50 text-muted-foreground"
        />
        <p className="text-xs text-muted-foreground/70 font-light">
          Email address cannot be changed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-light">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={initialData.fullName}
          placeholder="John Doe"
          className="luxury-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-light">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={initialData.phone}
          placeholder="+60 12 345 6789"
          className="luxury-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-light">Shipping Address</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={initialData.address}
          placeholder="123 Main Street, City, State, Postal Code"
          className="min-h-[100px] luxury-input resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="text-xs tracking-luxury uppercase"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
