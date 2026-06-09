import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const slug = "test-first-shipping-checklist-24";
  console.log("Creating test checklist:", slug);

  const heroSection = {
    checklistType: "shipping",
    audience: "跨境电商卖家 / SOHO",
    region: "全球",
    city: "",
    scenario: "第一次使用集运/转运发货",
    difficulty: "medium",
    estimatedTime: "1-2小时",
    summary: "本清单涵盖首次使用集运发货前的所有必要步骤，从地址获取、包装要求、申报规范到物流追踪，助你避开新手常见坑点。",
    quickAnswer: "集运核心流程：获取海外仓地址 → 国内采购/发货至海外仓 → 仓库合箱打包 → 支付国际运费 → 等待签收。全程约需 3-10 个工作日。",
    lastReviewedAt: "2026-06-09",
    sections: [
      {
        id: "sec-1",
        title: "一、前期准备",
        description: "发货前必须完成的基础步骤",
        items: [
          { id: "item-1", title: "注册集运平台账号", description: "选择可靠的集运服务商并完成实名认证", required: true, priority: "high", timing: "发货前 1 周", warning: "[需人工核验] 部分平台要求身份证或营业执照", relatedToolSlug: "", officialLink: { label: "集运商官网", url: "" } },
          { id: "item-2", title: "获取海外仓收货地址", description: "在集运平台获取专属仓库地址（含 Unique ID）", required: true, priority: "high", timing: "发货前 1 周", warning: "", relatedToolSlug: "address-formatter", officialLink: {} },
          { id: "item-3", title: "确认目的国海关政策", description: "了解免税额度、禁运物品清单、申报要求", required: true, priority: "high", timing: "采购前", warning: "[需人工核验] 各国海关政策可能随时调整", relatedToolSlug: "", officialLink: { label: "海关官网", url: "" } },
          { id: "item-4", title: "测量包裹预估重量体积", description: "提前估算包裹尺寸，避免超重/超体积附加费", required: false, priority: "medium", timing: "采购时", warning: "体积重 = 长×宽×高/5000，取实重与体积重较大者", relatedToolSlug: "shipping-calculator", officialLink: {} }
        ]
      },
      {
        id: "sec-2",
        title: "二、国内发货",
        description: "将商品发往集运仓库的步骤",
        items: [
          { id: "item-5", title: "填写正确的收货地址", description: "使用 address-formatter 格式化海外仓地址", required: true, priority: "high", timing: "下单时", warning: "务必包含 Unique ID/会员码，否则仓库无法入库", relatedToolSlug: "address-formatter", officialLink: {} },
          { id: "item-6", title: "要求卖家注明内件品名", description: "包裹面单上必须写明实际商品名称，不要写“礼品”或“样品”", required: true, priority: "high", timing: "下单时备注", warning: "虚假申报可能导致海关扣件或罚款", relatedToolSlug: "", officialLink: {} },
          { id: "item-7", title: "保留国内物流单号", description: "将快递单号填入集运平台的“预报入库”", required: true, priority: "high", timing: "发货后", warning: "", relatedToolSlug: "", officialLink: {} },
          { id: "item-8", title: "确认包裹到仓", description: "在集运平台确认包裹已入库，核对重量/尺寸", required: true, priority: "high", timing: "到仓后", warning: "发现破损/错发立即联系客服，不要合箱", relatedToolSlug: "", officialLink: {} }
        ]
      },
      {
        id: "sec-3",
        title: "三、国际转运",
        description: "合箱、支付运费、等待签收",
        items: [
          { id: "item-9", title: "选择国际物流渠道", description: "根据时效、价格、物品类型选择专线/EMS/快递", required: true, priority: "high", timing: "合箱时", warning: "[需人工核验] 不同渠道限制不同，带电/液体/品牌需特殊渠道", relatedToolSlug: "shipping-calculator", officialLink: {} },
          { id: "item-10", title: "制作商业发票/申报", description: "如实申报品名、数量、价值", required: true, priority: "high", timing: "支付运费前", warning: "[需人工核验] 低申报可能导致查验延误", relatedToolSlug: "commercial-invoice", officialLink: {} },
          { id: "item-11", title: "支付国际运费", description: "支持支付宝/微信/信用卡等方式", required: true, priority: "high", timing: "出库前", warning: "", relatedToolSlug: "", officialLink: {} },
          { id: "item-12", title: "追踪国际物流", description: "保存国际运单号，关注清关进度", required: true, priority: "medium", timing: "出库后", warning: "", relatedToolSlug: "tracking", officialLink: {} }
        ]
      }
    ],
    avoidPitfalls: [
      "不要将敏感物品（带电、液体、粉末、品牌仿品）混入普通渠道",
      "包裹到仓后务必核对重量，差异过大立即申请复称",
      "申报价值不要过低，海关有最低限价，低申报会被退回或罚款",
      "合箱前确认所有包裹到齐，遗漏包裹需重新支付入库费",
      "部分国家对食品、药品、植物种子有严格限制，发货前务必确认"
    ],
    nextSteps: ["海外收货地址格式化指南", "国际物流渠道对比与选择", "跨境电商税务与关税速查"],
  };

  await prisma.landingPage.upsert({
    where: { slug },
    create: {
      slug,
      title: "第一次使用集运注意事项清单",
      pageType: "checklist",
      status: "published",
      heroSection,
      faqItems: [
        { question: "集运一般需要多久能收到？", answer: "视渠道不同，空运专线约 5-10 个工作日，海运约 20-40 天。具体以集运商公布的时效为准。" },
        { question: "可以寄送食品/化妆品/电子产品吗？", answer: "部分敏感物品可以走特殊渠道，但需提前申报并可能加收附加费。请查看集运商禁运清单或咨询客服。" },
        { question: "包裹丢失怎么办？", answer: "首先联系集运商客服申请查询。若确认丢失，正规集运商通常有保价/理赔服务。建议贵重物品购买保价。" },
        { question: "如何避免被收体积重费用？", answer: "尽量压缩包装体积，要求卖家减少填充物。部分集运商提供“去包装”服务，可显著降低体积重。" },
        { question: "海关征税了怎么办？", answer: "保留税单和购物凭证。如超过目的国免税额度，依法纳税是正常流程。部分集运商提供“包税渠道”，可提前选择。" }
      ],
      officialLinks: [
        { label: "中国海关总署", url: "http://www.customs.gov.cn/" },
        { label: "万国邮联 (UPU) 包裹追踪", url: "https://www.upu.int/" }
      ],
      relatedTools: ["postal-code", "address-formatter", "shipping-calculator", "invoice", "commercial-invoice", "tracking"],
      relatedTopics: [],
      relatedArticles: [],
      ctaConfig: { text: "开始使用工具", url: "/tools" },
    },
    update: {
      title: "第一次使用集运注意事项清单",
      pageType: "checklist",
      status: "published",
      heroSection,
      faqItems: [
        { question: "集运一般需要多久能收到？", answer: "视渠道不同，空运专线约 5-10 个工作日，海运约 20-40 天。具体以集运商公布的时效为准。" },
        { question: "可以寄送食品/化妆品/电子产品吗？", answer: "部分敏感物品可以走特殊渠道，但需提前申报并可能加收附加费。请查看集运商禁运清单或咨询客服。" },
        { question: "包裹丢失怎么办？", answer: "首先联系集运商客服申请查询。若确认丢失，正规集运商通常有保价/理赔服务。建议贵重物品购买保价。" },
        { question: "如何避免被收体积重费用？", answer: "尽量压缩包装体积，要求卖家减少填充物。部分集运商提供“去包装”服务，可显著降低体积重。" },
        { question: "海关征税了怎么办？", answer: "保留税单和购物凭证。如超过目的国免税额度，依法纳税是正常流程。部分集运商提供“包税渠道”，可提前选择。" }
      ],
      officialLinks: [
        { label: "中国海关总署", url: "http://www.customs.gov.cn/" },
        { label: "万国邮联 (UPU) 包裹追踪", url: "https://www.upu.int/" }
      ],
      relatedTools: ["postal-code", "address-formatter", "shipping-calculator", "invoice", "commercial-invoice", "tracking"],
      relatedTopics: [],
      relatedArticles: [],
      ctaConfig: { text: "开始使用工具", url: "/tools" },
    },
  });

  console.log("✅ Test checklist created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
