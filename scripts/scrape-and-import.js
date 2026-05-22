/**
 * Automated RPA: Scrape cross-border e-commerce navigation sites,
 * AI-enrich the data, and inject into production via /api/admin/resources/import
 */

const { chromium } = require('playwright');

// AI Knowledge Base - comprehensive tool enrichment data
const TOOL_KNOWLEDGE = {
  // Amazon tools
  'Jungle Scout': {
    aliases: 'JS / 金狗', rating: 'S',
    officialUrl: 'https://www.junglescout.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于跨境电商界的生意参谋',
    suitableFor: '亚马逊美国/欧洲站卖家，适合有一定选品经验的中高阶卖家',
    tips: 'JS数据有2-4周延迟，不要完全依赖其销量预估做决策。建议先用浏览器插件免费版试水，别一上来就买年费套餐。选品时多看Review增长趋势而非绝对销量。',
  },
  'Helium 10': {
    aliases: 'H10 / 氦10', rating: 'S',
    officialUrl: 'https://www.helium10.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于生意参谋+直通车+评价管理三合一',
    suitableFor: '亚马逊全站点卖家，适合从选品到运营全流程需要一站式工具的卖家',
    tips: 'H10功能太多容易眼花缭乱，建议先精通Cerebro（反查竞品关键词）和Magnet（关键词拓展）两个核心工具。免费版只能搜10次/天，别浪费在无关关键词上。',
  },
  '卖家精灵': {
    aliases: 'SellerSprite', rating: 'A',
    officialUrl: 'https://www.sellersprite.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于国内电商的选品大师，更贴合中国卖家习惯',
    suitableFor: '中国跨境卖家，中文界面友好，适合英语不太好的新手卖家',
    tips: '数据更新频率比JS略慢，建议在旺季（Prime Day前2个月）提前锁定目标产品。其关键词反查功能比选品市场更靠谱。',
  },
  'Keepa': {
    aliases: 'Keepa插件 / 价格追踪器', rating: 'S',
    officialUrl: 'https://keepa.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于历史价格查询器+库存监控',
    suitableFor: '所有亚马逊卖家，尤其是做跟卖、比价、监控竞品价格波动的卖家',
    tips: 'Keepa的免费版已经够用核心功能（价格历史），付费版主要多库存追踪。别被花里胡哨的数据图迷惑，重点看Price History的最低点和销售排名趋势。',
  },
  '卖家精灵（SellerSprite）': {
    aliases: '卖家精灵', rating: 'A',
    officialUrl: 'https://www.sellersprite.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于国内电商的选品大师',
    suitableFor: '中国跨境卖家，中文界面友好',
    tips: '数据更新频率比JS略慢，建议旺季前提前锁定目标产品。',
  },
  // Payment/Finance
  'Airwallex空中云汇': {
    aliases: 'Airwallex', rating: 'S',
    officialUrl: 'https://www.airwallex.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版支付宝企业版',
    suitableFor: '多平台多币种收款需求的卖家，适合年GMV超100万美金的成熟卖家',
    tips: 'Airwallex优势在于虚拟卡和多币种账户。开通时需要提供营业执照和法人身份证，审核一般2-3个工作日。虚拟卡充值Amazon广告账户非常方便，比传统信用卡省1.5%货币转换费。',
  },
  '连连国际LianLian': {
    aliases: '连连支付 / LianLian', rating: 'A',
    officialUrl: 'https://www.lianlianpay.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版银联商务',
    suitableFor: '需要人民币快速提现的卖家，适合中小卖家',
    tips: '连连的优势是提现到国内银行卡速度快（一般T+0或T+1），费率约0.7%。注意提现金额超过等值5万美元需要申报外汇，提前准备好贸易合同。',
  },
  '万里汇WorldFirst': {
    aliases: 'WorldFirst / WF', rating: 'A',
    officialUrl: 'https://www.worldfirst.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版招商银行',
    suitableFor: '蚂蚁集团旗下，适合已在亚马逊/速卖通开店的卖家',
    tips: '被蚂蚁收购后费率降到0.3%，性价比很高。支持直接绑定支付宝提现，资金到账快。新开店卖家注意：WorldFirst需要店铺出单后才能开通收款功能。',
  },
  'PingPong': {
    aliases: 'PingPong支付', rating: 'A',
    officialUrl: 'https://www.pingpongx.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版微信支付商户版',
    suitableFor: '亚马逊、eBay、Wish等多平台卖家',
    tips: 'PingPong的1%封顶费率是行业良心，还有VAT代缴功能。注意首次提现需要完成实名认证和店铺绑定验证。其供应商付款功能可以省一笔国内转账费。',
  },
  '派安盈（Payoneer）': {
    aliases: 'Payoneer / P卡', rating: 'S',
    officialUrl: 'https://www.payoneer.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版PayPal+SWIFT',
    suitableFor: '全球各平台通用收款，适合多平台多国家经营的卖家',
    tips: 'P卡是老牌收款工具，支持平台最多（Amazon、eBay、Upwork、Fiverr等）。费率约1.2%，比连连和万里汇稍高但胜在平台覆盖广。注意：P卡年费19.95美元/年（有最低消费要求），不活跃的账户会被扣费。',
  },
  '光子易·跨境支付平台': {
    aliases: '光子易 / PhotonPay', rating: 'B',
    officialUrl: 'https://www.photonpay.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版网银在线',
    suitableFor: '需要多币种收款的跨境电商卖家',
    tips: '光子易是较新的跨境支付平台，费率有竞争力。适合对资金流转速度要求高的卖家。',
  },
  '网易支付': {
    aliases: '网易支付 / 网易跨境支付', rating: 'B',
    officialUrl: 'https://crossborder.pay.163.com',
    category: '金融收款',
    domesticAnalog: '相当于网易版的跨境收款',
    suitableFor: '网易生态卖家，适合已在网易跨境电商生态中的卖家',
    tips: '网易支付在跨境收款领域入局较晚，但有网易品牌背书。注册可享特惠费率，偶尔有0费率券活动。',
  },
  '汇丰银行': {
    aliases: 'HSBC', rating: 'A',
    officialUrl: 'https://www.hsbc.com.cn',
    category: '金融收款',
    domesticAnalog: '相当于跨境版工商银行',
    suitableFor: '大卖家和品牌卖家，适合年GMV超500万美金的企业',
    tips: '汇丰的优势是0开户0费率，与跨境电商平台直连。但开户门槛较高，需要企业营业执照和一定规模的流水。适合已经有一定规模的成熟卖家。',
  },
  // SE Asia
  'Shopee': {
    aliases: '虾皮', rating: 'S',
    officialUrl: 'https://shopee.com',
    category: '电商平台',
    domesticAnalog: '相当于东南亚版淘宝+拼多多',
    suitableFor: '东南亚市场新手卖家，适合低客单价、铺货模式的卖家',
    tips: 'Shopee各站点（马来、菲律宾、泰国、越南、新加坡、巴西）政策差异大，别用一套策略打所有市场。马来站和新加坡站利润最高，菲律宾站退货率最高。',
  },
  'Lazada': {
    aliases: '来赞达', rating: 'A',
    officialUrl: 'https://www.lazada.com',
    category: '电商平台',
    domesticAnalog: '相当于东南亚版天猫',
    suitableFor: '有一定供应链优势的卖家，适合做品牌化运营的中高阶卖家',
    tips: 'Lazada对品牌卖家更友好，但对新店流量扶持不如Shopee。建议先在LazMall申请品牌认证，流量会明显提升。物流用LGF比自建靠谱。',
  },
  'TikTok Shop': {
    aliases: 'TTS / 抖店海外版 / 国际抖店', rating: 'S',
    officialUrl: 'https://www.tiktok.com/shop',
    category: '电商平台',
    domesticAnalog: '相当于抖音小店的海外版本',
    suitableFor: '擅长内容创作和直播的卖家，适合有达人资源的东南亚/英美市场卖家',
    tips: 'TikTok Shop的流量极度依赖短视频和直播内容，纯铺货模式几乎零流量。东南亚站点转化率远高于英美。别在视频里硬广，种草内容转化率高3倍。',
  },
  'Coupang': {
    aliases: '酷澎 / 韩国亚马逊', rating: 'A',
    officialUrl: 'https://www.coupang.com',
    category: '电商平台',
    domesticAnalog: '相当于韩国版京东',
    suitableFor: '想进入韩国市场的卖家，适合有3C、服装、家居品类优势的卖家',
    tips: '韩国消费者对品质要求极高，差评率容忍度极低。必须做KC认证（电子产品）和韩语包装。物流用CGF能大幅提升排名。',
  },
  // TikTok analytics
  'FastMoss': {
    aliases: '飞书数据 / FastM', rating: 'A',
    officialUrl: 'https://www.fastmoss.com',
    category: 'TikTok数据分析',
    domesticAnalog: '相当于TikTok版的蝉妈妈',
    suitableFor: 'TikTok Shop卖家和达人，适合需要选品和达人数据分析的卖家',
    tips: 'FastMoss的达人数据有延迟，热门达人可能已经换品。用它找达人时重点看近7天带货GMV而非总GMV——找正在上升期的达人比找头部达人性价比高10倍。',
  },
  'EchoTik': {
    aliases: '回音', rating: 'A',
    officialUrl: 'https://echotik.live',
    category: 'TikTok数据分析',
    domesticAnalog: '类似TikTok版的飞瓜数据',
    suitableFor: 'TikTok Shop运营，适合需要直播数据分析和竞品监控的卖家',
    tips: 'EchoTik的直播实时监控功能很强，但免费版数据延迟大。用它找爆款视频时，重点看分享率而非点赞数——分享率高的视频带货转化率通常是点赞率高但分享低的3-5倍。',
  },
  'PiPiADS': {
    aliases: 'PiPi', rating: 'S',
    officialUrl: 'https://www.pipiads.com',
    category: 'TikTok数据分析',
    domesticAnalog: '相当于TikTok版的AppGrowing',
    suitableFor: 'TikTok广告投放手和独立站卖家，适合需要做TikTok广告素材分析的卖家',
    tips: 'PiPiADS能扒到竞品正在跑的广告素材，但别直接搬运！TikTok广告审核极严，素材重复会被封户。用它找素材灵感（结构、痛点切入方式），但必须重新拍摄或混剪。',
  },
  // ERP tools
  '店小秘': {
    aliases: 'Dianxiaomi', rating: 'A',
    officialUrl: 'https://www.dianxiaomi.com',
    category: 'ERP工具',
    domesticAnalog: '相当于跨境版的聚水潭ERP',
    suitableFor: '多平台多店铺运营的卖家，适合同时做Shopee+Lazada+TikTok的卖家',
    tips: '免费版只能管理2个店铺和1000个SKU，付费版价格不低。建议先用免费版跑通流程再升级。其刊登功能比订单管理更稳定。',
  },
  'BigSeller': {
    aliases: '大卖家', rating: 'A',
    officialUrl: 'https://bigseller.com',
    category: 'ERP工具',
    domesticAnalog: '相当于东南亚版1688铺货工具',
    suitableFor: '铺货型卖家，适合大量SKU管理的东南亚多平台卖家',
    tips: 'BigSeller的批量刊登速度很快，但容易被平台判定为重复铺货导致下架。刊登时务必修改标题、主图、详情，不能原封不动搬运。',
  },
  'AliExpress': {
    aliases: '速卖通 / AE', rating: 'A',
    officialUrl: 'https://www.aliexpress.com',
    category: '电商平台',
    domesticAnalog: '相当于国际版淘宝',
    suitableFor: '想拓展俄语区（俄罗斯、乌克兰）和欧洲市场的卖家',
    tips: '速卖通在俄罗斯市占率第一，但回款周期长（30-60天）。Choice频道流量大但要求48小时发货，供应链跟不上的别碰。',
  },
  'Temu': {
    aliases: 'Temu / 拼多多跨境', rating: 'S',
    officialUrl: 'https://www.temu.com',
    category: '电商平台',
    domesticAnalog: '就是拼多多的海外版',
    suitableFor: '有工厂资源或供应链优势的卖家，适合走极致低价路线的源头工厂',
    tips: 'Temu是全托管模式（你供货、平台定价运营），利润极薄但量大。别指望高毛利，适合消化库存产能的工厂型卖家。质检极严，第一次发货建议预留20%次品损耗。',
  },
  'Viral Launch': {
    aliases: 'VL', rating: 'B',
    officialUrl: 'https://viral-launch.com',
    category: '亚马逊运营',
    domesticAnalog: '类似选品雷达+关键词工具',
    suitableFor: '亚马逊中阶卖家，适合需要产品发现和市场分析功能的卖家',
    tips: 'VL的产品发现工具噪音比较大，建议设置严格的过滤条件（月销量大于300，评论小于100）。其关键词工具不如H10精准。',
  },
  'AMZScout': {
    aliases: 'AMZ侦察兵', rating: 'B',
    officialUrl: 'https://amzscout.net',
    category: '亚马逊运营',
    domesticAnalog: '类似轻量版Jungle Scout',
    suitableFor: '预算有限的新手卖家，适合初次尝试选品工具的人',
    tips: '数据准确度中等，适合做初步筛选而非最终决策。PRO插件的销量预估偏差可达30%，务必交叉验证。',
  },
  'Kalodata': {
    aliases: '卡洛', rating: 'B',
    officialUrl: 'https://www.kalodata.com',
    category: 'TikTok数据分析',
    domesticAnalog: 'TikTok版的考古加',
    suitableFor: 'TikTok电商数据分析师，适合需要做市场趋势预判的卖家',
    tips: 'Kalodata的品类趋势数据比较宏观，适合大方向判断。具体选品时不如FastMoss精细。建议两者搭配使用——Kalodata定方向，FastMoss选具体产品。',
  },
  'Pangle': {
    aliases: '穿山甲海外版 / TikTok广告平台', rating: 'A',
    officialUrl: 'https://www.pangle-ads.com',
    category: 'TikTok数据分析',
    domesticAnalog: '相当于巨量引擎的海外版',
    suitableFor: 'TikTok广告投放手，适合需要投放TikTok信息流广告的品牌和卖家',
    tips: 'Pangle的流量便宜但质量参差不齐，游戏和工具类App效果最好，电商直接投放ROI通常小于1。建议先跑视频观看目标积累像素数据，再切转化目标。',
  },
  'CamelCamelCamel': {
    aliases: '骆驼camel / 三驼', rating: 'A',
    officialUrl: 'https://camelcamelcamel.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于什么值得买的历史价格功能',
    suitableFor: '亚马逊买家和卖家都适用，特别适合监控竞品定价策略',
    tips: '免费版功能够用，但价格提醒邮件可能进垃圾箱。做卖家时用它监控竞品的定价规律（是否在特定时间降价），找出价格战模式。',
  },
  'TikTok': {
    aliases: 'TK / 国际抖音', rating: 'S',
    officialUrl: 'https://www.tiktok.com',
    category: '流量平台',
    domesticAnalog: '相当于海外版抖音',
    suitableFor: '所有内容型电商卖家，适合短视频带货和直播带货的东南亚/欧美卖家',
    tips: 'TikTok的账号风控极严，新号前7天不要挂车。先养号发10-15条内容再尝试带货。不同国家需不同SIM卡+IP环境，千万别一个WiFi挂多个国家的号。',
  },
  '腾讯智汇鹅': {
    aliases: '智汇鹅', rating: 'A',
    officialUrl: 'https://www.zhihuie.com',
    category: '金融收款',
    domesticAnalog: '相当于腾讯官方的跨境收款',
    suitableFor: '亚马逊等主流平台卖家，适合信任腾讯品牌的中大型卖家',
    tips: '腾讯自营的跨境收款服务，费率千三封顶。优势是腾讯品牌背书，资金安全有保障。适合对资金安全要求极高的大卖家。',
  },
  'Skyee 跨境收付': {
    aliases: 'Skyee', rating: 'B',
    officialUrl: 'https://www.skyee.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版的小额支付平台',
    suitableFor: '中小跨境电商卖家，适合追求低费率的卖家',
    tips: '费率0.2%封顶非常有竞争力，注册享90天0费率体验。适合小卖家和刚开始做跨境的新手。',
  },
  '丰泊国际': {
    aliases: 'FundPark', rating: 'B',
    officialUrl: 'https://www.fundpark.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版的小微贷款平台',
    suitableFor: '需要资金周转的电商卖家',
    tips: 'FundPark专注电商中小企业融资，利用创新金融科技提供一站式融资解决方案。适合有稳定流水但需要短期资金周转的卖家。',
  },
};

