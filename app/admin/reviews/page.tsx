import { requireAdmin } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReviewsFilter } from "./reviews-filter";

export const dynamic = 'force-dynamic';

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

export default async function ReviewsPage() {
    try {
        await requireAdmin();
    } catch {
        redirect("/user");
    }

    const supabase = await createClient();
    const serviceClient = createServiceClient();

    // Fetch all reviews with product and user info
    const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select(`
      id,
      rating,
      title,
      comment,
      created_at,
      product_id,
      user_id
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
    }

    // Fetch products for names
    const { data: products } = await supabase
        .from('products')
        .select('id, name');

    // Fetch profiles for user names
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name');

    // Fetch auth users for emails - requires service role key
    const { data: authData } = await serviceClient.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    // Merge data
    const reviewsWithDetails: ReviewWithProduct[] = (reviews || []).map((review) => {
        const product = products?.find(p => p.id === review.product_id);
        const profile = profiles?.find(p => p.id === review.user_id);
        const authUser = authUsers.find(u => u.id === review.user_id);

        return {
            id: review.id,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            created_at: review.created_at,
            product_name: product?.name || 'Unknown Product',
            user_name: profile?.full_name,
            user_email: authUser?.email || 'Unknown',
        };
    });

    // Calculate stats
    const avgRating = reviewsWithDetails.length > 0
        ? reviewsWithDetails.reduce((sum, r) => sum + r.rating, 0) / reviewsWithDetails.length
        : 0;

    const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviewsWithDetails.filter(r => r.rating === rating).length
    }));

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reviews Center</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    View customer reviews and feedback
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{reviewsWithDetails.length}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1">
                            <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            {ratingCounts.map(({ rating, count }) => (
                                <div key={rating} className="flex items-center gap-1 text-sm">
                                    <span>{rating}</span>
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-muted-foreground">({count})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        <CardTitle>All Reviews</CardTitle>
                    </div>
                    <CardDescription>
                        Filter by rating to view reviews
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {reviewsWithDetails.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No reviews yet.</p>
                        </div>
                    ) : (
                        <ReviewsFilter reviews={reviewsWithDetails} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
