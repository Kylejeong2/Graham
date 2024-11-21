import Link from 'next/link'
import { prisma } from "@graham/db"

async function getPages() {
  // Get blog posts from database
  const blogPosts = await prisma.blogPost.findMany({
    select: {
      id: true,
      title: true,
      slug: true
    }
  })

  // Define static pages
  const staticPages = [
    { title: 'Home', path: '/' },
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'Contact', path: '/contact' },
    { title: 'Changelog', path: '/changelog' },
    { title: 'Directory', path: '/directory' },
  ]

  return {
    staticPages,
    blogPosts
  }
}

export default async function DirectoryPage() {
  const { staticPages, blogPosts } = await getPages()

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold text-blue-900 mb-8">Site Directory</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Main Pages</h2>
          <ul className="grid gap-3">
            {staticPages.map((page) => (
              <li key={page.path}>
                <Link 
                  href={page.path}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Blog Posts</h2>
          <ul className="grid gap-3">
            {blogPosts.map((post) => (
              <li key={post.id}>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