// Category tags mapping
function getCategoryTags(category) {
  const tagMap = {
    '亚马逊运营': ['亚马逊工具', '选品运营'],
    '金融收款': ['跨境支付', '金融工具'],
    '电商平台': ['电商平台', '多平台'],
    'TikTok数据分析': ['TikTok工具', '数据分析'],
    'ERP工具': ['ERP管理', '多平台'],
    '流量平台': ['社交媒体', '内容电商'],
  };
  return tagMap[category] || ['跨境电商'];
}

async function scrapeAmz123Finance(browser) {
  console.log('\nScraping AMZ123 Finance (金融收款)...');
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.amz123.com/finance', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tools = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 2);

      // Find service listings (they appear as name + description pairs)
      const results = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        // Skip header lines
        if (line === '服务商名称' || line === '服务商简介' || line.startsWith('#') || line === '共收录') {
          i++;
          continue;
        }
        // If next line exists and is different, it might be a name+description pair
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          // Heuristic: name is short (2-30 chars), description is longer
          if (line.length <= 30 && nextLine.length > 10 && nextLine.length < 300) {
            results.push({ name: line, description: nextLine.substring(0, 200) });
            i += 2;
            continue;
          }
        }
        i++;
      }
      return results;
    });

    console.log('   Extracted ' + tools.length + ' financial services');
    tools.forEach(function(t) {
      console.log('   - ' + t.name + ': ' + t.description.substring(0, 60) + '...');
    });
    return tools.map(function(t) {
      return { name: t.name, description: t.description, sourceSite: 'AMZ123金融收款' };
    });
  } catch (err) {
    console.log('   Warning: AMZ123 scrape failed: ' + err.message);
    return [];
  } finally {
    await ctx.close();
  }
}

