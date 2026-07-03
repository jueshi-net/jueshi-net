const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const checklist = await prisma.checklist.create({
    data: {
      id: 'contentops-cli-e2e-test-001',
      title: 'ContentOps CLI 生产测试清单',
      slug: 'contentops-cli-production-e2e-checklist',
      summary: '这是一条用于验证 ContentOps CLI 功能的测试清单，不应发布。',
      steps: [
        { title: '测试步骤1', description: '验证 draft 创建', optional: false, toolLink: '' },
        { title: '测试步骤2', description: '验证后台编辑', optional: false, toolLink: '' }
      ],
      status: 'draft',
      seoTitle: 'ContentOps CLI 生产测试清单 | 测试用',
      seoDescription: '这是一条用于验证 ContentOps CLI 功能的测试清单，不应发布。',
      robots: 'noindex,nofollow',
      metadataJson: {
        contentOps: {
          primaryKeyword: 'ContentOps CLI 测试',
          secondaryKeywords: ['生产环境测试', 'draft 创建验证', 'SEO 后台编辑'],
          seo: {
            metaKeywords: 'ContentOps,CLI测试,生产环境,draft创建,SEO后台编辑',
            searchIntent: 'informational',
            targetAudience: '开发者和测试人员',
            audienceStage: '已在海外阶段',
            targetCountries: ['加拿大'],
            targetSearchEngines: ['Google', 'Baidu']
          },
          qualityScore: 85,
          faq: [
            { question: '这是什么？', answer: '这是一条测试清单。' }
          ],
          internalLinks: [
            { slug: 'student-pre-departure-checklist', title: '留学生出国前准备清单', reason: '相关清单' }
          ]
        }
      }
    }
  });
  
  console.log('Created checklist:', checklist.id, checklist.slug, checklist.status);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
