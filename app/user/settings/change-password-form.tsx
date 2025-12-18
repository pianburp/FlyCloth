'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";

export function ChangePasswordForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password strength checks
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber;
    const canSubmit = isValidPassword && passwordsMatch;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!canSubmit) return;

        setIsLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message,
                });
            } else {
                toast({
                    title: "Password Updated",
                    description: "Your password has been changed successfully.",
                });
                setNewPassword("");
                setConfirmPassword("");
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

    const StrengthIndicator = ({ met, label }: { met: boolean; label: string }) => (
        <div className={`flex items-center gap-2 text-xs transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
            {met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            <span className="font-light">{label}</span>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-light">
                    New Password
                </Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="luxury-input pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {/* Password Strength Indicators */}
                {newPassword.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <StrengthIndicator met={hasMinLength} label="8+ characters" />
                        <StrengthIndicator met={hasUppercase} label="Uppercase letter" />
                        <StrengthIndicator met={hasLowercase} label="Lowercase letter" />
                        <StrengthIndicator met={hasNumber} label="Number" />
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-light">
                    Confirm New Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="luxury-input pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {confirmPassword.length > 0 && (
                    <div className={`flex items-center gap-2 text-xs transition-colors ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                        {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span className="font-light">{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="text-xs tracking-luxury uppercase"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
            </Button>
        </form>
    );
}
