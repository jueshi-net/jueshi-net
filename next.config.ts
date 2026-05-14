import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
