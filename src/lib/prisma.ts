import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaStartupAsserted?: boolean;
};

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL is not set. Provide it via .env.local (dev) or .env.production / PM2 env_production (prod). " +
    "No fallback is allowed — fail fast to prevent connecting to the wrong database."
  );
}

// ============================================================
// STAGING DATABASE TARGET ASSERTION
// Prevents the app from starting if DATABASE_URL points to wrong database
// ============================================================
function assertStagingDatabase(url: string): void {
  // Only enforce in staging environment
  const envMarker = process.env.JUESHI_ENVIRONMENT || process.env.NODE_ENV;
  const isStaging = url.includes("xixiong_staging") || 
                    process.env.PORT === "3001" ||
                    (envMarker && envMarker.includes("staging"));
  
  if (!isStaging) return; // Production has its own guards
  
  // Parse database name from URL
  const dbMatch = url.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : null;
  
  if (!dbName) {
    throw new Error("STAGING_DB_TARGET_MISMATCH: Could not parse database name from DATABASE_URL");
  }
  
  const forbidden = ["bxb_prod", "xixiong_prod", "xixiong_production", "postgres"];
  if (forbidden.includes(dbName)) {
    throw new Error(
      `STAGING_DB_TARGET_MISMATCH: DATABASE_URL points to forbidden database "${dbName}". ` +
      `Staging must use "xixiong_staging". This is a deployment guard.`
    );
  }
  
  if (dbName !== "xixiong_staging") {
    throw new Error(
      `STAGING_DB_TARGET_MISMATCH: Expected "xixiong_staging" but got "${dbName}"`
    );
  }
}

// Run assertion at module load time
assertStagingDatabase(dbUrl);

const adapter = new PrismaPg({ connectionString: dbUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ============================================================
// RUNTIME SCHEMA ASSERTION (runs once on first query)
// Verifies database name and metadataJson column existence
// ============================================================
async function runtimeSchemaAssertion(): Promise<void> {
  if (globalForPrisma.prismaStartupAsserted) return;
  
  try {
    const result = await prisma.$queryRaw<Array<{ db_name: string; has_metadata: boolean }>>`
      SELECT 
        current_database() as db_name,
        EXISTS(SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'guides' AND column_name = 'metadataJson') as has_metadata
    `;
    
    if (result.length === 0) {
      throw new Error("STAGING_DB_TARGET_MISMATCH: Database query returned no results");
    }
    
    const { db_name, has_metadata } = result[0];
    
    if (db_name !== "xixiong_staging") {
      throw new Error(
        `STAGING_DB_TARGET_MISMATCH: Runtime connected to "${db_name}" instead of "xixiong_staging"`
      );
    }
    
    if (!has_metadata) {
      throw new Error(
        "STAGING_MIGRATION_MISSING: guides.metadataJson column does not exist. " +
        "Run: npx prisma migrate deploy"
      );
    }
    
    globalForPrisma.prismaStartupAsserted = true;
    console.log("[Prisma] Runtime schema assertion passed: db=xixiong_staging, metadataJson=present");
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("STAGING_")) {
      throw error; // Re-throw our guard errors
    }
    console.error("[Prisma] Runtime schema assertion failed:", error);
    throw new Error(`STAGING_SCHEMA_DRIFT: ${error}`);
  }
}

// Run assertion on first import (non-blocking but will fail first query if wrong)
if (process.env.NODE_ENV === "production" || process.env.PORT === "3001") {
  runtimeSchemaAssertion().catch((err) => {
    console.error("[Prisma] Startup assertion error:", err.message);
    // Don't crash the process, but log the error prominently
    process.exit(1);
  });
}
