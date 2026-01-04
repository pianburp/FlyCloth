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

// =============================================================================
// PRODUCT QUERIES
// =============================================================================

/**
 * Get featured products with caching (1 minute TTL)
 * Featured products may change more frequently
 */
export const getCachedFeaturedProducts = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(storage_path, media_type), product_variants(stock_quantity, fit, gsm)')
      .eq('featured', true)
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

/**
 * Get all active products with caching (1 minute TTL)
 */
export const getCachedAllProducts = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(storage_path, media_type), product_variants(stock_quantity, fit, gsm)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
    return data || [];
  },
  ['all-products'],
  { revalidate: 60 } // 1 minute
);

/**
 * Get a single product by ID with caching (5 minute TTL)
 * Longer cache for individual product pages
 */
export const getCachedProductById = (productId: string) => unstable_cache(
  async () => {
    const supabase = createCacheClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(id, storage_path, media_type, is_primary, sort_order),
        product_variants(id, sku, size, fit, gsm, price, stock_quantity, is_active)
      `)
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    return data;
  },
  ['product', productId],
  { revalidate: 300 } // 5 minutes
)();

/**
 * Get products by search query with caching (30 second TTL)
 * Shorter cache for search results
 */
export const getCachedProductSearch = (query: string) => unstable_cache(
  async () => {
    const supabase = createCacheClient();
    // Sanitize query to prevent filter injection
    // Escape special PostgreSQL LIKE characters and Supabase filter syntax
    const sanitizedQuery = query
      .replace(/[%_]/g, '\\$&')  // Escape LIKE wildcards
      .replace(/[,()]/g, '')     // Remove filter syntax breakers
      .slice(0, 100);            // Limit query length
    
    if (!sanitizedQuery.trim()) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(storage_path, media_type), product_variants(stock_quantity, fit, gsm)')
      .eq('is_active', true)
      .or(`name.ilike.%${sanitizedQuery}%,sku.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error searching products:', error);
      return [];
    }
    return data || [];
  },
  ['product-search', query],
  { revalidate: 30 } // 30 seconds
)();

// =============================================================================
// ADMIN STATISTICS QUERIES
// =============================================================================

/**
 * Get admin dashboard stats with caching (5 minute TTL)
 */
export const getCachedAdminStats = unstable_cache(
  async () => {
    const supabase = createCacheClient();
    
    const [
      { count: totalProducts },
      { count: totalOrders },
      { data: recentOrders },
      { count: pendingOrders },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = recentOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      pendingOrders: pendingOrders || 0,
    };
  },
  ['admin-stats'],
  { revalidate: 300 } // 5 minutes
);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility: Get storage public URL helper
 * Use this to convert storage paths to public URLs
 */
export function getStorageUrl(storagePath: string, bucket = 'product-images'): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
}