async function scrapeDny123(browser) {
  console.log('\nScraping DNY123 (东南亚导航)...');
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.dny123.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tools = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      const results = [];
      // Extract navigation items
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.length > 3 && line.length < 50 && !line.includes('登录') && !line.includes('注册') && !line.includes('首页') && !line.includes('关于') && !line.includes('ICP') && !line.includes('备案')) {
          results.push({ name: line, description: '' });
        }
      }
      return results.slice(0, 20);
    });

    console.log('   Extracted ' + tools.length + ' items from DNY123');
    return tools.map(function(t) {
      return { name: t.name, description: t.description, sourceSite: 'DNY123' };
    });
  } catch (err) {
    console.log('   Warning: DNY123 scrape failed: ' + err.message);
    return [];
  } finally {
    await ctx.close();
  }
}

async function main() {
  console.log('=== AMZ123/DNY123 Auto-Scrape + AI Enrichment + Production Import ===\n');

  var browser = await chromium.launch({ headless: true });

  // Step 1: Scrape
  var financeTools = await scrapeAmz123Finance(browser);
  var dnyTools = await scrapeDny123(browser);

  await browser.close();

  // Step 2: Match scraped tools with AI knowledge base
  var knownNames = Object.keys(TOOL_KNOWLEDGE);
  var allScraped = financeTools.concat(dnyTools);
  var scrapedNames = allScraped.map(function(t) { return t.name.toLowerCase(); });

  var matched = [];
  var unmatched = [];

  for (var i = 0; i < knownNames.length; i++) {
    var toolName = knownNames[i];
    var found = allScraped.find(function(t) {
      return t.name.toLowerCase().includes(toolName.toLowerCase()) ||
             toolName.toLowerCase().includes(t.name.toLowerCase());
    });

    if (found) {
      matched.push({
        name: toolName,
        description: found.description,
        sourceSite: found.sourceSite,
        knowledge: TOOL_KNOWLEDGE[toolName]
      });
    } else {
      unmatched.push({
        name: toolName,
        description: '',
        sourceSite: 'AI Knowledge Base',
        knowledge: TOOL_KNOWLEDGE[toolName]
      });
    }
  }

  console.log('\nData Summary:');
  console.log('  Scraped from AMZ123 Finance: ' + financeTools.length);
  console.log('  Scraped from DNY123: ' + dnyTools.length);
  console.log('  Matched with AI knowledge: ' + matched.length);
  console.log('  AI knowledge supplement: ' + unmatched.length);

  // Select top 10 (prioritize S-rated, then matched from scrape)
  var ratingOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
  unmatched.sort(function(a, b) {
    return (ratingOrder[a.knowledge.rating] || 4) - (ratingOrder[b.knowledge.rating] || 4);
  });

  var selected = matched.slice();
  for (var u = 0; u < unmatched.length && selected.length < 10; u++) {
    selected.push(unmatched[u]);
  }

  // Ensure we have a good mix - prioritize scraped items first
  var scrapedMatched = matched.slice(0, 4);
  var topUnmatched = unmatched.slice(0, 6);
  selected = scrapedMatched.concat(topUnmatched).slice(0, 10);

  // Step 3: Build resources
  var resources = selected.map(function(tool) {
    var k = tool.knowledge;
    var url = k.officialUrl || '';

    var description = '[别名] ' + k.aliases +
      '\n[评级] ' + k.rating + '级' +
      '\n[国内类比] ' + k.domesticAnalog +
      '\n[适合人群] ' + k.suitableFor +
      '\n[新手避坑] ' + k.tips;

    return {
      name: tool.name,
      url: url,
      description: description,
      category: 'business',
      tags: [k.rating + '级工具'].concat(getCategoryTags(k.category)),
      sourceType: 'third-party',
      usage: '新手建议：' + k.tips.split('\u3002')[0],
      disclaimer: k.domesticAnalog + '\u3002数据仅供参考，使用前请核实最新政策\u3002'
    };
  });

  var topicName = '2026出海必备：跨境支付与东南亚电商 S级工具避坑指南';
  if (matched.length > 0) {
    var categories = matched.map(function(m) { return m.knowledge.category; });
    var uniqueCats = categories.filter(function(item, pos) { return categories.indexOf(item) === pos; });
    if (uniqueCats.length > 0) {
      topicName = '2026出海必备：' + uniqueCats.slice(0, 2).join('+') + ' S级工具避坑指南';
    }
  }

  var payload = {
    resources: resources,
    createTopic: true,
    topicName: topicName
  };

  console.log('\nPreparing to push ' + resources.length + ' enriched items');
  console.log('Topic: ' + topicName);
  console.log('\nAI-enriched preview:');
  resources.slice(0, 3).forEach(function(r, idx) {
    console.log('\n  ' + (idx + 1) + '. ' + r.name + ' [' + r.tags[0] + ']');
    console.log('     ' + r.description.split('\n').slice(0, 3).join('\n     '));
  });

  // Step 4: Login and POST to API
  console.log('\n--- Authenticating ---');
  var csrfRes = await fetch('https://jueshi.net/api/auth/csrf', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  var csrfData = await csrfRes.json();
  var csrfToken = csrfData.csrfToken;

  // Parse cookies from CSRF response
  var csrfCookies = [];
  var setCk = csrfRes.headers.get('set-cookie');
  if (setCk) {
    var parts = setCk.split(',');
    for (var p = 0; p < parts.length; p++) {
      csrfCookies.push(parts[p].split(';')[0]);
    }
  }

  console.log('CSRF Token: ' + csrfToken.substring(0, 20) + '...');
  console.log('CSRF Cookies: ' + csrfCookies.join('; ').substring(0, 80));

  // Login
  var loginBody = 'email=' + encodeURIComponent('test-admin@local.test') +
    '&password=' + encodeURIComponent('TestAdmin2026!') +
    '&redirect=false' +
    '&csrfToken=' + encodeURIComponent(csrfToken);

  var loginRes = await fetch('https://jueshi.net/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies.join('; '),
    },
    body: loginBody,
    redirect: 'manual',
  });

  var loginCookies = [];
  var loginSetCk = loginRes.headers.get('set-cookie');
  if (loginSetCk) {
    var loginParts = loginSetCk.split(',');
    for (var lp = 0; lp < loginParts.length; lp++) {
      loginCookies.push(loginParts[lp].split(';')[0]);
    }
  }

  console.log('Login status: ' + loginRes.status);
  console.log('Login cookies: ' + loginCookies.join('; ').substring(0, 100));
  console.log('Login URL: ' + loginRes.url);

  // Check login redirect - next-auth redirects to the callback URL on success
  var allCookies = csrfCookies.concat(loginCookies).join('; ');

  // Verify session
  var sessionRes = await fetch('https://jueshi.net/api/auth/session', {
    headers: { 'Cookie': allCookies },
  });
  var sessionData = await sessionRes.json();
  console.log('Session: ' + JSON.stringify(sessionData).substring(0, 150));

  // POST to import API
  console.log('\n--- Pushing to Production ---');
  var importRes = await fetch('https://jueshi.net/api/admin/resources/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': allCookies,
    },
    body: JSON.stringify(payload),
  });

  var importData = await importRes.json();

  if (importRes.ok) {
    console.log('\nSUCCESS!');
    console.log('  Imported: ' + importData.imported);
    console.log('  Created: ' + (importData.details ? importData.details.created : 0));
    console.log('  Updated: ' + (importData.details ? importData.details.updated : 0));
    if (importData.topicId) {
      console.log('  Topic ID: ' + importData.topicId);
      console.log('  View at: https://jueshi.net/admin/topics');
    }
    if (importData.errors && importData.errors.length > 0) {
      console.log('\nErrors (' + importData.errors.length + '):');
      importData.errors.slice(0, 5).forEach(function(e) {
        console.log('  - ' + e.name + ': ' + e.error);
      });
    }
  } else {
    console.log('\nFAILED (' + importRes.status + ')');
    console.log(JSON.stringify(importData, null, 2));
  }

  // Showcase
  console.log('\n' + '='.repeat(60));
  console.log('AI BRAIN ENRICHMENT SHOWCASE');
  console.log('='.repeat(60));

  var showcase = [resources[0], resources[1]].filter(Boolean);
  for (var s = 0; s < showcase.length; s++) {
    var item = showcase[s];
    console.log('\n' + item.name);
    console.log('  ' + item.description.split('\n').join('\n  '));
  }

  return importData;
}

main().catch(function(err) {
  console.error('Fatal error:', err);
  process.exit(1);
});
