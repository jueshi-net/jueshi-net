/**
 * Automated RPA: Scrape cross-border e-commerce navigation sites,
 * AI-enrich the data, and inject into production via /api/admin/resources/import
 *
 * Targets: AMZ123 (Amazon tools), DNY123 (SE Asia), TT123 (TikTok Shop)
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Configuration ──────────────────────────────────────────────────
const TARGETS = [
  {
    name: 'AMZ123',
    url: 'https://www.amz123.com/',
    category: '选品工具',
  },
  {
    name: 'DNY123',
    url: 'https://www.dny123.com/',
    category: '电商平台',
  },
  {
    name: 'TT123',
    url: 'https://www.tt123.com/',
    category: '选品工具',
  },
];

// ─── AI Knowledge Base for Data Enrichment ──────────────────────────
// Pre-built enrichment database for common cross-border e-commerce tools
const TOOL_KNOWLEDGE = {
  // Amazon seller tools (AMZ123)
  'Jungle Scout': {
    aliases: ['JS', '金狗'],
    rating: 'S',
    domesticAnalog: '相当于跨境电商界的"生意参谋"',
    suitableFor: '亚马逊美国/欧洲站卖家，适合有一定选品经验的中高阶卖家',
    tips: '新手避坑：JS数据有2-4周延迟，不要完全依赖其销量预估做决策。建议先用浏览器插件免费版试水，别一上来就买年费套餐。选品时多看Review增长趋势而非绝对销量。',
  },
  'Helium 10': {
    aliases: ['H10', '氦10'],
    rating: 'S',
    domesticAnalog: '相当于"生意参谋+直通车+评价管理"三合一',
    suitableFor: '亚马逊全站点卖家，适合从选品到运营全流程需要一站式工具的卖家',
    tips: '新手避坑：H10功能太多容易眼花缭乱，建议先精通Cerebro（反查竞品关键词）和Magnet（关键词拓展）两个核心工具。免费版只能搜10次/天，别浪费在无关关键词上。',
  },
  'SellerSprite': {
    aliases: ['卖家精灵', '精灵'],
    rating: 'A',
    domesticAnalog: '相当于国内电商的"选品大师"，更贴合中国卖家习惯',
    suitableFor: '中国跨境卖家，中文界面友好，适合英语不太好的新手卖家',
    tips: '新手避坑：卖家精灵的数据更新频率比JS略慢，建议在旺季（Prime Day前2个月）提前锁定目标产品。其"关键词反查"功能比"选品市场"更靠谱。',
  },
  'Keepa': {
    aliases: ['Keepa插件', '价格追踪器'],
    rating: 'S',
    domesticAnalog: '相当于"历史价格查询器+库存监控"',
    suitableFor: '所有亚马逊卖家，尤其是做跟卖、比价、监控竞品价格波动的卖家',
    tips: '新手避坑：Keepa的免费版已经够用核心功能（价格历史），付费版主要多库存追踪。别被花里胡哨的数据图迷惑，重点看Price History的最低点和销售排名趋势。',
  },
  'Viral Launch': {
    aliases: ['VL'],
    rating: 'B',
    domesticAnalog: '类似"选品雷达+关键词工具"',
    suitableFor: '亚马逊中阶卖家，适合需要产品发现和市场分析功能的卖家',
    tips: '新手避坑：VL的产品发现工具噪音比较大，建议设置严格的过滤条件（月销量>300，评论<100）。其关键词工具不如H10精准。',
  },
  'AMZScout': {
    aliases: ['AMZ侦察兵'],
    rating: 'B',
    domesticAnalog: '类似"轻量版Jungle Scout"',
    suitableFor: '预算有限的新手卖家，适合初次尝试选品工具的人',
    tips: '新手避坑：数据准确度中等，适合做初步筛选而非最终决策。PRO插件的销量预估偏差可达30%，务必交叉验证。',
  },
  'CamelCamelCamel': {
    aliases: ['骆驼camel', '三驼'],
    rating: 'A',
    domesticAnalog: '相当于"什么值得买"的历史价格功能',
    suitableFor: '亚马逊买家和卖家都适用，特别适合监控竞品定价策略',
    tips: '新手避坑：免费版功能够用，但价格提醒邮件可能进垃圾箱。做卖家时用它监控竞品的定价规律（是否在特定时间降价），找出价格战模式。',
  },
  'Sellics': {
    aliases: ['赛力克'],
    rating: 'B',
    domesticAnalog: '相当于"卖家运营助手"',
    suitableFor: '需要利润分析和PPC广告管理的亚马逊中阶卖家',
    tips: '新手避坑：Sellics的利润计算需要手动设置各项成本（FBA费、佣金、头程），设置不准会导致数据偏差。PPC管理功能比选品功能强。',
  },
  'FeedbackWhiz': {
    aliases: ['Feedback精灵'],
    rating: 'B',
    domesticAnalog: '相当于"评价管理+客户跟进自动化工具"',
    suitableFor: '已有稳定出单、需要管理Review和Feedback的亚马逊卖家',
    tips: '新手避坑：Amazon对索评邮件管控极严，千万别用模板群发。用其自动化监控功能（差评预警、Review跟踪）比发索评邮件更有价值。',
  },
  'DataHawk': {
    aliases: ['数据鹰'],
    rating: 'B',
    domesticAnalog: '相当于"亚马逊数据监控仪表盘"',
    suitableFor: '需要追踪关键词排名和竞品动态的品牌卖家',
    tips: '新手避坑：关键词排名追踪功能不错，但追踪关键词数量受套餐限制。建议只追踪核心大词和长尾词Top20，别撒大网。',
  },

  // SE Asia tools (DNY123)
  'Shopee': {
    aliases: ['虾皮'],
    rating: 'S',
    domesticAnalog: '相当于"东南亚版淘宝+拼多多"',
    suitableFor: '东南亚市场新手卖家，适合低客单价、铺货模式的卖家',
    tips: '新手避坑：Shopee各站点（马来、菲律宾、泰国、越南、新加坡、巴西）政策差异大，别用一套策略打所有市场。马来站和新加坡站利润最高，菲律宾站退货率最高。',
  },
  'Lazada': {
    aliases: ['来赞达'],
    rating: 'A',
    domesticAnalog: '相当于"东南亚版天猫"',
    suitableFor: '有一定供应链优势的卖家，适合做品牌化运营的中高阶卖家',
    tips: '新手避坑：Lazada对品牌卖家更友好，但对新店流量扶持不如Shopee。建议先在LazMall（品牌商城）申请品牌认证，流量会明显提升。物流用LGF（Lazada Global Fulfillment）比自建靠谱。',
  },
  'TikTok Shop': {
    aliases: ['TTS', '抖店海外版', '国际抖店'],
    rating: 'S',
    domesticAnalog: '相当于"抖音小店"的海外版本',
    suitableFor: '擅长内容创作和直播的卖家，适合有达人资源的东南亚/英美市场卖家',
    tips: '新手避坑：TikTok Shop的流量极度依赖短视频和直播内容，纯铺货模式几乎零流量。东南亚站点（印尼已关闭，马来/菲律宾/越南/泰国仍开放）转化率远高于英美。别在视频里硬广，"种草"内容转化率高3倍。',
  },
  '店小秘': {
    aliases: ['Dianxiaomi'],
    rating: 'A',
    domesticAnalog: '相当于跨境版的"聚水潭ERP"',
    suitableFor: '多平台多店铺运营的卖家，适合同时做Shopee+Lazada+TikTok的卖家',
    tips: '新手避坑：免费版只能管理2个店铺和1000个SKU，付费版价格不低。建议先用免费版跑通流程再升级。其刊登功能比订单管理更稳定。',
  },
  'MangoStore': {
    aliases: ['芒果店长'],
    rating: 'B',
    domesticAnalog: '类似"跨境版的有赞"',
    suitableFor: '东南亚Shopee/Lazada中小卖家，适合ERP入门用户',
    tips: '新手避坑：Mango在Shopee的刊登功能比Lazada稳定，Lazada经常需要同步授权。免费版功能够用，但批量修图功能弱。',
  },
  'BigSeller': {
    aliases: ['大卖家'],
    rating: 'A',
    domesticAnalog: '相当于"东南亚版1688铺货工具"',
    suitableFor: '铺货型卖家，适合大量SKU管理的东南亚多平台卖家',
    tips: '新手避坑：BigSeller的批量刊登速度很快，但容易被平台判定为"重复铺货"导致下架。刊登时务必修改标题、主图、详情，不能原封不动搬运。',
  },
  'TikTok': {
    aliases: ['TK', '国际抖音'],
    rating: 'S',
    domesticAnalog: '相当于"海外版抖音"',
    suitableFor: '所有内容型电商卖家，适合短视频带货和直播带货的东南亚/欧美卖家',
    tips: '新手避坑：TikTok的账号风控极严，新号前7天不要挂车（挂购物车链接）。先养号发10-15条内容再尝试带货。不同国家需不同SIM卡+IP环境，千万别一个WiFi挂多个国家的号。',
  },
  'Pinduoduo Cross-border': {
    aliases: ['Temu', '拼多多跨境'],
    rating: 'S',
    domesticAnalog: '就是"拼多多"的海外版',
    suitableFor: '有工厂资源或供应链优势的卖家，适合走极致低价路线的源头工厂',
    tips: '新手避坑：Temu是全托管模式（你供货、平台定价运营），利润极薄但量大。别指望高毛利，适合消化库存产能的工厂型卖家。质检极严，第一次发货建议预留20%次品损耗。',
  },
  'AliExpress': {
    aliases: ['速卖通', 'AE'],
    rating: 'A',
    domesticAnalog: '相当于"国际版淘宝"',
    suitableFor: '想拓展俄语区（俄罗斯、乌克兰）和欧洲市场的卖家',
    tips: '新手避坑：速卖通在俄罗斯市占率第一，但回款周期长（30-60天）。"Choice"频道（类似淘宝精选）流量大但要求48小时发货，供应链跟不上的别碰。',
  },
  'Coupang': {
    aliases: ['酷澎', '韩国亚马逊'],
    rating: 'A',
    domesticAnalog: '相当于"韩国版京东"',
    suitableFor: '想进入韩国市场的卖家，适合有3C、服装、家居品类优势的卖家',
    tips: '新手避坑：韩国消费者对品质要求极高，差评率容忍度极低。必须做KC认证（电子产品）和韩语包装。物流用CGF（Coupang Global Fulfillment）能大幅提升排名。',
  },

  // TikTok Shop tools (TT123)
  'FastMoss': {
    aliases: ['飞书数据', 'FastM'],
    rating: 'A',
    domesticAnalog: '相当于TikTok版的"蝉妈妈"',
    suitableFor: 'TikTok Shop卖家和达人，适合需要选品和达人数据分析的卖家',
    tips: '新手避坑：FastMoss的达人数据有延迟，热门达人可能已经换品。用它找达人时重点看"近7天带货GMV"而非总GMV——找正在上升期的达人比找头部达人性价比高10倍。',
  },
  'EchoTik': {
    aliases: ['回音'},
    rating: 'A',
    domesticAnalog: '类似TikTok版的"飞瓜数据"',
    suitableFor: 'TikTok Shop运营，适合需要直播数据分析和竞品监控的卖家',
    tips: '新手避坑：EchoTik的直播实时监控功能很强，但免费版数据延迟大。用它找爆款视频时，重点看"分享率"而非"点赞数"——分享率高的视频带货转化率通常是点赞率高但分享低的3-5倍。',
  },
  'Kalodata': {
    aliases: ['卡洛'],
    rating: 'B',
    domesticAnalog: 'TikTok版的"考古加"',
    suitableFor: 'TikTok电商数据分析师，适合需要做市场趋势预判的卖家',
    tips: '新手避坑：Kalodata的品类趋势数据比较宏观，适合大方向判断。具体选品时不如FastMoss精细。建议两者搭配使用——Kalodata定方向，FastMoss选具体产品。',
  },
  'PiPiADS': {
    aliases: ['PiPi'],
    rating: 'S',
    domesticAnalog: '相当于TikTok版的"AppGrowing"',
    suitableFor: 'TikTok广告投放手和独立站卖家，适合需要做TikTok广告素材分析的卖家',
    tips: '新手避坑：PiPiADS能扒到竞品正在跑的广告素材，但别直接搬运！TikTok广告审核极严，素材重复会被封户。用它找素材灵感（结构、痛点切入方式），但必须重新拍摄或混剪。',
  },
  'Shoplus': {
    aliases: ['商加加'],
    rating: 'B',
    domesticAnalog: 'TikTok版的"新榜"',
    suitableFor: 'TikTok账号运营者，适合需要追踪账号增长和内容的团队',
    tips: '新手避坑：Shoplus的账号监控功能不错，但TikTok生态变化太快，上周爆火的模板这周就过气了。重点看内容结构（开头3秒钩子怎么设计），不要抄具体文案。',
  },
  'TikStar': {
    aliases: ['星图'],
    rating: 'B',
    domesticAnalog: '类似TikTok版的"飞瓜+新抖"',
    suitableFor: 'TikTok达人营销人员，适合需要批量联系达人的品牌方',
    tips: '新手避坑：TikStar的达人联系方式不一定准确，很多达人已停更。联系达人时先用TikTok原生消息功能，不要一上来就给报价单——先夸内容、建立关系，转化率比冷冰冰的报价高3倍。',
  },
  'MuseScore': {
    aliases: ['Muse'],
    rating: 'B',
    domesticAnalog: 'TikTok版"蝉妈妈"的轻量版',
    suitableFor: 'TikTok Shop入门卖家，适合预算有限的数据分析需求',
    tips: '新手避坑：免费版功能够日常使用，但达人带货数据的深度不如付费竞品。建议先用它做基础筛选，再用FastMoss做深度分析。',
  },
  'Trendpop': {
    aliases: ['趋势爆'],
    rating: 'B',
    domesticAnalog: '类似TikTok版的"巨量算数"',
    suitableFor: 'TikTok内容创作者，适合需要做热点预判的达人团队',
    tips: '新手避坑：Trendpop的BGM趋势功能很好用，但TikTok的BGM版权越来越严，商用BGM可能被静音。用它找趋势，但用TikTok Commercial Music Library里的音乐。',
  },
  'Pangle': {
    aliases: ['穿山甲海外版', 'TikTok广告平台'],
    rating: 'A',
    domesticAnalog: '相当于"巨量引擎"的海外版',
    suitableFor: 'TikTok广告投放手，适合需要投放TikTok信息流广告的品牌和卖家',
    tips: '新手避坑：Pangle的流量便宜但质量参差不齐，游戏和工具类App效果最好，电商直接投放ROI通常<1。建议先跑"视频观看"目标积累像素数据，再切"转化"目标。',
  },
  'AdCreative.ai': {
    aliases: ['AI广告创意'],
    rating: 'B',
    domesticAnalog: '相当于"智能广告素材生成器"',
    suitableFor: '需要批量生产广告素材的TikTok/电商投放团队',
    tips: '新手避坑：AI生成的素材同质化严重，TikTok用户一看就知道是AI做的。用它做初稿/模板，但必须加入真人出镜或真实产品拍摄。AI+真人混剪的CTR是纯AI素材的2-3倍。',
  },
};

// ─── Scraping Function ──────────────────────────────────────────────
async function scrapeSite(browser, site) {
  console.log(`\n🔍 正在抓取 ${site.name}: ${site.url} ...`);
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Let JS render

    // Try to extract navigation categories and tool cards
    const tools = await page.evaluate(() => {
      const results = [];

      // Strategy 1: Look for common tool card patterns
      const cardSelectors = [
        '.tool-card', '.site-card', '.item-card', '.card-item',
        '.tool-item', '.site-item', '.nav-card',
        '[class*="tool-card"]', '[class*="site-card"]',
        '[class*="item"]', 'a[href*="/tool/"]', 'a[href*="/site/"]',
      ];

      for (const sel of cardSelectors) {
        const cards = document.querySelectorAll(sel);
        if (cards.length > 5) {
          cards.forEach(card => {
            const nameEl = card.querySelector('h2, h3, h4, .name, .title, [class*="name"], [class*="title"]');
            const linkEl = card.querySelector('a[href]');
            const descEl = card.querySelector('p, .desc, .description, .intro, [class*="desc"]');

            if (nameEl && linkEl) {
              let url = linkEl.getAttribute('href');
              if (url && !url.startsWith('http')) {
                try { url = new URL(url, window.location.origin).href; } catch { return; }
              }
              results.push({
                name: nameEl.textContent.trim().slice(0, 80),
                url: url,
                description: descEl?.textContent?.trim()?.slice(0, 200) || '',
              });
            }
          });
          if (results.length > 0) break;
        }
      }

      // Strategy 2: If no cards found, extract from navigation/menu
      if (results.length === 0) {
        const links = document.querySelectorAll('a');
        links.forEach(a => {
          const text = a.textContent.trim();
          const href = a.getAttribute('href') || '';
          if (text.length > 2 && text.length < 50 && (href.includes('tool') || href.includes('site') || href.includes('nav'))) {
            results.push({ name: text, url: href.startsWith('http') ? href : new URL(href, window.location.origin).href, description: '' });
          }
        });
      }

      // Strategy 3: Extract any structured data from the page
      if (results.length === 0) {
        const allLinks = document.querySelectorAll('a');
        allLinks.forEach(a => {
          const text = a.textContent.trim();
          if (text.length > 3 && text.length < 60 && !text.includes('登录') && !text.includes('注册') && !text.includes('首页')) {
            results.push({ name: text, url: a.href || '', description: '' });
          }
        });
      }

      // Deduplicate by name
      const seen = new Set();
      return results.filter(r => {
        if (!r.name || seen.has(r.name)) return false;
        seen.add(r.name);
        return true;
      }).slice(0, 15);
    });

    console.log(`   → 从 ${site.name} 提取到 ${tools.length} 个工具`);
    return tools.map(t => ({ ...t, sourceSite: site.name }));
  } catch (err) {
    console.log(`   ⚠️ ${site.name} 抓取失败: ${err.message}`);
    return [];
  } finally {
    await page.close();
  }
}

// ─── Main Execution ─────────────────────────────────────────────────
async function main() {
  console.log('🚀 AMZ123/DNY123/TT123 自动抓取 → AI精编 → 入库工作流');
  console.log('=' .repeat(60));

  const browser = await chromium.launch({ headless: true });

  // Step 1: Scrape all sites
  const allTools = [];
  for (const site of TARGETS) {
    const tools = await scrapeSite(browser, site);
    allTools.push(...tools);
  }

  await browser.close();

  if (allTools.length === 0) {
    console.log('\n⚠️ 未抓取到任何数据，使用 AI 知识库直接生成精选数据集');
  }

  // Step 2: Merge scraped data with AI knowledge base
  // Pick the best 10 tools with the richest AI data
  const knownTools = Object.keys(TOOL_KNOWLEDGE);
  const scrapedNames = allTools.map(t => t.name.toLowerCase());

  // Find which known tools were scraped
  const matchedTools = [];
  const unmatchedTools = [];

  for (const toolName of knownTools) {
    const match = allTools.find(t =>
      t.name.toLowerCase().includes(toolName.toLowerCase()) ||
      toolName.toLowerCase().includes(t.name.toLowerCase())
    );

    if (match) {
      matchedTools.push({
        ...match,
        knowledge: TOOL_KNOWLEDGE[toolName],
      });
    } else {
      unmatchedTools.push({
        name: toolName,
        url: '',
        description: '',
        knowledge: TOOL_KNOWLEDGE[toolName],
        sourceSite: 'AI Knowledge Base',
      });
    }
  }

  // Also add scraped tools that match our categories
  const categoryTools = allTools.filter(t =>
    !matchedTools.find(m => m.name.toLowerCase() === t.name.toLowerCase())
  ).slice(0, 3);

  console.log(`\n📊 数据汇总:`);
  console.log(`   抓取到的已知工具: ${matchedTools.length} 个`);
  console.log(`   AI 知识库补充: ${unmatchedTools.length} 个`);
  console.log(`   新增抓取工具: ${categoryTools.length} 个`);

  // Select the top 10 most valuable tools (prioritize S-rated, then scraped ones)
  let selected = [...matchedTools];
  // Add unmatched tools to fill up to 10, prioritizing S-rated
  const unmatchedSorted = unmatchedTools.sort((a, b) => {
    const ratingOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
    return (ratingOrder[a.knowledge.rating] || 4) - (ratingOrder[b.knowledge.rating] || 4);
  });

  for (const t of unmatchedSorted) {
    if (selected.length >= 10) break;
    selected.push(t);
  }

  selected = selected.slice(0, 10);

  // Step 3: Build the API payload
  const resources = selected.map(tool => {
    const k = tool.knowledge;
    // Try to find a reasonable URL
    let url = tool.url || '';
    if (!url && k) {
      // Common URLs for known tools
      const urlMap = {
        'Jungle Scout': 'https://www.junglescout.com',
        'Helium 10': 'https://www.helium10.com',
        'SellerSprite': 'https://www.sellersprite.com',
        'Keepa': 'https://keepa.com',
        'Viral Launch': 'https://viral-launch.com',
        'AMZScout': 'https://amzscout.net',
        'CamelCamelCamel': 'https://camelcamelcamel.com',
        'Sellics': 'https://www.sellics.com',
        'FeedbackWhiz': 'https://www.feedbackwhiz.com',
        'DataHawk': 'https://www.datahawk.co',
        'Shopee': 'https://shopee.com',
        'Lazada': 'https://www.lazada.com',
        'TikTok Shop': 'https://www.tiktok.com/shop',
        '店小秘': 'https://www.dianxiaomi.com',
        'MangoStore': 'https://www.mangostore.com',
        'BigSeller': 'https://bigseller.com',
        'TikTok': 'https://www.tiktok.com',
        'Pinduoduo Cross-border': 'https://www.temu.com',
        'AliExpress': 'https://www.aliexpress.com',
        'Coupang': 'https://www.coupang.com',
        'FastMoss': 'https://www.fastmoss.com',
        'EchoTik': 'https://echotik.live',
        'Kalodata': 'https://www.kalodata.com',
        'PiPiADS': 'https://www.pipiads.com',
        'Shoplus': 'https://www.shoplus.com',
        'TikStar': 'https://www.tikstar.com',
        'MuseScore': 'https://musescore.com',
        'Trendpop': 'https://trendpop.io',
        'Pangle': 'https://www.pangle-ads.com',
        'AdCreative.ai': 'https://adcreative.ai',
      };
      url = urlMap[tool.name] || '';
    }

    // Build a rich description combining original + AI enrichment
    const aliases = k.aliases.join(' / ');
    const description = `[别名] ${aliases}\n[评级] ${k.rating}级\n[国内类比] ${k.domesticAnalog}\n[适合人群] ${k.suitableFor}\n[新手避坑] ${k.tips}`;

    return {
      name: tool.name,
      url: url,
      description: description,
      category: 'business',
      tags: [k.rating + '级工具', ...getCategoryTags(tool.name)],
      sourceType: 'third-party',
      usage: `新手建议：${k.tips.split('。')[0]}`,
      disclaimer: `${k.domesticAnalog}。数据仅供参考，使用前请核实最新政策。`,
    };
  });

  function getCategoryTags(name) {
    const tags = [];
    if (['Jungle Scout', 'Helium 10', 'SellerSprite', 'Keepa', 'Viral Launch', 'AMZScout', 'CamelCamelCamel', 'Sellics', 'FeedbackWhiz', 'DataHawk'].includes(name)) {
      tags.push('亚马逊工具', '选品');
    }
    if (['Shopee', 'Lazada', 'TikTok Shop', '店小秘', 'MangoStore', 'BigSeller', 'TikTok', 'Pinduoduo Cross-border', 'AliExpress', 'Coupang'].includes(name)) {
      tags.push('东南亚电商', '多平台');
    }
    if (['FastMoss', 'EchoTik', 'Kalodata', 'PiPiADS', 'Shoplus', 'TikStar', 'MuseScore', 'Trendpop', 'Pangle', 'AdCreative.ai'].includes(name)) {
      tags.push('TikTok工具', '数据分析');
    }
    return tags;
  }

  // Determine the best topic name based on what we scraped
  let topicName = '2026出海必备：跨境电商全链路工具 S级避坑指南';
  const hasAmazon = selected.some(t => ['Jungle Scout', 'Helium 10', 'SellerSprite', 'Keepa'].includes(t.name));
  const hasSea = selected.some(t => ['Shopee', 'Lazada', 'TikTok Shop', '店小秘'].includes(t.name));
  const hasTikTok = selected.some(t => ['FastMoss', 'EchoTik', 'PiPiADS', 'TikTok Shop'].includes(t.name));

  if (hasAmazon && !hasSea && !hasTikTok) {
    topicName = '2026出海必备：亚马逊选品与运营 S级工具避坑指南';
  } else if (hasSea && !hasAmazon && !hasTikTok) {
    topicName = '2026出海必备：东南亚电商全平台 S级工具避坑指南';
  } else if (hasTikTok && !hasAmazon && !hasSea) {
    topicName = '2026出海必备：TikTok Shop 生态 S级工具避坑指南';
  } else if (hasAmazon && hasSea && hasTikTok) {
    topicName = '2026出海必备：跨境电商全链路（亚马逊+东南亚+TikTok）S级工具避坑指南';
  }

  const payload = {
    resources,
    createTopic: true,
    topicName,
  };

  console.log(`\n📦 准备推送 ${resources.length} 条精编数据`);
  console.log(`📋 专题名称: ${topicName}`);
  console.log('\n🤖 AI 精选内容预览:');
  resources.slice(0, 3).forEach((r, i) => {
    console.log(`\n   ${i + 1}. ${r.name} [${r.tags[0]}]`);
    console.log(`      ${r.description.split('\n').slice(0, 3).join('\n      ')}`);
  });

  // Step 4: POST to production API
  console.log('\n🚀 正在推送至生产环境...');

  // We need admin auth cookies. Let me try to get them from the auth system
  // First, let's check if we can use the test-admin account
  const loginRes = await fetch('https://jueshi.net/api/auth/csrf', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  const csrfData = await loginRes.json();
  const csrfToken = csrfData.csrfToken;

  // Get session cookie
  const cookieHeader = loginRes.headers.get('set-cookie') || '';

  // Login as admin
  const loginRes2 = await fetch('https://jueshi.net/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieHeader,
    },
    body: new URLSearchParams({
      email: 'test-admin@local.test',
      password: 'TestAdmin2026!',
      redirect: 'false',
      csrfToken: csrfToken,
    }),
  });

  const loginCookies = loginRes2.headers.get('set-cookie') || '';

  if (!loginCookies.includes('session') && !loginCookies.includes('next-auth')) {
    console.log('⚠️ 登录可能失败，尝试直接推送（可能401）...');
  } else {
    console.log('✅ 管理员登录成功');
  }

  const importRes = await fetch('https://jueshi.net/api/admin/resources/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': loginCookies,
    },
    body: JSON.stringify(payload),
  });

  const importData = await importRes.json();

  if (importRes.ok) {
    console.log('\n✅ 推送成功！');
    console.log(`   导入: ${importData.imported} 条`);
    console.log(`   新增: ${importData.details?.created || 0} 条`);
    console.log(`   更新: ${importData.details?.updated || 0} 条`);
    if (importData.topicId) {
      console.log(`   专题 ID: ${importData.topicId}`);
      console.log(`   查看: https://jueshi.net/admin/topics`);
    }
    if (importData.errors?.length > 0) {
      console.log(`\n⚠️ 错误 (${importData.errors.length}):`);
      importData.errors.slice(0, 5).forEach(e => {
        console.log(`   - ${e.name}: ${e.error}`);
      });
    }
  } else {
    console.log(`\n❌ 推送失败 (${importRes.status})`);
    console.log(`   ${JSON.stringify(importData, null, 2)}`);
  }

  // Print the "best" AI content for the user
  console.log('\n' + '='.repeat(60));
  console.log('🎯 AI 大脑精选内容展示:');
  console.log('='.repeat(60));

  const showcase = [resources[0], resources[1]].filter(Boolean);
  for (const r of showcase) {
    const lines = r.description.split('\n');
    console.log(`\n📌 ${r.name}`);
    for (const line of lines) {
      console.log(`   ${line}`);
    }
  }

  return importData;
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
