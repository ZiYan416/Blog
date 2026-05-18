import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, created_at, updated_at')
    .eq('published', true)

  const base = siteUrl.replace(/\/$/, '')

  const urls = (posts || []).map((p: any) => {
    const loc = base ? `${base}/post/${encodeURIComponent(p.slug)}` : `/post/${encodeURIComponent(p.slug)}`
    const lastmod = p.updated_at || p.created_at
    return `
    <url>
      <loc>${loc}</loc>
      ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    </url>`
  }).join('\n')

  const homepage = base ? `${base}/` : `/`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${homepage}</loc>
    </url>
    ${urls}
  </urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
