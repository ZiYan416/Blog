import type { NextConfig } from "next";
import {
  getSupabaseHostname,
  IMGBED_HOSTNAME,
} from "./src/lib/image-hosts";

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/videos/:asset*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/videos/about/:asset*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:asset*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  images: {
    minimumCacheTTL: 604800,
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: IMGBED_HOSTNAME,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.bing.net",
        pathname: "/th/id/**",
      },
    ],
  },
};

export default nextConfig;
