import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://creatorflow-ai-sanjuvai14.vercel.app").replace(/\/$/, "");
  const pages = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.4 },
    { path: "/support", changeFrequency: "monthly" as const, priority: 0.5 },
  ];
  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
