"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ReviewWithProduct {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    created_at: string;
    product_name: string;
    user_name: string | null;
    user_email: string;
}

interface ReviewsFilterProps {
    reviews: ReviewWithProduct[];
}

export function ReviewsFilter({ reviews }: ReviewsFilterProps) {
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);

    const filteredReviews = ratingFilter
        ? reviews.filter(r => r.rating === ratingFilter)
        : reviews;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                    variant={ratingFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRatingFilter(null)}
                >
                    All
                </Button>
                {[5, 4, 3, 2, 1].map((rating) => (
                    <Button
                        key={rating}
                        variant={ratingFilter === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRatingFilter(rating)}
                        className="gap-1"
                    >
                        {rating} <Star className="w-3 h-3 fill-current" />
                    </Button>
                ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                {renderStars(review.rating)}
                                <Badge variant="secondary" className="text-xs">
                                    {review.product_name}
                                </Badge>
                            </div>

                            {review.title && (
                                <p className="font-medium mb-1">{review.title}</p>
                            )}

                            {review.comment && (
                                <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{review.user_name || review.user_email}</span>
                                <span>•</span>
                                <span>{formatDate(review.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredReviews.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        No reviews match your filter.
                    </p>
                )}
            </div>
        </>
    );
}
