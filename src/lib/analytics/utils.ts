import { createHash } from 'crypto';

/**
 * 解析 User-Agent 字符串
 * 返回设备类型、浏览器、操作系统
 */
export function parseUserAgent(userAgent: string): {
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
} {
  if (!userAgent) {
    return { deviceType: 'unknown', browser: 'unknown', os: 'unknown' };
  }

  const ua = userAgent.toLowerCase();

  // 设备类型检测
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  if (/tablet|ipad|playbook|silk/.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
    deviceType = 'mobile';
  } else if (/windows|mac|linux|cros/.test(ua)) {
    deviceType = 'desktop';
  }

  // 浏览器检测
  let browser = 'unknown';
  if (/edg/.test(ua)) {
    browser = 'Edge';
  } else if (/opr|opera/.test(ua)) {
    browser = 'Opera';
  } else if (/chrome/.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/firefox/.test(ua)) {
    browser = 'Firefox';
  } else if (/msie|trident/.test(ua)) {
    browser = 'IE';
  }

  // 操作系统检测
  let os = 'unknown';
  if (/windows nt/.test(ua)) {
    os = 'Windows';
  } else if (/mac os x/.test(ua)) {
    os = 'macOS';
  } else if (/android/.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/.test(ua)) {
    os = 'iOS';
  } else if (/linux/.test(ua)) {
    os = 'Linux';
  } else if (/cros/.test(ua)) {
    os = 'ChromeOS';
  }

  return { deviceType, browser, os };
}

/**
 * 解析 Referrer，提取域名
 */
export function parseReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  
  try {
    const url = new URL(referrer);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * 解析 UTM 参数
 */
export function parseUTM(url: string | null): {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
} {
  if (!url) {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };
  }

  try {
    const params = new URL(url).searchParams;
    return {
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
      utmTerm: params.get('utm_term'),
      utmContent: params.get('utm_content'),
    };
  } catch {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    };
  }
}

/**
 * 生成 IP 哈希（SHA-256，取前 16 位）
 * 不存储明文 IP，只存储哈希值
 */
export function hashIP(ip: string | null): string | null {
  if (!ip) return null;
  
  return createHash('sha256')
    .update(ip)
    .digest('hex')
    .slice(0, 16);
}

/**
 * 从请求中提取真实 IP
 * 支持代理和 CDN
 */
export function extractIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }
  
  return null;
}

/**
 * 检测是否为 Bot / Crawler
 */
export function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  
  const botPatterns = [
    'bot', 'crawl', 'spider', 'slurp', 'googlebot', 'bingbot',
    'yahoo', 'baidu', 'yandex', 'sogou', 'exabot', 'facebot',
    'ia_archiver', 'alexa', 'msnbot', 'twitterbot', 'linkedinbot',
    'pinterest', 'slack', 'telegram', 'whatsapp', 'discord',
    'curl', 'wget', 'python-requests', 'axios', 'fetch',
  ];
  
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * 验证事件名称是否在白名单中
 */
export function isValidEventType(eventType: string): boolean {
  const allowedEventTypes = [
    // 访问统计
    'page_view',
    'session_start',
    'session_heartbeat',
    'page_exit',
    
    // 工具使用
    'tool_view',
    'tool_click',
    'tool_start',
    'tool_calculate',
    'tool_success',
    'tool_error',
    'tool_save',
    'tool_copy',
    'tool_export',
    'tool_query',
    'tool_favorite',
    
    // 资源
    'resource_click',
    'resource_featured_view',
    'resource_featured_click',
    'resource_quality_check_run',
    'search_submit',
    
    // 转化
    'signup_start',
    'signup_success',
    'login_success',
    'password_reset_request',
    'feedback_submit',
    'invite_register_success',
    
    // 其他
    'article_click',
    'memo_action',
    'checklist_view',
    'checklist_tool_click',
    'checklist_internal_link_click',
    'community_list_view',
    'community_article_view',
    'community_cta_click',
    'community_tool_continue',
  ];
  
  return allowedEventTypes.includes(eventType);
}

/**
 * 清理 metadata，移除敏感信息
 * 只允许安全字段
 */
export function sanitizeMetadata(metadata: any): any {
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }
  
  // 允许的字段白名单
  const allowedFields = [
    'itemCount',
    'hasWeight',
    'hasRate',
    'formulaType',
    'success',
    'errorCode',
    'carrier',
    'trackingNumberHash',
    'resultStatus',
    'country',
    'queryType',
    'resultCount',
    'resourceId',
    'resourceName',
    'featuredGroup',
    'category',
    'queryLength',
    'slug',
    'toolSlug',
    'checklistSlug',
    'sourcePath',
  ];
  
  const sanitized: any = {};
  for (const key of allowedFields) {
    if (key in metadata) {
      const value = metadata[key];
      // 只允许基本类型
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      }
    }
  }
  
  return Object.keys(sanitized).length > 0 ? sanitized : null;
}
