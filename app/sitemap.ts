import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/content/api";
import { SITE_CONFIG, CATEGORIES } from "@/lib/constants/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/profile`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}${category.href}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const articles = await getAllArticles().catch(() => []);
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/${article.category}/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(article.date),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
