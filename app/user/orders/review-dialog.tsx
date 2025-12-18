"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Star, Loader2, Pencil, Trash2, MessageSquarePlus } from "lucide-react";
import { createReview, updateReview, deleteReview } from "./actions";

interface ExistingReview {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
}

interface ReviewDialogProps {
    productId: string;
    productName: string;
    orderId: string;
    existingReview?: ExistingReview | null;
}

export function ReviewDialog({ productId, productName, orderId, existingReview }: ReviewDialogProps) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(existingReview?.rating || 5);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState(existingReview?.title || "");
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [isPending, startTransition] = useTransition();

    const isEdit = !!existingReview;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.set('rating', rating.toString());
        formData.set('title', title);
        formData.set('comment', comment);

        if (isEdit && existingReview) {
            formData.set('reviewId', existingReview.id);
        } else {
            formData.set('productId', productId);
            formData.set('orderId', orderId);
        }

        startTransition(async () => {
            try {
                if (isEdit) {
                    await updateReview(formData);
                } else {
                    await createReview(formData);
                }
                setOpen(false);
            } catch (error) {
                console.error("Error:", error);
            }
        });
    };

    const handleDelete = () => {
        if (!existingReview || !confirm("Are you sure you want to delete this review?")) return;

        const formData = new FormData();
        formData.set('reviewId', existingReview.id);

        startTransition(async () => {
            try {
                await deleteReview(formData);
                setOpen(false);
            } catch (error) {
                console.error("Error:", error);
            }
        });
    };

    const renderStars = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`w-6 h-6 transition-colors ${star <= (hoverRating || rating)
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                        <Pencil className="w-3 h-3" />
                        Edit Review
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                        <MessageSquarePlus className="w-3 h-3" />
                        Write Review
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Review" : "Write a Review"}</DialogTitle>
                    <DialogDescription>
                        {productName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {/* Star Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rating</label>
                        {renderStars()}
                    </div>

                    {/* Title (optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title (optional)</label>
                        <Input
                            placeholder="Summarize your experience..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                    </div>

                    {/* Comment (optional) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Comment (optional)</label>
                        <Textarea
                            placeholder="Share details of your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={500}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-2">
                        {isEdit && existingReview && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                            </Button>
                        )}
                        <div className={`flex gap-2 ${!isEdit ? 'ml-auto' : ''}`}>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : isEdit ? (
                                    "Update"
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
