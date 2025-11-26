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
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          value={initialData.email} 
          disabled 
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input 
          id="fullName" 
          name="fullName" 
          defaultValue={initialData.fullName} 
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          name="phone" 
          defaultValue={initialData.phone} 
          placeholder="+1 234 567 890"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Shipping Address</Label>
        <Textarea 
          id="address" 
          name="address" 
          defaultValue={initialData.address} 
          placeholder="123 Main St, City, Country"
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
