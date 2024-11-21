import { prisma } from "@graham/db"

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // Static routes with custom priorities
  const staticRoutes = [
    { url: '/', lastModified: new Date(), changeFreq: 'daily', priority: 1.0 },
    { url: '/contact', lastModified: new Date(), changeFreq: 'weekly', priority: 0.8 },
    { url: '/sign-up', lastModified: new Date(), changeFreq: 'weekly', priority: 0.9 },
    { url: '/changelog', lastModified: new Date(), changeFreq: 'weekly', priority: 0.6 }
  ]

  // Dynamic blog posts
  const blogPosts = await prisma.blogPost.findMany({
    select: {
      slug: true,
      createdAt: true
    },
    where: {
      published: true
    }
  })

  const blogRoutes = blogPosts.map(post => ({
    url: `/blog/post/${post.slug}`,
    lastModified: post.createdAt,
    changeFreq: 'weekly',
    priority: 0.7
  }))

  // Industry-specific landing pages (for SEO targeting)
  const industries = [
    'dental', 'plumbing', 'hvac', 'legal', 
    'real-estate', 'medical', 'automotive'
  ]

  const industryRoutes = industries.map(industry => ({
    url: `/industry/${industry}`,
    lastModified: new Date(),
    changeFreq: 'monthly',
    priority: 0.85
  }))

  return [...staticRoutes, ...blogRoutes, ...industryRoutes].map(route => ({
    ...route,
    url: `${baseUrl}${route.url}`
  }))
} 