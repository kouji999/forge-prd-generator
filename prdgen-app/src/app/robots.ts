import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forge.raliq.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/prd', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
