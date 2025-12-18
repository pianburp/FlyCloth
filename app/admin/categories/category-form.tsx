"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { createCategory, updateCategory } from "./actions";

interface CategoryFormProps {
    categoryId?: string;
    initialName?: string;
    isEdit?: boolean;
}

export function CategoryForm({ categoryId, initialName = "", isEdit = false }: CategoryFormProps) {
    const [name, setName] = useState(initialName);
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        const formData = new FormData();
        formData.set('name', name);

        if (isEdit && categoryId) {
            formData.set('id', categoryId);
        }

        startTransition(async () => {
            try {
                if (isEdit) {
                    await updateCategory(formData);
                } else {
                    await createCategory(formData);
                }
                setOpen(false);
                if (!isEdit) {
                    setName("");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        });
    };

    // For new category - inline form
    if (!isEdit) {
        return (
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Category name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                />
                <Button type="submit" disabled={isPending || !name.trim()}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </Button>
            </form>
        );
    }

    // For edit - dialog
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update the category name
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex gap-2 pt-4">
                    <Input
                        placeholder="Category name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1"
                        autoFocus
                    />
                    <Button type="submit" disabled={isPending || !name.trim()}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
