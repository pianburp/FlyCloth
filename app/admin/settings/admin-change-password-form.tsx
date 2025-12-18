'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Eye, EyeOff, Check, X, Lock } from "lucide-react";

export function AdminChangePasswordForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password strength checks
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
    const hasCurrentPassword = currentPassword.length > 0;

    const isValidPassword = hasMinLength && hasUppercase && hasLowercase && hasNumber;
    const canSubmit = isValidPassword && passwordsMatch && hasCurrentPassword;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!canSubmit) return;

        setIsLoading(true);
        try {
            const supabase = createClient();

            // Get current user's email
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Unable to verify your identity. Please try again.",
                });
                return;
            }

            // Verify current password by attempting to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Current password is incorrect.",
                });
                return;
            }

            // Update to new password
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
                setCurrentPassword("");
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
            <span>{label}</span>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Current Password
                </Label>
                <div className="relative">
                    <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    New Password
                </Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pr-10"
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
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Confirm New Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pr-10"
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
                        <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="w-full sm:w-auto"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
            </Button>
        </form>
    );
}
