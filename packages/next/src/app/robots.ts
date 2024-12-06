export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api',
          '/creating-account',
          '/*.json',
          '/onboarding'
        ]
      }
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_BASE_URL
  }
} 