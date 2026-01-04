"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteProductButtonProps {
    productId: string;
    productName: string;
    onDelete: (formData: FormData) => Promise<void>;
}

export function DeleteProductButton({ productId, productName, onDelete }: DeleteProductButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const formData = new FormData();
            formData.set('id', productId);
            await onDelete(formData);
            setIsOpen(false);
        } catch (error) {
            console.error("Error deleting product:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                        </>
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>&quot;{productName}&quot;</strong>?
                        {" "}This action cannot be undone. If this product has existing orders,
                        it will be deactivated instead of permanently deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
