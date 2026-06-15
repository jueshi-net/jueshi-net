/**
 * HS Code Query Aliases / Synonyms
 * 
 * This file provides synonym mappings for HS Code queries.
 * When a query returns no results, the system will try these aliases.
 * 
 * Note: These are search aids only. Results still need human verification.
 * 注意：这些只是搜索辅助，结果仍需人工确认。
 */

export interface AliasMapping {
  aliases: string[];
  note?: string;
}

/**
 * Query alias mappings
 * Key: original query (lowercase for English)
 * Value: array of alternative queries to try
 */
export const HS_CODE_ALIASES: Record<string, AliasMapping> = {
  // 保温杯 / Thermos / Vacuum Flask
  '保温杯': {
    aliases: ['保温', '真空', 'vacuum', 'flask', 'insulated'],
    note: '保温杯相关查询',
  },
  'thermos': {
    aliases: ['vacuum', 'flask', 'insulated', '保温'],
    note: 'Thermos related queries',
  },
  'vacuum flask': {
    aliases: ['vacuum', 'flask', 'insulated', '保温'],
    note: 'Vacuum flask related queries',
  },
  'insulated bottle': {
    aliases: ['insulated', 'vacuum', 'flask', '保温'],
    note: 'Insulated bottle related queries',
  },

  // 手机壳 / Phone Case
  '手机壳': {
    aliases: ['手机', '手机套', '电话壳'],
    note: '手机壳相关查询',
  },
  'phone case': {
    aliases: ['phone', 'case', 'cover', 'mobile'],
    note: 'Phone case related queries',
  },
  'mobile case': {
    aliases: ['mobile', 'phone', 'case', 'cover'],
    note: 'Mobile case related queries',
  },

  // 塑料杯 / Plastic Cup
  '塑料杯': {
    aliases: ['塑料', '杯子', '杯', 'plastic'],
    note: '塑料杯相关查询',
  },
  'plastic cup': {
    aliases: ['plastic', 'cup', '塑料', '杯子'],
    note: 'Plastic cup related queries',
  },

  // 棉T恤 / Cotton Shirt
  '棉t恤': {
    aliases: ['t恤', '衬衫', '衣服', 'shirt'],
    note: '棉T恤相关查询',
  },
  'cotton shirt': {
    aliases: ['shirt', 'cotton', 't-shirt', 'tee'],
    note: 'Cotton shirt related queries',
  },
  't-shirt': {
    aliases: ['shirt', 'tee', 't恤', '衬衫'],
    note: 'T-shirt related queries',
  },

  // LED灯 / LED Light
  'led灯': {
    aliases: ['灯', 'led', 'light', 'lamp'],
    note: 'LED灯相关查询',
  },
  'led light': {
    aliases: ['light', 'led', 'lamp', '灯'],
    note: 'LED light related queries',
  },

  // 陶瓷杯 / Ceramic Cup
  '陶瓷杯': {
    aliases: ['陶瓷', '瓷', '杯子', 'ceramic'],
    note: '陶瓷杯相关查询',
  },
  'ceramic cup': {
    aliases: ['ceramic', 'cup', 'porcelain', '陶瓷'],
    note: 'Ceramic cup related queries',
  },

  // 双肩包 / Backpack
  '双肩包': {
    aliases: ['包', '书包', '背包', 'bag'],
    note: '双肩包相关查询',
  },
  'backpack': {
    aliases: ['bag', 'pack', '书包', '包'],
    note: 'Backpack related queries',
  },

  // 衣服 / Clothing
  '衣服': {
    aliases: ['服装', '衣物', 'clothing', 'garment'],
    note: '衣服相关查询',
  },
  'clothing': {
    aliases: ['garment', 'clothes', 'apparel', '服装'],
    note: 'Clothing related queries',
  },

  // 玩具 / Toys
  '玩具': {
    aliases: ['toy', 'toys', '玩'],
    note: '玩具相关查询',
  },
  'toy': {
    aliases: ['toys', '玩具'],
    note: 'Toy related queries',
  },

  // 电池 / Battery
  '电池': {
    aliases: ['battery', 'batteries', '锂电'],
    note: '电池相关查询',
  },
  'battery': {
    aliases: ['batteries', '电池', '锂电'],
    note: 'Battery related queries',
  },
};

/**
 * Get aliases for a query
 * @param query - Original query string
 * @returns Array of alternative queries to try
 */
export function getAliases(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct match
  if (HS_CODE_ALIASES[normalizedQuery]) {
    return HS_CODE_ALIASES[normalizedQuery].aliases;
  }
  
  // Try to find partial match
  for (const [key, mapping] of Object.entries(HS_CODE_ALIASES)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return mapping.aliases;
    }
  }
  
  return [];
}

/**
 * Check if a query has aliases
 */
export function hasAliases(query: string): boolean {
  return getAliases(query).length > 0;
}
