import type { NextConfig } from "next";

function getSupabaseHostname() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").hostname;
  } catch {
    return "";
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
};

export default nextConfig;
