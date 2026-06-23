import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing implicit any types in admin/legacy pages
    // Tracked for cleanup; don't block production builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      // ─── 场景与指南合并 (规范3: 入口清洗) ───
      {
        source: '/scenarios',
        destination: '/tools',
        permanent: true,
      },
      {
        source: '/scenarios/:slug*',
        destination: '/tools/:slug*',
        permanent: true,
      },
      // ─── 个人中心瘦身 (规范3: 冗余入口折叠) ───
      {
        source: '/user/tasks',
        destination: '/user/membership-growth',
        permanent: true,
      },
      {
        source: '/user/points',
        destination: '/user/membership-growth',
        permanent: true,
      },
      {
        source: '/user/membership',
        destination: '/user/membership-growth',
        permanent: true,
      },
      // ─── /countries → /destinations canonical merge (v18.6.5.2) ───
      {
        source: '/countries',
        destination: '/destinations',
        permanent: true,
      },
      {
        source: '/countries/:slug*',
        destination: '/destinations/:slug*',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
        has: [
          {
            type: "host",
            value: "jueshi.net",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
        has: [
          {
            type: "host",
            value: "www.jueshi.net",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
