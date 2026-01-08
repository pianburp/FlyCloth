import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering since we use Supabase which accesses cookies
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_active', true);

    if (products) {
      productPages = products.map((product) => ({
        url: `${baseUrl}/user/products/${product.id}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    // If database is unavailable, continue with static pages only
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...productPages];
}
