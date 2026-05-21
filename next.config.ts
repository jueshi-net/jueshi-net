import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
