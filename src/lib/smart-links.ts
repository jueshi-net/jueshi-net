/**
 * Smart Interlinking Rules — Client-Safe
 * 
 * Generates contextual related links based on page metadata.
 * No fs/path/gray-matter dependencies — safe for client components.
 */

export interface RelatedLink {
  title: string;
  url: string;
  icon: string;
  description: string;
  tag?: string;
}

export function generateRelatedLinks(context: {
  tags?: string[];
  country?: string;
  tool?: string;
  scenario?: string;
  type: 'tool' | 'article' | 'destination';
}): RelatedLink[] {
  const links: RelatedLink[] = [];
  const seen = new Set<string>();

  const addLink = (link: RelatedLink) => {
    if (!seen.has(link.url)) {
      seen.add(link.url);
      links.push(link);
    }
  };

  const tags = context.tags || [];
  const country = (context.country || '').toUpperCase();

  // ── Country-based recommendations ──
  if (country) {
    const countryMap: Record<string, { links: RelatedLink[] }> = {
      US: {
        links: [
          { title: '🇺🇸 美国目的地全景向导', url: '/destinations/usa', icon: '🗽', description: '从纽约到洛杉矶，覆盖在美生活全场景' },
          { title: '📮 美国邮编查询直达', url: '/tools/postal-code?q=US', icon: '📮', description: '查询美国各州邮编格式' },
          { title: '💱 USD/CNY 实时汇率', url: '/tools/exchange-rate?from=USD&to=CNY&amount=1', icon: '💱', description: '美元兑人民币实时汇率换算' },
        ],
      },
      CA: {
        links: [
          { title: '🇨🇦 加拿大目的地向导', url: '/destinations/canada', icon: '🍁', description: '从多伦多到温哥华，加拿大生活指南' },
          { title: '📮 加拿大邮编查询', url: '/tools/postal-code?q=CA', icon: '📮', description: '加拿大 A1A 1A1 格式校验' },
        ],
      },
      GB: {
        links: [
          { title: '🇬🇧 英国目的地向导', url: '/destinations/uk', icon: '🎓', description: '伦敦、曼彻斯特、爱丁堡生活指南' },
          { title: '📮 英国邮编查询', url: '/tools/postal-code?q=GB', icon: '📮', description: '英国 SW1A 1AA 格式校验' },
        ],
      },
    };

    const countryInfo = countryMap[country];
    if (countryInfo) {
      countryInfo.links.forEach(link => addLink(link));
    }
  }

  // ── Tool-based cross-promotion ──
  if (context.tool) {
    const toolCrossLinks: Record<string, RelatedLink[]> = {
      'exchange-rate': [
        { title: '🇺🇸 美国目的地向导', url: '/destinations/usa', icon: '🗽', description: '了解美元使用场景与汇率趋势' },
        { title: '🧾 商业发票生成', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '跨境贸易结算必备单据' },
        { title: '📊 结汇精算指南', url: '/tools/exchange-rate', icon: '📊', description: '银行结汇汇率与中间价差异说明' },
      ],
      'postal-code': [
        { title: '📐 地址格式化工具', url: '/tools/address-formatter', icon: '📝', description: '标准化国际地址格式' },
        { title: '📥 集运入库标签', url: '/tools/documents/inbound-label', icon: '📥', description: '集运仓入库标签打印' },
        { title: '🗺️ 全球邮编查询', url: '/tools/postal-code', icon: '🗺️', description: '覆盖 50+ 国家邮编数据' },
      ],
      'proforma-invoice': [
        { title: '📫 合箱标签生成', url: '/tools/documents/consolidation-label', icon: '📫', description: '合箱/拼箱标签一站式生成' },
        { title: '🧾 商业发票', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '正式交易发票，报关结汇核心单据' },
        { title: '📦 装箱单', url: '/tools/documents/packing-list', icon: '📦', description: '列明货物包装、数量、重量' },
        { title: '📱 出海人必备 APP', url: '/topics/cross-border-apps', icon: '📱', description: '跨境电商从业者必备工具包' },
      ],
      'commercial-invoice': [
        { title: '📦 装箱单', url: '/tools/documents/packing-list', icon: '📦', description: '与商业发票配套使用' },
        { title: '🔍 HS 编码查询', url: '/tools/hs-code', icon: '🔍', description: '精准匹配海关编码' },
        { title: '💱 实时汇率', url: '/tools/exchange-rate', icon: '💱', description: '发票金额多币种换算' },
      ],
      'shipping-label': [
        { title: '📥 集运入库标签', url: '/tools/documents/inbound-label', icon: '📥', description: '集运仓入库标签独立路由' },
        { title: '📫 合箱标签', url: '/tools/documents/consolidation-label', icon: '📫', description: '拼箱/合箱标识标签' },
        { title: '🏗️ 托盘标签', url: '/tools/documents/pallet-label', icon: '🏗️', description: '整托货物标识' },
      ],
      'hs-code': [
        { title: '🧾 商业发票', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '报关必备发票' },
        { title: '📦 装箱单', url: '/tools/documents/packing-list', icon: '📦', description: '货物明细清单' },
      ],
      'inbound-label': [
        { title: '📮 全球邮编查询', url: '/tools/postal-code', icon: '📮', description: '确认仓库/目的地邮编' },
        { title: '📫 合箱标签', url: '/tools/documents/consolidation-label', icon: '📫', description: '多包裹合箱标签' },
      ],
      'consolidation-label': [
        { title: '📮 邮编查询', url: '/tools/postal-code', icon: '📮', description: '目的地邮编确认' },
        { title: '🧾 商业发票', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '合箱报关发票' },
      ],
      'pallet-label': [
        { title: '🏷️ 通用外箱唛头', url: '/tools/documents/shipping-mark', icon: '📦', description: '外箱标识唛头' },
        { title: '📮 邮编查询', url: '/tools/postal-code', icon: '📮', description: '目的地邮编' },
      ],
      'location-label': [
        { title: '🏷️ 提示标签', url: '/tools/documents/reminder-label', icon: '⚠️', description: '仓储提示标签' },
        { title: '🏗️ 托盘标签', url: '/tools/documents/pallet-label', icon: '🏗️', description: '整托货物标识' },
      ],
      'reminder-label': [
        { title: '📍 库位标签', url: '/tools/documents/location-label', icon: '📍', description: '仓库库位标识' },
        { title: '📦 通用外箱唛头', url: '/tools/documents/shipping-mark', icon: '📦', description: '外箱标识' },
      ],
      'shipping-mark': [
        { title: '📥 集运入库标签', url: '/tools/documents/inbound-label', icon: '📥', description: '入库标签生成' },
        { title: '📦 装箱单', url: '/tools/documents/packing-list', icon: '📦', description: '货物包装明细' },
      ],
    };

    (toolCrossLinks[context.tool] || []).forEach(link => addLink(link));
  }

  // ── Scenario-based recommendations ──
  if (context.scenario) {
    const scenarioLinks: Record<string, RelatedLink[]> = {
      student: [
        { title: '🎓 留学生专区', url: '/scenario/student', icon: '🎓', description: '留学生高频工具一站式聚合' },
        { title: '📐 地址格式化', url: '/tools/address-formatter', icon: '📝', description: '标准化学校/宿舍地址' },
        { title: '📮 邮编查询', url: '/tools/postal-code', icon: '📮', description: '确认学校所在地邮编' },
        { title: '📱 出海人必备 APP', url: '/topics/cross-border-apps', icon: '📱', description: '留学生必备工具包' },
      ],
      merchant: [
        { title: '🧾 商业发票', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '出口报关核心单据' },
        { title: '📦 装箱单', url: '/tools/documents/packing-list', icon: '📦', description: '货物包装明细' },
        { title: '🔍 HS 编码查询', url: '/tools/hs-code', icon: '🔍', description: '精准海关编码' },
        { title: '📋 形式发票', url: '/tools/documents/proforma-invoice', icon: '📋', description: '外贸报价必备' },
      ],
      nomad: [
        { title: '💱 实时汇率', url: '/tools/exchange-rate', icon: '💱', description: '多币种实时换算' },
        { title: '📐 地址格式化', url: '/tools/address-formatter', icon: '📝', description: '远程办公地址管理' },
        { title: '🤖 AI 翻译润色', url: '/ai-tools/translate-polish', icon: '🤖', description: '多语言文档翻译' },
      ],
      traveler: [
        { title: '📮 邮编查询', url: '/tools/postal-code', icon: '📮', description: '酒店/目的地邮编确认' },
        { title: '💱 汇率换算', url: '/tools/exchange-rate', icon: '💱', description: '旅行预算换算' },
      ],
    };

    (scenarioLinks[context.scenario] || []).forEach(link => addLink(link));
  }

  // ── Tag-based recommendations ──
  const tagLinks: Record<string, RelatedLink> = {
    '美国': { title: '🇺🇸 美国目的地向导', url: '/destinations/usa', icon: '🗽', description: '美国全景指南' },
    '留学': { title: '🎓 留学生专区', url: '/scenario/student', icon: '🎓', description: '留学生工具聚合' },
    '跨境贸易': { title: '🧾 商业发票生成', url: '/tools/documents/commercial-invoice', icon: '🧾', description: '跨境贸易核心单据' },
    'FBA': { title: '📦 FBA 标签与装箱单', url: '/tools/documents/packing-list', icon: '📦', description: 'Amazon FBA 必备单据' },
    '汇率': { title: '💱 实时汇率换算', url: '/tools/exchange-rate', icon: '💱', description: '150+ 法币实时转换' },
    '邮编': { title: '📮 全球邮编查询', url: '/tools/postal-code', icon: '📮', description: '50+ 国家邮编数据库' },
  };

  tags.forEach(tag => {
    if (tagLinks[tag]) {
      addLink(tagLinks[tag]);
    }
  });

  // Fallback: always show some general links
  if (links.length < 2) {
    const fallbacks: RelatedLink[] = [
      { title: '🔧 工具中心', url: '/tools', icon: '🔧', description: '全站工具一览' },
      { title: '📚 出海指南', url: '/guides', icon: '📚', description: '实用出海攻略' },
    ];
    fallbacks.forEach(link => addLink(link));
  }

  return links.slice(0, 6); // cap at 6 links
}
