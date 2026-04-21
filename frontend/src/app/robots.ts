import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot'],
        allow: '/',
      }
    ],
    sitemap: 'https://resumemaxxing.com/sitemap.xml',
  };
}
