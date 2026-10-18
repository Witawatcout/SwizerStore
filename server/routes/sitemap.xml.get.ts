import { query } from '@@/server/utils/db'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default defineEventHandler(async (event) => {
  const siteUrl = 'https://www.swizerstore.com'

  const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/products', changefreq: 'daily', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.8' },
    { path: '/news', changefreq: 'weekly', priority: '0.8' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' },
    { path: '/howtopay', changefreq: 'monthly', priority: '0.6' },
    { path: '/policies/shipping', changefreq: 'yearly', priority: '0.4' },
    { path: '/policies/cancellation-refund', changefreq: 'yearly', priority: '0.4' },
    { path: '/policies/privacy', changefreq: 'yearly', priority: '0.4' },
    { path: '/policies/cookies', changefreq: 'yearly', priority: '0.4' },
  ]

  let productIds: string[] = []
  let newsIds: string[] = []

  try {
    const products = await query(`
      SELECT p.id
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE COALESCE(p.is_active, 1) = 1
        AND (p.category_id IS NULL OR (COALESCE(c.is_active, 1) = 1 AND (c.parent_id IS NULL OR COALESCE(parent.is_active, 1) = 1)))
    `)
    productIds = products.map((p: any) => String(p.id)).filter(Boolean)
  } catch {
    productIds = []
  }

  try {
    const news = await query('SELECT id FROM news ORDER BY created_at DESC')
    newsIds = news.map((n: any) => String(n.id)).filter(Boolean)
  } catch {
    newsIds = []
  }

  const urls = [
    ...staticRoutes.map(
      (route) => `  <url>
    <loc>${escapeXml(`${siteUrl}${route.path}`)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    ),
    ...productIds.map(
      (id) => `  <url>
    <loc>${escapeXml(`${siteUrl}/products/${encodeURIComponent(id)}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    ),
    ...newsIds.map(
      (id) => `  <url>
    <loc>${escapeXml(`${siteUrl}/news/${encodeURIComponent(id)}`)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
