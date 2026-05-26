/**
 * ================================================================
 *  海外百宝箱 RPA V2 — 全量潜行收割 + 智能去重巡航
 * ================================================================
 *  Features:
 *   - Smart Throttling: 5-15s random sleep, 2min pause every 20 items
 *   - Fuzzy Dedup: merge duplicates like "卖家精灵" + "卖家精灵（SellerSprite）"
 *   - Topic Chunking: split by category, max 20 per topic
 *   - Daemon Mode: elegant timestamped logging
 * ================================================================
 */

const { chromium } = require('playwright');
const crypto = require('crypto');

// ─── Logging Helpers ────────────────────────────────────────────────
function ts() {
  const now = new Date();
  return now.toLocaleTimeString('zh-CN', { hour12: false });
}

function log(msg, tag) {
  const t = tag ? `[${tag}]` : '[INFO]';
  console.log(`[${ts()}] ${t.padEnd(8)} ${msg}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomSleep(min, max) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  log(`潜行休眠 ${ms}ms ...`, 'SLEEP');
  return sleep(ms);
}

// ─── Filter: Only keep logistics-relevant entries ───────────────────
const LOGISTICS_KEYWORDS = [
  '物流', '物流科技', '供应链', '国际物流', '跨境', '专线',
  '海外仓', '仓储', '快递', '货运', '海运', '空运',
  '清关', '头程', 'FBA', '派送', '代收', 'COD',
  'Shopee', 'Lazada', 'TikTok', 'Ninja', 'Temu',
  '云途', '联宇', '纽酷', '大森林', '众包', '豪速',
  '枫筝', '康可', 'Locad', '鑫远洋', '超卖', '宝通达',
  '美信', 'HAOYO', '海云汇', '马丁', 'Octopia', 'SGR',
  '邑通达', '达派思', '世盖', '三泊', '中南通达',
  '云捷', '安君', '德速', '德展', '卓世',
  '大境', '轻舟', '星越', '智鸟', '佳灵', '赛瑞达',
  '巨豹', '润泰', '泉龙', '八戒', '货憨憨',
  '能者', '嘀嗒嘀', '凯琦', '美设', '一八',
  '联合运通', '湘诚', '领格', '世达', '宁致', '天创',
  '品牌运通', '盈和', '晟诚', '宝昌', '博泓', '满天星',
  '金丝象', '慧合', '凡士达', '永达', '澳华', '摆渡',
  '速玛', '昊宏', '美通', '极智', '立昂', '杰航',
  '飞越达', '易通安达', '慧和', '云拓', '伊森', '巨宝',
  '天盛', '西邮', '里程碑', '亦邦', '迅田', '浣熊',
];

function isLogisticsRelevant(name) {
  // Must be at least 3 chars (Chinese chars count as 1)
  if (name.length < 3) return false;
  // Skip navigation/footer noise
  const noisePatterns = [
    '跨境头条', '跨境百科', '跨境报告', '跨境早报', '跨境快讯',
    '每日一店', '全球开店', '查测评', '骗子曝光', '跟卖曝光',
    '找服务', '找物流', '找海外仓', '找活动', '看直播', '工具箱',
    '关于我们', '跨境标签', '友情链接', '免责声明', '用户反馈',
    '投稿爆料', '专栏作者', '联系我们', '商务合作', '工厂入驻',
    '卖家社群', 'Copyright', '闽ICP', '闽公网安备', '视频号',
    '立即报名', '了解更多', '立即预约', '返回首页', '本站法律',
    '物流属性', '专线小包', '揽货范围', '海运整柜', '热门推荐',
    'Item ', '广告', 'AMZ123', 'DNY123', 'TT123',
  ];
  for (var n = 0; n < noisePatterns.length; n++) {
    if (name.includes(noisePatterns[n])) return false;
  }
  // Check if it matches logistics keywords
  for (var k = 0; k < LOGISTICS_KEYWORDS.length; k++) {
    if (name.includes(LOGISTICS_KEYWORDS[k])) return true;
  }
  return false;
}

// ─── Fuzzy Deduplication ────────────────────────────────────────────
// Normalize tool names for comparison
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[\uff08\uff09\(\)\[\]\[\]\{\}\s]+/g, '')   // remove brackets/spaces
    .replace(/[（）\[\]]/g, '')                              // Chinese brackets
    .replace(/\s+/g, '')                                     // all whitespace
    .trim();
}

// Fuzzy match: check if two names refer to the same tool
function isDuplicate(nameA, nameB, urlA, urlB) {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  // Exact normalized match
  if (normA === normB) return true;

  // One is substring of the other (e.g., "卖家精灵" vs "卖家精灵SellerSprite")
  if (normA.includes(normB) || normB.includes(normA)) {
    // Only consider duplicate if they share significant content
    const shorter = normA.length < normB.length ? normA : normB;
    if (shorter.length >= 4) return true; // min 4 chars to avoid false positives
  }

  // Same domain = same tool
  if (urlA && urlB) {
    try {
      const domainA = new URL(urlA).hostname.replace(/^www\./, '');
      const domainB = new URL(urlB).hostname.replace(/^www\./, '');
      if (domainA === domainB && domainA.length > 3) return true;
    } catch (e) {}
  }

  return false;
}

// Merge duplicate entries: keep the one with richer data
function mergeDuplicates(tools) {
  const merged = [];
  const used = new Set();

  for (let i = 0; i < tools.length; i++) {
    if (used.has(i)) continue;

    let best = { ...tools[i] };
    for (let j = i + 1; j < tools.length; j++) {
      if (used.has(j)) continue;
      if (isDuplicate(tools[i].name, tools[j].name, tools[i].url, tools[j].url)) {
        used.add(j);
        // Keep the entry with longer description
        if ((tools[j].description || '').length > (best.description || '').length) {
          best = { ...tools[j] };
        }
        // Merge source sites
        if (best.sourceSite !== tools[j].sourceSite) {
          best.sourceSite = (best.sourceSite || '') + ' + ' + (tools[j].sourceSite || '');
        }
        log(`去重合并: "${tools[j].name}" → "${tools[i].name}"`, 'DEDUP');
      }
    }

    used.add(i);
    // Pick the most informative name (prefer name with English in brackets)
    const origName = tools[i].name;
    const mergedName = tools.find((t, idx) => !used.has(idx) === false && isDuplicate(origName, t.name, tools[i].url, t.url))?.name;
    if (mergedName && mergedName.length > best.name.length) {
      best.name = mergedName;
    }
    merged.push(best);
  }

  return merged;
}

// ─── AI Knowledge Base ──────────────────────────────────────────────
// Pre-built enrichment for cross-border logistics providers
const LOGISTICS_KNOWLEDGE = {
  // SE Asia Logistics
  'Ninja Van 能者物流': {
    aliases: 'Ninja Van / 能者', rating: 'S',
    officialUrl: 'https://www.ninjavan.co',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚版顺丰+菜鸟网络',
    suitableFor: '做Shopee/Lazada/TikTok Shop东南亚全站点卖家，需要末端派送+海外仓+跨境干线的全链路服务',
    tips: 'Ninja Van在东南亚市占率前三，覆盖马来、新加坡、菲律宾、印尼、泰国、越南。末端派送时效3-5天，比J&T稍贵但丢件率低30%。注意：印尼和越南站点需要先申请企业账号才能对接API，个人卖家只能用COD模式。',
  },
  '大境物流': {
    aliases: '大境 / Dajing Logistics', rating: 'A',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚专线的德邦物流',
    suitableFor: '做印尼/马来/菲律宾/越南/泰国五国专线的卖家，适合有大批量海运/陆运需求的中小卖家',
    tips: '大境深耕东南亚物流十年以上，海陆运拼柜和整柜是强项。拼柜适合3CBM以下的中小卖家，整柜适合月出货量超50CBM的大卖家。时效：海运12-18天，陆运5-8天。建议首次合作先发小批量测试清关能力。',
  },
  '轻舟物流': {
    aliases: '轻舟 / QZ Express', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '类似东南亚版的安能物流',
    suitableFor: '需要自主装柜、整柜拆派的东南亚物流用户，适合批量发货的卖家',
    tips: '轻舟优势是自主装柜和整柜拆派，时效比同行快1-2天。适合月出货量稳定的卖家，零散发货性价比不高。建议凑够10CBM再走整柜。',
  },
  '星越供应链': {
    aliases: '星越 / 喜运达', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚线的三通一达',
    suitableFor: '东南亚多站点发货的中小卖家',
    tips: '星越的东南亚物流口号是"就用喜运达"，性价比路线。时效中等，价格偏低。适合对时效要求不高但追求成本控制的铺货型卖家。',
  },
  '智鸟供应链': {
    aliases: '智鸟', rating: 'A',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于印尼专线的顺丰',
    suitableFor: '专注印尼市场的卖家，适合需要稳定印尼专线时效的品牌卖家',
    tips: '智鸟的印尼专线是其核心优势，选择智鸟更省心。时效8-12天，清关能力强。印尼市场海关政策变动频繁，建议选择有自营清关团队的物流商。',
  },
  '佳灵物流': {
    aliases: '佳灵', rating: 'A',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚版的中通国际',
    suitableFor: '菲律宾/印尼专线卖家，需要一站式仓储+海运/空运+门到门配送的卖家',
    tips: '佳灵专注菲律宾/印尼专线16年，提供一站式国际仓储、海/空运及门到门配送。16年老牌物流商，清关能力稳定。首次合作建议先走空运小批量测试。',
  },
  '赛瑞达国际物流': {
    aliases: '赛瑞达', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '类似东南亚专线的圆通国际',
    suitableFor: '需要东南亚多国专线服务的卖家',
    tips: '赛瑞达定位"东南亚专线专家"，多国覆盖但深度不如佳灵和智鸟。适合需要同时发多个东南亚站点的卖家。',
  },
  '巨豹物流': {
    aliases: '巨豹', rating: 'A',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚版的京东物流',
    suitableFor: '越南/印尼专线卖家，追求时效的卖家',
    tips: '巨豹印尼专线8-15天、越南专线3-5天，时效在同行中属于上游。越南3-5天非常快，适合急件和高价值商品。价格偏高但时效稳定。',
  },
  '润泰国际供应链': {
    aliases: '润泰', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚版的百世物流',
    suitableFor: '需要泰国/马来/菲律宾物流+海外仓一站式服务的卖家',
    tips: '润泰提供泰马菲物流海外仓一站式服务。海外仓一件代发是强项，适合已在东南亚有稳定销量、需要本地仓配一体的卖家。',
  },
  '泉龙商通国际物流': {
    aliases: '泉龙 / 中泰专线大庄', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于泰国专线的韵达',
    suitableFor: '专注泰国市场的卖家',
    tips: '泉龙主打中泰专线，泰国市场市占率不错。时效7-10天，价格中等。泰国海关对化妆品和食品类目查验率高，发货前务必确认产品合规性。',
  },
  '八戒物流': {
    aliases: '八戒', rating: 'B',
    officialUrl: '',
    category: '东南亚物流',
    domesticAnalog: '相当于东南亚版的极兔快递',
    suitableFor: '东南亚多站点铺货卖家',
    tips: '八戒物流口号"东南亚物流，我只选八戒"，走性价比路线。末端派送覆盖广但时效波动较大。适合对价格敏感、对时效要求不高的卖家。',
  },
  '货憨憨台湾物流': {
    aliases: '货憨憨', rating: 'A',
    officialUrl: '',
    category: '台湾物流',
    domesticAnalog: '相当于台湾版的菜鸟+顺丰',
    suitableFor: '做台湾市场的卖家，需要云仓一件代发+WMS自打包上门收货的卖家',
    tips: '货憨憨提供台湾物流全链路解决方案，云仓一件代发+WMS自打包上门收货。台湾市场消费者偏好与大陆接近，物流时效3-5天，COD签收率85%+。注意台湾对大陆商品有配额限制。',
  },

  // FBA Head / Overseas Warehouse
  '云途物流': {
    aliases: '云途 / YunExpress', rating: 'S',
    officialUrl: 'https://www.yunexpress.com',
    category: 'FBA头程',
    domesticAnalog: '相当于跨境物流界的顺丰国际',
    suitableFor: '欧美专线卖家，需要做FBA头程和独立站直邮的中大型卖家',
    tips: '云途是国内头部的跨境物流商，欧美专线时效稳定（美国7-12天，欧洲8-15天）。价格中等偏上但时效和妥投率有保障。注意：云途对带电产品（含锂电池）有严格限制，发货前需确认。',
  },
  '联宇物流': {
    aliases: '联宇', rating: 'A',
    officialUrl: 'https://www.lianyulogistics.com',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA头程的德邦',
    suitableFor: '专注FBA头程+一件代发的卖家，适合亚马逊美国/欧洲站的中大型卖家',
    tips: '联宇专注FBA头程和一件代发一站式服务，在美国有自营海外仓。FBA头程时效：海运美西18-25天，空运7-10天。旺季（9-12月）建议提前4周备货。',
  },
  '纽酷国际物流': {
    aliases: '纽酷 / Niche', rating: 'A',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于美加欧专线的中通国际',
    suitableFor: '美国/加拿大/欧洲一站式跨境物流需求，适合多站点布局的亚马逊卖家',
    tips: '纽酷提供美国|加拿大|欧洲一站式服务。加拿大站点的清关能力是其优势（很多物流商在加拿大清关容易被卡）。FBA入仓时效稳定，旺季不排仓。',
  },
  '大森林物流': {
    aliases: '大森林 / Great Forest', rating: 'S',
    officialUrl: 'https://www.greatforests.com.cn',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA头程的京东物流',
    suitableFor: '亚马逊FBA头程、整柜散货、目的地清关派送、海外仓全链路需求的卖家',
    tips: '大森林是老牌FBA头程物流商，专注亚马逊FBA头程、整柜散货、目的地清关派送、海外仓一条龙。整柜价格有优势，适合月出货量超100CBM的大卖家。自营海外仓在美西/美东/欧洲都有布局。',
  },
  '众包物流': {
    aliases: '众包', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '类似FBA头程的百世快运',
    suitableFor: '美国/加拿大/欧洲/巴西全链路物流服务需求的卖家',
    tips: '众包物流覆盖美国、加拿大、欧洲、巴西，全链路服务。巴西站点的清关能力是其差异化优势（巴西海关极难搞）。建议巴西发货选择众包。',
  },
  '豪速通物流': {
    aliases: '豪速通', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA头程的申通国际',
    suitableFor: '欧美专线、FBA头程+海外仓全链路一站式服务的卖家',
    tips: '豪速通专注欧美专线和FBA头程+海外仓，旺季发货时效稳定。性价比路线，适合对价格敏感但需要稳定服务的中小卖家。',
  },
  '枫筝加拿大海外仓': {
    aliases: '枫筝', rating: 'A',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于加拿大专线的菜鸟海外仓',
    suitableFor: '专注加拿大市场、需要加拿大本地一件代发的卖家',
    tips: '枫筝专注加拿大海外仓一件代发，加拿大本地华人运营，沟通方便。一件代发时效2-5天妥投加拿大全境。适合TikTok Shop加拿大站和亚马逊加拿大站的卖家。',
  },
  'Concord康可海外仓': {
    aliases: '康可 / Concord', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于欧美海外仓的菜鸟驿站升级版',
    suitableFor: '需要欧美海外仓一件代发、头程物流+退货换标的卖家',
    tips: '康可是华人自营海外仓，24小时出单号，1-3个工作日妥投。头程物流+一件代发+电商平台退货全链路。退货换标是强项，适合需要处理亚马逊退货的卖家。',
  },
  'Locad海外仓': {
    aliases: 'Locad', rating: 'A',
    officialUrl: 'https://www.locad.com',
    category: '海外仓',
    domesticAnalog: '相当于东南亚版的菜鸟国际仓',
    suitableFor: '东南亚市场中小件卖家，需要新加坡/马来/澳洲本地仓配一体服务的卖家',
    tips: 'Locad来自新加坡，专注中小件本地化海外仓。系统API对接完善，适合有技术能力的卖家。仓储费按体积计费，中小件（<5kg）性价比最高。',
  },
  '鑫远洋海外仓': {
    aliases: '鑫远洋', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于墨加欧英美版的万邑通',
    suitableFor: '墨西哥/加拿大/欧洲/美国/英国多市场海外仓需求的卖家',
    tips: '鑫远洋聚焦墨加欧英美海外仓，提供一站式供应链解决方案。墨西哥海外仓是其差异化优势（很多物流商不做墨西哥）。适合Temu和Shopee拉美站的卖家。',
  },

  // Canada logistics
  '嘀嗒嘀物流科技': {
    aliases: '嘀嗒嘀', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA头程的宅急送',
    suitableFor: '需要FBA头程+海外仓一件代发的卖家',
    tips: '嘀嗒嘀16年深耕FBA头程和海外仓一件代发，老牌物流商。一件代发时效稳定，适合稳定的补货需求。',
  },
  '鑫远洋国际物流': {
    aliases: '鑫远洋', rating: 'A',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于墨西哥专线的顺丰',
    suitableFor: '墨西哥出口物流+墨西哥海外仓一件代发',
    tips: '鑫远洋主营墨西哥出口物流和墨西哥海外仓一件代发。墨西哥市场是Temu和Shopee拉美站的增长点，鑫远洋在墨西哥本地有仓储和清关团队。',
  },
  '深圳市中南通达国际物流': {
    aliases: '中南通达', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于美加专线的德邦',
    suitableFor: '美国/加拿大海空运FBA头程，自营美加海外仓一件代发',
    tips: '中南通达专注美加海空运FBA头程，自营美加海外仓一件代发。加拿大站点自营仓是其优势，适合加拿大站卖家。',
  },
  '云捷速达国际物流': {
    aliases: '云捷速达', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA物流的空派专家',
    suitableFor: '需要FBA空派/海派/海卡专线的卖家',
    tips: '云捷速达专注FBA空派海派专线、海卡专线。空派时效快但贵，海派性价比高。建议根据货值和紧急程度选择。',
  },
  '德展物流': {
    aliases: '德展', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于欧洲专线的顺丰',
    suitableFor: '欧洲FBA头程物流需求的卖家',
    tips: '德展物流专注欧洲FBA头程，欧洲VAT代缴是其附加服务。注意欧洲各国VAT税率不同，德国19%、法国20%，发货前确认税务合规。',
  },
  '安君国际供应链': {
    aliases: '安君', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于跨境物流界的安能',
    suitableFor: '需要FBA头程+海外仓全链路的卖家',
    tips: '安君国际供应链提供FBA头程+海外仓服务，覆盖欧美主要市场。',
  },
  '卓世全球供应链': {
    aliases: '卓世', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于全球版的百世快运',
    suitableFor: '需要全球多站点物流覆盖的卖家',
    tips: '卓世全球供应链覆盖范围广，适合需要同时发多个大洲的卖家。',
  },
  '德速电商物流': {
    aliases: '德速', rating: 'B',
    officialUrl: '',
    category: 'FBA头程',
    domesticAnalog: '相当于FBA物流的快捷通',
    suitableFor: '需要FBA物流空派/海派专线的卖家',
    tips: '德速专注FBA物流空派海派专线，自营美国海外仓。空派时效7-10天，海派18-25天。',
  },
  '海云汇海外仓': {
    aliases: '海云汇', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于跨境电商的顺丰仓储',
    suitableFor: '需要跨境电商海外仓储服务的卖家',
    tips: '海云汇专注跨境电商海外仓储，提供高效可靠服务。仓储费合理，出入库效率高。',
  },
  '美信海外仓': {
    aliases: '美信', rating: 'A',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于北美版的菜鸟海外仓',
    suitableFor: '美国/欧洲/加拿大/墨西哥/巴西一件代发、仓储需求的卖家',
    tips: '美信覆盖美国、欧洲、加拿大、墨西哥、巴西，一件代发、仓储、卡车全链路。尾端优势一手账号，特有美国本土自动化POD生产服装货盘。适合服装类目卖家。',
  },
  'SGR北美海外仓': {
    aliases: 'SGR', rating: 'A',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于北美版的万邑通',
    suitableFor: '专注北美仓储物流的卖家',
    tips: 'SGR专注北美仓储物流30年，安全高效低成本。30年老牌，稳定性极高。适合对安全性要求高的中大卖家。',
  },
  'HAOYO海外仓': {
    aliases: 'HAOYO', rating: 'A',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于美国版的京东仓储',
    suitableFor: '美国海外仓一件代发、头程+仓储+尾程全链路需求的卖家',
    tips: 'HAOYO专注美国海外仓一件代发，拥有头程+仓储+尾程物流全链路服务。多平台合作仓，适合亚马逊+TikTok+Temu多平台卖家。',
  },
  '马丁海外仓': {
    aliases: '马丁', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于欧美版的极兔仓储',
    suitableFor: '需要欧美海外仓中小件一件代发的卖家',
    tips: '马丁自营欧美海外仓，专注中小件，价格优势明显。对接简单高效，适合新手卖家。',
  },
  '超卖海外仓': {
    aliases: '超卖', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于中美物流的TikTok官方仓',
    suitableFor: 'TikTok卖家、中小件中美物流全链路需求',
    tips: '超卖专注中小件中美物流全链路，TIKTOK金牌服务商。适合TikTok Shop美国站的卖家。',
  },
  '宝通达海外仓': {
    aliases: '宝通达', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于海外仓界的德邦',
    suitableFor: '需要海外仓一件代发和大货中转的卖家',
    tips: '宝通达提供海外仓一件代发和大货中转服务，全链路降本增效。适合大件商品的卖家。',
  },
  '三泊路海外仓': {
    aliases: '三泊路', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于北美版的顺丰仓储',
    suitableFor: '需要北美海外仓服务的卖家',
    tips: '三泊路专注北美海外仓服务，覆盖美加市场。',
  },
  '邑通达海外仓': {
    aliases: '邑通达', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于欧美日加澳版的菜鸟仓',
    suitableFor: '需要欧美日加澳多地区一件代发/FBA退货换标的卖家',
    tips: '邑通达专注欧美日加澳TEMU、TikTok一件代发、FBA退货换标/中转补仓。FBA退货换标是强项，适合亚马逊退货率较高的卖家。',
  },
  'Octopia欧洲海外仓': {
    aliases: 'Octopia', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于欧洲版的京东物流',
    suitableFor: '需要欧洲海外仓服务的卖家',
    tips: 'Octopia专注欧洲海外仓，覆盖欧洲主要国家。适合欧洲站卖家。',
  },
  '达派思供应链': {
    aliases: '达派思', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于跨境版的顺丰仓配',
    suitableFor: '需要头程物流+一件代发的卖家',
    tips: '达派思供应链提供头程物流+一件代发服务。',
  },
  // FBA Head logistics
  '世盖易海外仓': {
    aliases: '世盖易', rating: 'B',
    officialUrl: '',
    category: '海外仓',
    domesticAnalog: '相当于海外仓界的中通',
    suitableFor: '需要海外仓一件代发和大货中转的卖家',
    tips: '世盖易提供海外仓一件代发、大货中转，全链路服务降本增效稳交付。',
  },
};

// Payment tools from previous run
const PAYMENT_KNOWLEDGE = {
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
    tips: 'P卡是老牌收款工具，支持平台最多。费率约1.2%，比连连和万里汇稍高但胜在平台覆盖广。注意：P卡年费19.95美元/年，不活跃的账户会被扣费。',
  },
  '腾讯智汇鹅': {
    aliases: '智汇鹅', rating: 'A',
    officialUrl: 'https://www.zhihuie.com',
    category: '金融收款',
    domesticAnalog: '相当于腾讯官方的跨境收款',
    suitableFor: '亚马逊等主流平台卖家，适合信任腾讯品牌的中大型卖家',
    tips: '腾讯自营的跨境收款服务，费率千三封顶。优势是腾讯品牌背书，资金安全有保障。',
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
    aliases: '网易支付', rating: 'B',
    officialUrl: 'https://crossborder.pay.163.com',
    category: '金融收款',
    domesticAnalog: '相当于网易版的跨境收款',
    suitableFor: '网易生态卖家，适合已在网易跨境电商生态中的卖家',
    tips: '网易支付在跨境收款领域入局较晚，但有网易品牌背书。注册可享特惠费率。',
  },
  '汇丰银行': {
    aliases: 'HSBC', rating: 'A',
    officialUrl: 'https://www.hsbc.com.cn',
    category: '金融收款',
    domesticAnalog: '相当于跨境版工商银行',
    suitableFor: '大卖家和品牌卖家，适合年GMV超500万美金的企业',
    tips: '汇丰0开户0费率，与跨境电商平台直连。但开户门槛较高，需要企业营业执照和一定规模的流水。',
  },
  'Skyee 跨境收付': {
    aliases: 'Skyee', rating: 'B',
    officialUrl: 'https://www.skyee.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版的小额支付平台',
    suitableFor: '中小跨境电商卖家，适合追求低费率的卖家',
    tips: '费率0.2%封顶非常有竞争力，注册享90天0费率体验。',
  },
  '丰泊国际': {
    aliases: 'FundPark', rating: 'B',
    officialUrl: 'https://www.fundpark.com',
    category: '金融收款',
    domesticAnalog: '相当于跨境版的小微贷款平台',
    suitableFor: '需要资金周转的电商卖家',
    tips: 'FundPark专注电商中小企业融资，利用创新金融科技提供一站式融资解决方案。',
  },
  // TikTok analytics
  'FastMoss': {
    aliases: '飞书数据 / FastM', rating: 'A',
    officialUrl: 'https://www.fastmoss.com',
    category: 'TikTok数据分析',
    domesticAnalog: '相当于TikTok版的蝉妈妈',
    suitableFor: 'TikTok Shop卖家和达人',
    tips: 'FastMoss的达人数据有延迟，热门达人可能已经换品。重点看近7天带货GMV而非总GMV。',
  },
  'EchoTik': {
    aliases: '回音', rating: 'A',
    officialUrl: 'https://echotik.live',
    category: 'TikTok数据分析',
    domesticAnalog: '类似TikTok版的飞瓜数据',
    suitableFor: 'TikTok Shop运营',
    tips: 'EchoTik的直播实时监控功能很强。重点看分享率而非点赞数。',
  },
  'PiPiADS': {
    aliases: 'PiPi', rating: 'S',
    officialUrl: 'https://www.pipiads.com',
    category: 'TikTok数据分析',
    domesticAnalog: '相当于TikTok版的AppGrowing',
    suitableFor: 'TikTok广告投放手',
    tips: 'PiPiADS能扒到竞品正在跑的广告素材。别直接搬运，必须重新拍摄或混剪。',
  },
  // Platforms
  'Shopee': {
    aliases: '虾皮', rating: 'S',
    officialUrl: 'https://shopee.com',
    category: '电商平台',
    domesticAnalog: '相当于东南亚版淘宝+拼多多',
    suitableFor: '东南亚市场新手卖家',
    tips: 'Shopee各站点政策差异大。马来站和新加坡站利润最高，菲律宾站退货率最高。',
  },
  'Lazada': {
    aliases: '来赞达', rating: 'A',
    officialUrl: 'https://www.lazada.com',
    category: '电商平台',
    domesticAnalog: '相当于东南亚版天猫',
    suitableFor: '有一定供应链优势的卖家',
    tips: 'Lazada对品牌卖家更友好。建议先在LazMall申请品牌认证。',
  },
  'TikTok Shop': {
    aliases: 'TTS / 抖店海外版', rating: 'S',
    officialUrl: 'https://www.tiktok.com/shop',
    category: '电商平台',
    domesticAnalog: '相当于抖音小店的海外版本',
    suitableFor: '擅长内容创作和直播的卖家',
    tips: 'TikTok Shop流量极度依赖短视频和直播。别在视频里硬广，种草内容转化率高3倍。',
  },
  'Coupang': {
    aliases: '酷澎 / 韩国亚马逊', rating: 'A',
    officialUrl: 'https://www.coupang.com',
    category: '电商平台',
    domesticAnalog: '相当于韩国版京东',
    suitableFor: '想进入韩国市场的卖家',
    tips: '韩国消费者对品质要求极高。必须做KC认证（电子产品）和韩语包装。',
  },
  // Amazon tools
  '卖家精灵': {
    aliases: 'SellerSprite', rating: 'A',
    officialUrl: 'https://www.sellersprite.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于国内电商的选品大师',
    suitableFor: '中国跨境卖家，中文界面友好',
    tips: '数据更新频率比JS略慢，建议旺季前提前锁定目标产品。',
  },
  'Jungle Scout': {
    aliases: 'JS / 金狗', rating: 'S',
    officialUrl: 'https://www.junglescout.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于跨境电商界的生意参谋',
    suitableFor: '亚马逊美国/欧洲站卖家',
    tips: 'JS数据有2-4周延迟，不要完全依赖其销量预估做决策。',
  },
  'Helium 10': {
    aliases: 'H10 / 氦10', rating: 'S',
    officialUrl: 'https://www.helium10.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于生意参谋+直通车+评价管理三合一',
    suitableFor: '亚马逊全站点卖家',
    tips: '建议先精通Cerebro和Magnet两个核心工具。',
  },
  'Keepa': {
    aliases: 'Keepa插件 / 价格追踪器', rating: 'S',
    officialUrl: 'https://keepa.com',
    category: '亚马逊运营',
    domesticAnalog: '相当于历史价格查询器+库存监控',
    suitableFor: '所有亚马逊卖家',
    tips: 'Keepa的免费版已经够用核心功能，付费版主要多库存追踪。',
  },
};

// Merge all knowledge bases
const ALL_KNOWLEDGE = { ...LOGISTICS_KNOWLEDGE, ...PAYMENT_KNOWLEDGE };

// ─── Scraping Functions ─────────────────────────────────────────────
async function scrapeAMZ123Wuliu(browser) {
  log('正在抓取 AMZ123 物流板块 ...', 'SCRAPE');
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.amz123.com/wuliu', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await randomSleep(5000, 8000);

    const tools = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 3 && l.length < 200);
      const results = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        // Skip headers and navigation
        if (['找物流', '找海外仓', '找服务', '物流属性', '专线小包', '查看更多', '立即报名', '了解更多', '看直播', '工具箱'].includes(line)) {
          i++; continue;
        }
        if (line.includes('AMZ123') || line.includes('闽ICP') || line.includes('版权') || line.includes('公众号')) {
          i++; continue;
        }
        // If next line is a description
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine.length > 10 && nextLine.length < 300 &&
              !['找物流', '找海外仓', '找服务', '物流属性', '专线小包', '查看更多', '立即报名', '了解更多'].includes(nextLine)) {
            results.push({ name: line, description: nextLine.substring(0, 200), sourceSite: 'AMZ123物流' });
            i += 2;
            continue;
          }
        }
        // Standalone name (no description found)
        if (line.length < 40 && line.length > 3) {
          results.push({ name: line, description: '', sourceSite: 'AMZ123物流' });
        }
        i++;
      }
      return results;
    });

    log('AMZ123物流: 提取到 ' + tools.length + ' 个物流服务商', 'SCRAPE');
    return tools;
  } catch (err) {
    log('AMZ123物流抓取失败: ' + err.message, 'ERROR');
    return [];
  } finally {
    await ctx.close();
  }
}

async function scrapeAMZ123Haiwaicang(browser) {
  log('正在抓取 AMZ123 海外仓板块 ...', 'SCRAPE');
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.amz123.com/haiwaicang', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await randomSleep(5000, 8000);

    const tools = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 3 && l.length < 200);
      const results = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (['找物流', '找海外仓', '找服务', '物流属性', '专线小包', '查看更多', '立即报名', '了解更多', '看直播', '工具箱'].includes(line)) {
          i++; continue;
        }
        if (line.includes('AMZ123') || line.includes('闽ICP') || line.includes('版权') || line.includes('公众号')) {
          i++; continue;
        }
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine.length > 10 && nextLine.length < 300 &&
              !['找物流', '找海外仓', '找服务', '物流属性', '专线小包', '查看更多', '立即报名', '了解更多'].includes(nextLine)) {
            results.push({ name: line, description: nextLine.substring(0, 200), sourceSite: 'AMZ123海外仓' });
            i += 2;
            continue;
          }
        }
        if (line.length < 40 && line.length > 3) {
          results.push({ name: line, description: '', sourceSite: 'AMZ123海外仓' });
        }
        i++;
      }
      return results;
    });

    log('AMZ123海外仓: 提取到 ' + tools.length + ' 个海外仓服务商', 'SCRAPE');
    return tools;
  } catch (err) {
    log('AMZ123海外仓抓取失败: ' + err.message, 'ERROR');
    return [];
  } finally {
    await ctx.close();
  }
}

async function scrapeDNY123Wuliu(browser) {
  log('正在抓取 DNY123 东南亚物流板块 ...', 'SCRAPE');
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.dny123.com/wuliu', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await randomSleep(5000, 8000);

    const tools = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 3 && l.length < 200);
      const results = [];
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        if (line.includes('找物流') || line.includes('找海外仓') || line.includes('物流属性') || line.includes('专线小包') || line.includes('查看更多') || line.includes('立即报名') || line.includes('了解更多')) {
          i++; continue;
        }
        if (line.includes('DNY123') || line.includes('AMZ123') || line.includes('闽ICP') || line.includes('版权') || line.includes('公众号')) {
          i++; continue;
        }
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine.length > 10 && nextLine.length < 300) {
            results.push({ name: line, description: nextLine.substring(0, 200), sourceSite: 'DNY123物流' });
            i += 2;
            continue;
          }
        }
        if (line.length < 40 && line.length > 3) {
          results.push({ name: line, description: '', sourceSite: 'DNY123物流' });
        }
        i++;
      }
      return results;
    });

    log('DNY123物流: 提取到 ' + tools.length + ' 个物流服务商', 'SCRAPE');
    return tools;
  } catch (err) {
    log('DNY123物流抓取失败: ' + err.message, 'ERROR');
    return [];
  } finally {
    await ctx.close();
  }
}

// ─── AI Enrichment ──────────────────────────────────────────────────
function enrichTool(tool) {
  const knownNames = Object.keys(ALL_KNOWLEDGE);
  let matched = null;

  for (const name of knownNames) {
    if (isDuplicate(name, tool.name, ALL_KNOWLEDGE[name].officialUrl, tool.url)) {
      matched = { name: name, knowledge: ALL_KNOWLEDGE[name] };
      break;
    }
  }

  if (matched) {
    const k = matched.knowledge;
    const url = tool.description ? (ALL_KNOWLEDGE[matched.name].officialUrl || '') : '';
    const description = '[别名] ' + k.aliases +
      '\n[评级] ' + k.rating + '级' +
      '\n[国内类比] ' + k.domesticAnalog +
      '\n[适合人群] ' + k.suitableFor +
      '\n[新手避坑] ' + k.tips;

    return {
      name: matched.name,
      url: url,
      description: description,
      category: 'business',
      tags: [k.rating + '级工具', getCategoryTags(k.category)],
      sourceType: 'third-party',
      usage: '新手建议：' + k.tips.split('\u3002')[0],
      disclaimer: k.domesticAnalog + '\u3002数据仅供参考，使用前请核实最新政策\u3002',
    };
  }

  // Unmatched tool - use basic enrichment
  log('未匹配知识库: ' + tool.name + '，使用基础富化', 'ENRICH');
  return {
    name: tool.name,
    url: '',
    description: tool.description || '跨境物流服务商，提供专业跨境物流解决方案。',
    category: 'business',
    tags: ['物流服务商'],
    sourceType: 'third-party',
    usage: '',
    disclaimer: '数据仅供参考，使用前请核实最新政策。',
  };
}

function getCategoryTags(category) {
  const tagMap = {
    '东南亚物流': '东南亚物流',
    '台湾物流': '台湾物流',
    'FBA头程': 'FBA头程',
    '海外仓': '海外仓',
    '金融收款': '跨境支付',
    'TikTok数据分析': 'TikTok工具',
    '电商平台': '电商平台',
    '亚马逊运营': '亚马逊工具',
  };
  return tagMap[category] || '跨境电商';
}

// ─── Topic Chunking ─────────────────────────────────────────────────
const MAX_PER_TOPIC = 20; // Hard limit per topic

function chunkByCategory(resources) {
  // Group by sub-category
  const groups = {};
  resources.forEach(function(r) {
    // Extract sub-category from tags
    const subCat = r.tags[1] || '其他';
    if (!groups[subCat]) groups[subCat] = [];
    groups[subCat].push(r);
  });

  const topics = [];
  const overflow = [];

  Object.keys(groups).forEach(function(subCat) {
    const items = groups[subCat];
    // Sort by rating (S > A > B > C)
    const ratingOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
    items.sort(function(a, b) {
      const ra = a.tags[0] ? a.tags[0].charAt(0) : 'B';
      const rb = b.tags[0] ? b.tags[0].charAt(0) : 'B';
      return (ratingOrder[ra] || 2) - (ratingOrder[rb] || 2);
    });

    if (items.length <= MAX_PER_TOPIC) {
      topics.push({ category: subCat, items: items });
    } else {
      topics.push({ category: subCat, items: items.slice(0, MAX_PER_TOPIC) });
      overflow.push(...items.slice(MAX_PER_TOPIC));
    }
  });

  return { topics: topics, overflow: overflow };
}

// ─── Authentication ─────────────────────────────────────────────────
function parseSetCookies(setCookieHeader) {
  if (!setCookieHeader) return [];
  // Split on ', ' but not on ', ' that's part of a date (e.g., 'Sun, 21 Jun')
  var cookies = [];
  var parts = setCookieHeader.split(/, (?=[^0-9])/);
  for (var i = 0; i < parts.length; i++) {
    var cookie = parts[i].split(';')[0].trim();
    if (cookie && cookie.includes('=')) {
      cookies.push(cookie);
    }
  }
  return cookies;
}

async function getAdminCookies() {
  log('正在获取管理员Session ...', 'AUTH');

  var csrfRes = await fetch('https://jueshi.net/api/auth/csrf', {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  var csrfData = await csrfRes.json();
  var csrfToken = csrfData.csrfToken;
  var csrfCookies = parseSetCookies(csrfRes.headers.get('set-cookie'));

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

  var loginCookies = parseSetCookies(loginRes.headers.get('set-cookie'));
  var allCookies = csrfCookies.concat(loginCookies).join('; ');

  // Verify session
  var sessionRes = await fetch('https://jueshi.net/api/auth/session', {
    headers: { 'Cookie': allCookies },
  });
  var sessionData = await sessionRes.json();

  if (sessionData && sessionData.user && sessionData.user.role === 'admin') {
    log('管理员认证成功: ' + sessionData.user.email, 'AUTH');
    return allCookies;
  }

  log('认证失败: ' + JSON.stringify(sessionData).substring(0, 100), 'ERROR');
  return null;
}

// ─── API Submission ─────────────────────────────────────────────────
async function postToAPI(cookies, payload) {
  var importRes = await fetch('https://jueshi.net/api/admin/resources/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies,
    },
    body: JSON.stringify(payload),
  });

  var importData = await importRes.json();

  if (importRes.ok) {
    log('导入成功: ' + importData.imported + ' 条 (新增 ' + (importData.details ? importData.details.created : 0) + ', 更新 ' + (importData.details ? importData.details.updated : 0) + ')', 'API');
    if (importData.topicId) {
      log('专题ID: ' + importData.topicId, 'API');
    }
    return importData;
  } else {
    log('导入失败 (' + importRes.status + '): ' + JSON.stringify(importData).substring(0, 200), 'ERROR');
    return null;
  }
}

// ─── Fetch existing resources for dedup ─────────────────────────────
async function fetchExistingResources(cookies) {
  log('正在获取已有资源列表用于去重 ...', 'DEDUP');
  var res = await fetch('https://jueshi.net/api/resources?limit=1000', {
    headers: { 'Cookie': cookies },
  });
  var data = await res.json();
  var resources = data.resources || [];
  var existing = {};
  resources.forEach(function(r) {
    existing[normalizeName(r.name)] = r;
    if (r.url) {
      try {
        var domain = new URL(r.url).hostname.replace(/^www\./, '');
        existing[domain] = r;
      } catch(e) {}
    }
  });
  log('已有资源: ' + resources.length + ' 条', 'DEDUP');
  return existing;
}

// ─── Main Daemon Loop ───────────────────────────────────────────────
async function main() {
  log('=========================================', 'DAEMON');
  log('RPA V2 全量潜行收割 + 智能去重巡航 启动', 'DAEMON');
  log('=========================================', 'DAEMON');

  var browser = await chromium.launch({ headless: true });

  // Step 1: Scrape all logistics boards
  log('--- 阶段1: 潜行抓取 ---', 'DAEMON');
  var allRaw = [];

  var amzWuliu = await scrapeAMZ123Wuliu(browser);
  allRaw = allRaw.concat(amzWuliu);

  var amzHaiwai = await scrapeAMZ123Haiwaicang(browser);
  allRaw = allRaw.concat(amzHaiwai);

  var dnyWuliu = await scrapeDNY123Wuliu(browser);
  allRaw = allRaw.concat(dnyWuliu);

  log('原始抓取合计: ' + allRaw.length + ' 条', 'DAEMON');

  // Filter: keep only logistics-relevant items
  log('--- 阶段1.5: 噪声过滤 ---', 'DAEMON');
  var filtered = allRaw.filter(function(t) { return isLogisticsRelevant(t.name); });
  log('噪声过滤: ' + allRaw.length + ' → ' + filtered.length + ' 条 (剔除 ' + (allRaw.length - filtered.length) + ' 条噪声)', 'DAEMON');

  // Throttle pause after scraping
  log('抓取完成，强制休息 60 秒 ...', 'THROTTLE');
  await sleep(60000);

  // Step 2: Deduplication
  log('--- 阶段2: 模糊去重 ---', 'DAEMON');
  var deduped = mergeDuplicates(filtered);
  log('去重完成: ' + allRaw.length + ' → ' + deduped.length + ' 条 (合并 ' + (allRaw.length - deduped.length) + ' 条)', 'DAEMON');

  // Step 3: AI Enrichment (with throttling)
  log('--- 阶段3: AI 富化 ---', 'DAEMON');
  var enriched = [];
  var processedCount = 0;

  for (var i = 0; i < deduped.length; i++) {
    enriched.push(enrichTool(deduped[i]));
    processedCount++;

    // Throttle every 20 items
    if (processedCount % 20 === 0 && processedCount < deduped.length) {
      log('已富化 ' + processedCount + ' 条，强制休息 60 秒 ...', 'THROTTLE');
      await sleep(60000);
    }

    // Random sleep: short for unknown items, longer for known (matching KB)
    var knownNames = Object.keys(ALL_KNOWLEDGE);
    var isKnown = knownNames.some(function(name) {
      return isDuplicate(name, deduped[i].name, ALL_KNOWLEDGE[name].officialUrl, deduped[i].url);
    });
    if (isKnown) {
      await randomSleep(2000, 4000);
    } else {
      await sleep(Math.floor(Math.random() * 500) + 200); // 200-700ms for unknown
    }
  }

  log('AI 富化完成: ' + enriched.length + ' 条', 'DAEMON');

  // Step 4: Check existing resources for dedup against DB
  log('--- 阶段4: 数据库去重 ---', 'DAEMON');
  var cookies = await getAdminCookies();
  if (!cookies) {
    log('认证失败，终止流程', 'ERROR');
    await browser.close();
    return;
  }

  var existing = await fetchExistingResources(cookies);
  var newTools = [];
  var skippedTools = [];

  for (var j = 0; j < enriched.length; j++) {
    var tool = enriched[j];
    var normName = normalizeName(tool.name);
    var domain = '';
    try { domain = new URL(tool.url).hostname.replace(/^www\./, ''); } catch(e) {}

    if (existing[normName] || (domain && existing[domain])) {
      skippedTools.push(tool);
      log('跳过已存在: ' + tool.name, 'DEDUP');
    } else {
      newTools.push(tool);
    }
  }

  log('数据库去重完成: ' + enriched.length + ' → ' + newTools.length + ' 条新数据 (跳过 ' + skippedTools.length + ' 条)', 'DAEMON');

  if (newTools.length === 0) {
    log('无新数据需要导入，流程结束', 'DAEMON');
    await browser.close();
    return;
  }

  // Step 5: Topic Chunking
  log('--- 阶段5: 智能切割专题包 ---', 'DAEMON');
  var chunked = chunkByCategory(newTools);

  log('切割完成: ' + chunked.topics.length + ' 个专题包, ' + chunked.overflow.length + ' 条溢出数据', 'DAEMON');

  // Print topic plan
  for (var t = 0; t < chunked.topics.length; t++) {
    var topic = chunked.topics[t];
    log('专题包 [' + (t+1) + ']: ' + topic.category + ' (' + topic.items.length + ' 个工具)', 'PLAN');
    topic.items.slice(0, 5).forEach(function(item) {
      log('  - ' + item.name + ' [' + (item.tags[0] || '?') + ']', 'PLAN');
    });
    if (topic.items.length > 5) {
      log('  ... 还有 ' + (topic.items.length - 5) + ' 个', 'PLAN');
    }
  }

  if (chunked.overflow.length > 0) {
    log('溢出数据 (' + chunked.overflow.length + ' 条):', 'PLAN');
    chunked.overflow.forEach(function(item) {
      log('  - ' + item.name, 'PLAN');
    });
  }

  // Step 6: Submit each topic
  log('--- 阶段6: 批量入库 ---', 'DAEMON');

  for (var p = 0; p < chunked.topics.length; p++) {
    var topic = chunked.topics[p];
    var topicName = '2026出海必备：' + topic.category + ' S级工具避坑指南';
    var payload = {
      resources: topic.items,
      createTopic: true,
      topicName: topicName
    };

    log('正在提交专题: ' + topicName + ' (' + topic.items.length + ' 条)', 'API');
    var result = await postToAPI(cookies, payload);

    // Throttle between submissions
    if (p < chunked.topics.length - 1) {
      log('专题提交完成，休息 10 秒 ...', 'THROTTLE');
      await sleep(10000);
    }
  }

  // Step 7: Submit overflow as resources-only (no topic)
  if (chunked.overflow.length > 0) {
    log('正在提交溢出数据 (' + chunked.overflow.length + ' 条，不创建专题) ...', 'API');
    var overflowPayload = {
      resources: chunked.overflow,
      createTopic: false
    };
    await postToAPI(cookies, overflowPayload);
  }

  // Final summary
  log('=========================================', 'DAEMON');
  log('RPA V2 巡航完成', 'DAEMON');
  log('=========================================', 'DAEMON');
  log('原始抓取: ' + allRaw.length + ' 条', 'SUMMARY');
  log('去重后: ' + deduped.length + ' 条', 'SUMMARY');
  log('数据库去重后新数据: ' + newTools.length + ' 条', 'SUMMARY');
  log('专题包: ' + chunked.topics.length + ' 个', 'SUMMARY');
  log('溢出数据: ' + chunked.overflow.length + ' 条', 'SUMMARY');

  // Preview top 2 AI-enriched entries
  log('AI 精选展示:', 'SHOWCASE');
  enriched.slice(0, 2).forEach(function(item) {
    log('=== ' + item.name + ' ===', 'SHOWCASE');
    log(item.description.split('\n').join('\n     '), 'SHOWCASE');
  });

  await browser.close();
}

main().catch(function(err) {
  log('致命错误: ' + err.message, 'FATAL');
  process.exit(1);
});
