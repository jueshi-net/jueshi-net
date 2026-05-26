import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'prisma/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env';

dotenv.config({ path: path.resolve(process.cwd(), envFile) });
console.log(`[Prisma Config] Current NODE_ENV: ${nodeEnv}, Loaded: ${envFile}`);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "file:./prisma/dev.db",
  },
});
