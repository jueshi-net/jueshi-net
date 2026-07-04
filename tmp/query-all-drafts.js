const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const checklists = await prisma.checklist.findMany({
    select: { id: true, slug: true, title: true, status: true, publishedAt: true }
  });
  const guides = await prisma.guide.findMany({
    select: { id: true, slug: true, title: true, status: true, publishedAt: true }
  });
  const topics = await prisma.topic.findMany({
    select: { id: true, slug: true, title: true, status: true, publishedAt: true }
  });
  
  console.log('=== CHECKLISTS ===');
  console.log(JSON.stringify(checklists, null, 2));
  console.log('=== GUIDES ===');
  console.log(JSON.stringify(guides, null, 2));
  console.log('=== TOPICS ===');
  console.log(JSON.stringify(topics, null, 2));
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
