/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/dashboard',
    '/admin',
    '/api/*',
    '/creating-account',
    '/onboarding'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/admin',
          '/api',
          '/creating-account',
          '/onboarding'
        ]
      }
    ]
  },
  transform: async (config, path) => {
    // Customize priority based on path
    let priority = config.priority

    if (path === '/') priority = 1.0
    else if (path.startsWith('/blog/')) priority = 0.8
    else if (path.startsWith('/industry/')) priority = 0.9

    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: []
    }
  }
} 