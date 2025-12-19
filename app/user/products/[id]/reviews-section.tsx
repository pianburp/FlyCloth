"use client";

import { Star, MessageSquare } from "lucide-react";
import { ReviewDialog } from "@/app/user/orders/review-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Review {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    created_at: string;
    user_id: string;
    order_id: string;
    profiles: {
        full_name: string | null;
    } | null;
}

interface UserPurchase {
    order_id: string;
    existing_review: {
        id: string;
        rating: number;
        title: string | null;
        comment: string | null;
    } | null;
}

interface ReviewsSectionProps {
    productId: string;
    productName: string;
    reviews: Review[];
    userPurchases: UserPurchase[];
    isLoggedIn: boolean;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                />
            ))}
        </div>
    );
}

export default function ReviewsSection({
    productId,
    productName,
    reviews,
    userPurchases,
    isLoggedIn,
}: ReviewsSectionProps) {
    // Calculate average rating
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;

    // Find the first purchase that doesn't have a review yet (for "Write Review")
    const purchaseWithoutReview = userPurchases.find((p) => !p.existing_review);

    // Find any purchase that has a review (for "Edit Review")
    const purchaseWithReview = userPurchases.find((p) => p.existing_review);

    return (
        <div className="mt-12">
            {/* Reviews Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-medium tracking-tight">Customer Reviews</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                            <StarRating rating={Math.round(averageRating)} />
                            <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                        </span>
                    </div>
                </div>

                {/* Write/Edit Review Button */}
                {isLoggedIn && purchaseWithoutReview && (
                    <ReviewDialog
                        productId={productId}
                        productName={productName}
                        orderId={purchaseWithoutReview.order_id}
                        existingReview={null}
                    />
                )}
                {isLoggedIn && !purchaseWithoutReview && purchaseWithReview && (
                    <ReviewDialog
                        productId={productId}
                        productName={productName}
                        orderId={purchaseWithReview.order_id}
                        existingReview={purchaseWithReview.existing_review}
                    />
                )}
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-30" />
                            <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <StarRating rating={review.rating} />
                                        {review.title && (
                                            <h3 className="font-medium mt-2">{review.title}</h3>
                                        )}
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>{review.profiles?.full_name || "Anonymous"}</p>
                                        <p>
                                            {new Date(review.created_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!isLoggedIn && reviews.length === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    <a href="/auth/login" className="text-primary hover:underline">
                        Sign in
                    </a>{" "}
                    to leave a review after your purchase
                </p>
            )}
        </div>
    );
}
