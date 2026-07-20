const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const tables = await p.$queryRaw`
    SELECT tablename FROM pg_tables 
    WHERE schemaname='public' 
    ORDER BY tablename
  `;
  console.log('TOTAL_TABLES=' + tables.length);
  
  const newTables = tables
    .map(t => t.tablename)
    .filter(n => ['ServiceProvider','ProviderMember','ProviderService','ServiceCategory',
                   'ProviderVerification','ProviderInquiry','ProviderFavorite',
                   'ProviderReport','DomainEventOutbox'].includes(n));
  console.log('NEW_TABLES_FOUND=' + newTables.length);
  console.log('NEW_TABLES=' + JSON.stringify(newTables));
  
  // Count records in key tables
  for (const t of ['ServiceProvider','ProviderService','ServiceCategory','ProviderInquiry','DomainEventOutbox']) {
    try {
      const count = await p.$queryRawUnsafe(`SELECT count(*)::int as c FROM "${t}"`);
      console.log(`${t}_COUNT=${count[0].c}`);
    } catch(e) {
      console.log(`${t}_COUNT=ERROR`);
    }
  }
  
  await p.$disconnect();
}
main().catch(e => { console.error('FATAL=' + e.message); process.exit(1); });
