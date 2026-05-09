// 匿名统计埋点工具
// 不采集用户输入内容（单号、地址、查询词等），只记录事件类型/工具名/路径/时间
// sessionId 由 localStorage 生成，不关联用户身份

let _sessionId: string | null = null;

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  if (!_sessionId) {
    _sessionId = localStorage.getItem('__bxb_sid');
    if (!_sessionId) {
      _sessionId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      localStorage.setItem('__bxb_sid', _sessionId);
    }
  }
  return _sessionId;
}

export interface TrackEvent {
  eventType: string;
  toolName?: string;
  action?: string;
  path?: string;
}

export function track(event: TrackEvent) {
  if (typeof window === 'undefined') return;
  
  const payload = {
    ...event,
    path: event.path || window.location.pathname,
    sessionId: getSessionId(),
  };

  // In dev mode, use fetch for better testability and debugging
  // In production, use sendBeacon for reliability
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isDev && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/events', blob);
  } else {
    // Use fetch with keepalive for dev mode (allows Playwright interception)
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

// 便捷事件函数
export const trackEvent = {
  // 首页工具点击
  homeToolClick: (toolName: string) => track({
    eventType: 'tool_click',
    toolName,
    action: 'home_click',
  }),
  
  // 物流追踪：点击 17TRACK 跳转
  trackingClick17track: () => track({
    eventType: 'tool_click',
    toolName: 'tracking',
    action: 'click_17track',
  }),
  
  // 物流追踪：复制单号
  trackingCopy: () => track({
    eventType: 'tool_copy',
    toolName: 'tracking',
    action: 'copy_tracking_number',
  }),
  
  // 运费计算：点击计算
  shippingCalculate: () => track({
    eventType: 'tool_calculate',
    toolName: 'shipping-calculator',
    action: 'calculate_shipping',
  }),
  
  // HS 编码：复制英文申报名
  hsCopyName: () => track({
    eventType: 'tool_copy',
    toolName: 'hs-code',
    action: 'copy_hs_name_en',
  }),
  
  // HS 编码：点击官方核验入口
  hsClickVerify: () => track({
    eventType: 'tool_click',
    toolName: 'hs-code',
    action: 'click_verify_link',
  }),
  
  // 邮编工具：查询
  postalQuery: () => track({
    eventType: 'tool_query',
    toolName: 'postal-code',
    action: 'query_postal',
  }),
  
  // 汇率工具：换算
  exchangeConvert: () => track({
    eventType: 'tool_calculate',
    toolName: 'exchange-rate',
    action: 'convert_currency',
  }),
  
  // 备忘录：新增便签
  memoAdd: () => track({
    eventType: 'memo_action',
    toolName: 'memo',
    action: 'add_memo',
  }),
  
  // 备忘录：复制
  memoCopy: () => track({
    eventType: 'memo_action',
    toolName: 'memo',
    action: 'copy_memo',
  }),
  
  // 备忘录：导出 JSON
  memoExport: () => track({
    eventType: 'memo_action',
    toolName: 'memo',
    action: 'export_json',
  }),
  
  // 资源库：外链点击
  resourceClick: (category: string) => track({
    eventType: 'resource_click',
    toolName: 'resources',
    action: `click_${category}`,
  }),
  
  // 文章：相关工具点击
  articleToolClick: (toolName: string) => track({
    eventType: 'article_click',
    toolName: 'blog',
    action: `click_related_${toolName}`,
  }),
  
  // 通用事件
  custom: (toolName: string, action: string) => track({
    eventType: 'tool_click',
    toolName,
    action,
  }),
};
