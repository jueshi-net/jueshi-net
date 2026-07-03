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
  title: '新加坡留学生租房注意事项清单',
  slug: 'singapore-rental-guide-checklist',
  summary: '为准备前往新加坡留学的学生和家长提供租房注意事项清单，包含合同条款、押金、房屋设施、交通便利性、安全性等关键要点。',
  steps: [
    { title: '了解新加坡租房市场', description: '研究不同区域的租金水平，了解 HDB 和公寓的区别。', completed: false, optional: false, toolLink: null },
    { title: '确定预算', description: '根据经济能力确定租金预算，通常不超过收入的 30%。', completed: false, optional: false, toolLink: null },
    { title: '选择区域', description: '考虑学校位置、交通便利性、生活设施。热门区域：Bugis、Tanjong Pagar、Orchard。', completed: false, optional: false, toolLink: null },
    { title: '查看房源', description: '通过 PropertyGuru、99.co 等平台查看房源，注意虚假房源。', completed: false, optional: false, toolLink: null },
    { title: '实地考察', description: '预约看房，检查房屋设施、卫生状况、周边环境。', completed: false, optional: false, toolLink: null },
    { title: '检查合同条款', description: '仔细阅读租赁合同，注意租期、押金、维修责任、提前退租条款。', completed: false, optional: false, toolLink: null },
    { title: '确认押金', description: '通常是 1-2 个月租金，了解押金退还条件。', completed: false, optional: false, toolLink: null },
    { title: '检查房屋设施', description: '检查空调、热水器、家具、电器是否正常运作。拍照记录。', completed: false, optional: false, toolLink: null },
    { title: '了解水电费', description: '确认水电费是否包含在租金内，了解计费方式。', completed: false, optional: false, toolLink: null },
    { title: '确认交通便利性', description: '测试从住所到学校的通勤时间，检查附近地铁站和公交站。', completed: false, optional: false, toolLink: null },
    { title: '了解周边设施', description: '检查附近超市、餐厅、医院、银行等生活设施。', completed: false, optional: false, toolLink: null },
    { title: '签订合同', description: '确认所有条款后签订合同，保留合同副本。', completed: false, optional: false, toolLink: null },
    { title: '支付押金和首月租金', description: '通过银行转账支付，保留付款凭证。', completed: false, optional: false, toolLink: null },
    { title: '办理入住', description: '与房东交接钥匙，检查房屋状况，拍照记录。', completed: false, optional: false, toolLink: null },
    { title: '通知房东问题', description: '发现任何问题立即通知房东，要求维修。', completed: false, optional: false, toolLink: null }
  ],
  relatedTools: ['exchange-rate', 'shipping-calculator'],
  relatedGuides: ['singapore-study-guide', 'how-to-apply-student-visa'],
  relatedTopics: ['must-have-apps', 'student-life-guide'],
  status: 'draft',
  seoTitle: '新加坡留学生租房注意事项清单 | 15 个关键步骤',
  seoDescription: '新加坡留学租房指南：从预算到入住，15 个关键步骤帮你顺利完成租房。包含合同条款、押金、房屋设施检查等要点。',
  canonicalUrl: 'https://jueshi.net/checklists/singapore-rental-guide-checklist',
  robots: 'noindex,nofollow' // Draft 不应被索引
};

async function main() {
  console.log('Creating Singapore rental guide checklist draft...');
  
  try {
    const checklist = await prisma.checklist.create({
      data: draftData
    });
    
    console.log('Draft checklist created successfully!');
    console.log('ID:', checklist.id);
    console.log('Slug:', checklist.slug);
    console.log('Status:', checklist.status);
    console.log('Admin Edit URL: https://jueshi.net/admin/content/checklists/' + checklist.id + '/edit');
    console.log('Preview URL: https://jueshi.net/checklists/' + checklist.slug + '?preview=true');
    console.log('Public URL: https://jueshi.net/checklists/' + checklist.slug + ' (should return 404)');
    
  } catch (error) {
    console.error('Error creating draft:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
