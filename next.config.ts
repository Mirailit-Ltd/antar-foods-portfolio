import type { NextConfig } from "next";

const YEAR = 60 * 60 * 24 * 365;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for a month; uploads get a new file name, so changes never go stale
    minimumCacheTTL: 60 * 60 * 24 * 31,
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/products/**", search: "" },
    ],
  },
  async headers() {
    return [
      // Admin uploads are saved under a unique name, so the files never change
      { source: "/products/:file*", headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }] },
      // Design images keep their names when replaced (see README), so revalidate daily
      { source: "/images/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
  experimental: {
    serverActions: {
      // Images are resized to WebP in the browser before upload; Amplify caps requests at ~6MB
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
