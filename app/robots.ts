import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/callback',
          '/auth/error',
          '/user/cart/payment/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
