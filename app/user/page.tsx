import { getCachedFeaturedProducts, getCachedAllProducts } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import UserDashboardClient from "./user-dashboard-client";

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic';

// Server Component - fetches data on the server with caching
export default async function UserDashboard() {
  // Fetch products using cached queries (fast, server-side)
  const [featuredProducts, allProducts] = await Promise.all([
    getCachedFeaturedProducts(),
    getCachedAllProducts(),
  ]);

  // Fetch user profile (requires auth cookies, can't be cached)
  let profile = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      profile = data;
    }
  } catch (error) {
    // Profile fetch failed, continue without it
    console.error('Error fetching profile:', error);
  }

  return (
    <UserDashboardClient
      initialProfile={profile}
      initialFeaturedProducts={featuredProducts}
      initialAllProducts={allProducts}
    />
  );
}
