import type { MetadataRoute } from 'next'

const BASE_URL = 'https://ayushman.world'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                     lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/research`,       lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/videos`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/ai`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/community`,      lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/donate`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resources`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/partners`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`,          lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/transparency`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/terms`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  return staticRoutes
}
