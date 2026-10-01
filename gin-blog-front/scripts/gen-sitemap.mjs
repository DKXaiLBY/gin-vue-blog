// 站点地图生成器: 静态路由 + 线上文章列表合并写入 public/sitemap.xml
// 用法: node scripts/gen-sitemap.mjs [baseUrl]   (默认 http://47.121.119.191)
// 域名定稿后重跑一次即可切换全部绝对 URL

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const BASE = (process.argv[2] || 'http://47.121.119.191').replace(/\/$/, '')
const OUT = fileURLToPath(new URL('../public/sitemap.xml', import.meta.url))

const STATIC_ROUTES = [
  { path: '/', freq: 'daily', priority: '1.0' },
  { path: '/archives', freq: 'weekly', priority: '0.8' },
  { path: '/projects', freq: 'weekly', priority: '0.8' },
  { path: '/resume', freq: 'monthly', priority: '0.8' },
  { path: '/timeline', freq: 'monthly', priority: '0.6' },
  { path: '/links', freq: 'monthly', priority: '0.5' },
  { path: '/about', freq: 'monthly', priority: '0.6' },
  { path: '/message', freq: 'weekly', priority: '0.5' },
]

async function fetchArticles() {
  // 只发一次请求拿大页; 文章超过 100 篇后再考虑翻页
  const resp = await fetch(`${BASE}/api/front/article/list?page_size=100&page_num=1`)
  const body = await resp.json()
  if (body.code !== 0) {
    throw new Error(`API 返回非 0: ${body.message}`)
  }
  return body.data?.page_data ?? []
}

const articles = await fetchArticles().catch((err) => {
  console.error('拉取文章列表失败, 只生成静态路由:', err.message)
  return []
})

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const rows = [
  ...STATIC_ROUTES.map(r => `  <url><loc>${BASE}${r.path}</loc><changefreq>${r.freq}</changefreq><priority>${r.priority}</priority></url>`),
  ...articles.map(a => `  <url><loc>${BASE}/article/${a.id}</loc><lastmod>${(a.updated_at || a.created_at || '').slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`
writeFileSync(OUT, xml)
console.log(`sitemap.xml 已生成: ${STATIC_ROUTES.length} 条静态路由 + ${articles.length} 篇文章 → ${esc(OUT)}`)
