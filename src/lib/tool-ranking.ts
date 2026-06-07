/**
 * 工具热度排序函数
 * 用于 /tools 列表排序及首页热门推荐
 * 
 * Score 公式:
 * score = views * 0.2 + clicks * 0.3 + saves * 0.4 + favorites * 0.1
 * 
 * @param metrics ToolMetricDaily metrics for a specific day or aggregated period
 */
export interface ToolMetricsInput {
  views?: number;
  clicks?: number;
  saves?: number;
  favorites?: number;
}

export function calculateToolScore(metrics: ToolMetricsInput): number {
  const { views = 0, clicks = 0, saves = 0, favorites = 0 } = metrics;
  
  // 权重: views 20%, clicks 30%, saves 40%, favorites 10%
  const score = views * 0.2 + clicks * 0.3 + saves * 0.4 + favorites * 0.1;
  
  return Math.round(score * 100) / 100;
}

export function getToolScoreLabel(score: number): string {
  if (score > 100) return "🔥 爆火";
  if (score > 50) return "🔥 热门";
  if (score > 10) return "👍 常用";
  if (score > 0) return "📈 新上线";
  return "";
}
