import { SitemapStream, streamToPromise } from 'sitemap'
import { Readable } from 'stream'
import fs from 'fs/promises'

export async function generateAndStoreSitemap() {
  // Get sitemap entries from your app/sitemap.ts
  const { default: getSitemapEntries } = await import('@/app/sitemap')
  const entries = await getSitemapEntries()
  
  const stream = new SitemapStream({ hostname: process.env.NEXT_PUBLIC_BASE_URL })
  
  const xml = await streamToPromise(
    Readable.from(entries).pipe(stream)
  ).then(data => data.toString())

  // Store in appropriate location based on deployment platform
  await fs.writeFile('./public/sitemap.xml', xml)
  
  // Ping search engines
  await Promise.all([
    fetch('http://www.google.com/ping?sitemap=' + process.env.NEXT_PUBLIC_BASE_URL + '/sitemap.xml'),
    fetch('http://www.bing.com/ping?sitemap=' + process.env.NEXT_PUBLIC_BASE_URL + '/sitemap.xml')
  ])
} 