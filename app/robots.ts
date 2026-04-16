import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/articles", "/login", "/health", "/asset"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
        disallow: ["/health", "/asset"],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
