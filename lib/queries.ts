import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Cached query functions for frequently accessed static/semi-static data.
 * Uses Next.js unstable_cache for server-side caching with revalidation.
 * 
 * IMPORTANT: These functions use a simple Supabase client (non-cookie-based)
 * because unstable_cache() doesn't support dynamic data sources like cookies().
 * This is fine since these queries are for public data that doesn't require auth.
 */

/**
 * Create a simple Supabase client for cached queries.
 * Does NOT use cookies, so it can be used inside unstable_cache().
 */
function createCacheClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

/**
 * Get featured products with caching (1 minute TTL)
 * Featured products may change more frequently
 */
export const getCachedFeaturedProducts = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(storage_path, media_type), product_variants(stock_quantity)')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(3);
    
    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
    return data || [];
  },
  ['featured-products'],
  { revalidate: 60 } // 1 minute
);
