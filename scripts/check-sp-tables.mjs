import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
console.log("TOTAL_TABLE_COUNT=" + tables.length);
const spTables = tables.filter(t =>
  t.tablename.startsWith("provider") ||
  t.tablename.startsWith("service") ||
  t.tablename.startsWith("domain_event")
);
console.log("SERVICE_PROVIDER_TABLES=" + spTables.length);
spTables.forEach(t => console.log("  " + t.tablename));
try {
  const outboxCount = await prisma.$queryRaw`SELECT count(*)::int as cnt FROM "DomainEventOutbox"`;
  console.log("OUTBOX_ENTRIES=" + outboxCount[0].cnt);
} catch(e) { console.log("OUTBOX_TABLE_MISSING"); }
try {
  const inquiryCount = await prisma.$queryRaw`SELECT count(*)::int as cnt FROM "ProviderInquiry"`;
  console.log("INQUIRY_COUNT=" + inquiryCount[0].cnt);
} catch(e) { console.log("INQUIRY_TABLE_MISSING"); }
try {
  const eventLogCount = await prisma.$queryRaw`SELECT count(*)::int as cnt FROM "EventLog"`;
  console.log("EVENTLOG_COUNT=" + eventLogCount[0].cnt);
} catch(e) { console.log("EVENTLOG_TABLE_MISSING"); }
await prisma.$disconnect();
