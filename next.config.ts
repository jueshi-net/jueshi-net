import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ─── Forum redirect ───
      {
        source: '/bbs',
        destination: 'https://bbs.jueshi.net',
        permanent: true,
      },
      {
        source: '/bbs/:path*',
        destination: 'https://bbs.jueshi.net/:path*',
        permanent: true,
      },
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
      {
        source: '/guides',
        destination: '/resources',
        permanent: true,
      },
      {
        source: '/guides/:slug*',
        destination: '/resources/:slug*',
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
