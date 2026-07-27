import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { absoluteSiteUrl } from "@/lib/site-config";

export const revalidate = 3600;

const STATIC_PATHS = ["/", "/post", "/tag", "/about", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [postsResult, tagsResult] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, created_at, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false }),
    supabase
      .from("tags")
      .select("slug, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteSiteUrl(path),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = (postsResult.data || []).map((post) => ({
    url: absoluteSiteUrl(`/post/${encodeURIComponent(post.slug)}`),
    lastModified: post.updated_at || post.created_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tagEntries: MetadataRoute.Sitemap = (tagsResult.data || []).map((tag) => ({
    url: absoluteSiteUrl(`/tag/${encodeURIComponent(tag.slug)}`),
    lastModified: tag.created_at,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}
