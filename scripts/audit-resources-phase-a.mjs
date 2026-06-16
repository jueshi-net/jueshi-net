import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditResources() {
  console.log('=== Resource 分类分布 ===');
  const categoryStats = await prisma.resource.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  console.log(JSON.stringify(categoryStats, null, 2));

  console.log('\n=== Resource 质量统计 ===');
  const qualityStats = await prisma.resource.aggregate({
    _count: { id: true },
    _sum: { qualityScore: true },
    _avg: { qualityScore: true }
  });
  console.log(JSON.stringify(qualityStats, null, 2));

  console.log('\n=== qualityScore = 0 的资源 (前10条) ===');
  const zeroQuality = await prisma.resource.findMany({
    where: { qualityScore: 0 },
    select: { id: true, name: true, url: true, category: true },
    take: 10
  });
  console.log(JSON.stringify(zeroQuality, null, 2));

  console.log('\n=== 缺 favicon 的资源统计 ===');
  const noFavicon = await prisma.resource.count({
    where: { favicon: null }
  });
  console.log(`缺 favicon: ${noFavicon}`);

  console.log('\n=== 缺 iconUrl 的资源统计 ===');
  const noIconUrl = await prisma.resource.count({
    where: { iconUrl: null }
  });
  console.log(`缺 iconUrl: ${noIconUrl}`);

  console.log('\n=== 缺 lastChecked 的资源统计 ===');
  const noLastChecked = await prisma.resource.count({
    where: { lastChecked: null }
  });
  console.log(`缺 lastChecked: ${noLastChecked}`);

  console.log('\n=== 分类为 logistics 的资源样例 (前20条) ===');
  const logisticsSamples = await prisma.resource.findMany({
    where: { category: 'logistics' },
    select: { id: true, name: true, url: true, description: true, tags: true },
    take: 20
  });
  console.log(JSON.stringify(logisticsSamples, null, 2));

  console.log('\n=== 分类为 tools 的资源样例 (前20条) ===');
  const toolsSamples = await prisma.resource.findMany({
    where: { category: 'tools' },
    select: { id: true, name: true, url: true, description: true, tags: true },
    take: 20
  });
  console.log(JSON.stringify(toolsSamples, null, 2));

  console.log('\n=== 分类为 business 的资源样例 (前20条) ===');
  const businessSamples = await prisma.resource.findMany({
    where: { category: 'business' },
    select: { id: true, name: true, url: true, description: true, tags: true },
    take: 20
  });
  console.log(JSON.stringify(businessSamples, null, 2));

  console.log('\n=== LandingPage 统计 ===');
  const landingPages = await prisma.landingPage.findMany({
    select: { id: true, slug: true, title: true, pageType: true, status: true, heroSection: true, primaryTool: true, relatedTools: true }
  });
  console.log(JSON.stringify(landingPages, null, 2));
}

auditResources()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
