import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load .env.production for build time
dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "",
  },
};

export default nextConfig;
