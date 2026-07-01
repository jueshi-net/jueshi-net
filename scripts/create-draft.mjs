import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Set DATABASE_URL environment variable
process.env.DATABASE_URL = 'postgresql://bxb_user:***@127.0.0.1:5555/bxb_prod';

const dbUrl = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: dbUrl });

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error']
});

const draftData = {
  title: '留学生出国前准备清单',
  slug: 'student-pre-departure-checklist',
  summary: '出国前必做事项清单：从签证到报到，一步步帮你做好准备。包含签证、机票、住宿、行李、银行卡、手机卡、保险、常用 APP。',
  steps: [
    { title: '确认签证', description: '检查签证有效期，确认入境要求。打印签证页备份。', completed: false, optional: false, toolLink: null },
    { title: '购买机票', description: '确认航班时间、行李额度。打印电子行程单。', completed: false, optional: false, toolLink: null },
    { title: '预订住宿', description: '确认住宿地址、入住时间。保存预订确认邮件。', completed: false, optional: false, toolLink: null },
    { title: '准备行李', description: '按清单准备衣物、日用品、学习用品。贴行李标签。', completed: false, optional: false, toolLink: null },
    { title: '开通银行卡', description: '申请国际信用卡，准备当地银行卡开户材料。', completed: false, optional: false, toolLink: null },
    { title: '办理手机卡', description: '购买当地手机卡或开通国际漫游。下载常用 APP。', completed: false, optional: false, toolLink: null },
    { title: '购买保险', description: '购买医疗保险、意外险。保存保单电子版。', completed: false, optional: false, toolLink: null },
    { title: '下载常用 APP', description: '地图、翻译、银行、学校 APP。注册账号。', completed: false, optional: false, toolLink: null },
    { title: '准备文件', description: '护照、签证、录取通知书、成绩单、照片。扫描备份。', completed: false, optional: false, toolLink: null },
    { title: '通知家人', description: '告知家人航班信息、住宿地址、紧急联系方式。', completed: false, optional: false, toolLink: null },
    { title: '兑换货币', description: '兑换当地货币，准备零钱。了解汇率。', completed: false, optional: false, toolLink: '/tools/exchange-rate' },
    { title: '确认接机', description: '确认学校接机或预订出租车。保存司机联系方式。', completed: false, optional: false, toolLink: null },
    { title: '办理退宿', description: '退掉国内住宿，清理物品。退还押金。', completed: false, optional: true, toolLink: null },
    { title: '购买日用品', description: '到达后购买床品、洗漱用品、厨房用品。', completed: false, optional: false, toolLink: null },
    { title: '学校报到', description: '携带文件到学校注册。领取学生卡。', completed: false, optional: false, toolLink: null }
  ],
  relatedTools: ['exchange-rate', 'shipping-calculator'],
  relatedGuides: ['how-to-apply-student-visa', 'how-to-pack-for-study-abroad'],
  relatedTopics: ['must-have-apps', 'student-life-guide'],
  status: 'draft',
  seoTitle: '留学生出国前准备清单 | 必做 15 件事',
  seoDescription: '出国前清单：从签证到报到，一步步帮你做好准备。包含签证、机票、住宿、行李、银行、手机卡等关键步骤。',
  canonicalUrl: 'https://jueshi.net/checklists/student-pre-departure-checklist',
  robots: 'noindex,nofollow' // Draft 不应被索引
};

async function main() {
  console.log('Creating draft checklist...');
  
  try {
    const checklist = await prisma.checklist.create({
      data: draftData
    });
    
    console.log('✅ Draft created successfully!');
    console.log('ID:', checklist.id);
    console.log('Slug:', checklist.slug);
    console.log('Status:', checklist.status);
    console.log('SEO Title:', checklist.seoTitle);
    console.log('SEO Description:', checklist.seoDescription);
    console.log('Robots:', checklist.robots);
    console.log('Created At:', checklist.createdAt);
    
    return checklist;
  } catch (error) {
    console.error('❌ Error creating draft:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
