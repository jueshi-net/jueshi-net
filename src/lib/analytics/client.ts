// Analytics SDK - 增强版
// 支持自动 page_view、session 管理、heartbeat、page_exit

import { track, TrackEvent } from './index';

// 配置
const CONFIG = {
  heartbeatInterval: 30 * 1000, // 30 秒
  sessionTimeout: 30 * 60 * 1000, // 30 分钟
  enableHeartbeat: true,
  enablePageView: true,
  enablePageExit: true,
};

// Session 管理
let sessionId: string | null = null;
let anonymousId: string | null = null;
let sessionStartTime: number = 0;
let lastActivityTime: number = 0;
let heartbeatTimer: NodeJS.Timeout | null = null;

/**
 * 生成 UUID
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 初始化 Analytics
 */
export function initAnalytics() {
  if (typeof window === 'undefined') return;

  // 初始化 anonymousId
  anonymousId = localStorage.getItem('__bxb_aid');
  if (!anonymousId) {
    anonymousId = generateUUID();
    localStorage.setItem('__bxb_aid', anonymousId);
  }

  // 初始化或恢复 session
  initSession();

  // 启动 heartbeat
  if (CONFIG.enableHeartbeat) {
    startHeartbeat();
  }

  // 监听页面可见性变化
  if (CONFIG.enablePageExit) {
    setupPageExitTracking();
  }

  // 自动追踪 page_view
  if (CONFIG.enablePageView) {
    trackPageView();
  }
}

/**
 * 初始化 Session
 */
function initSession() {
  const storedSessionId = localStorage.getItem('__bxb_sid');
  const storedSessionTime = localStorage.getItem('__bxb_stime');

  if (storedSessionId && storedSessionTime) {
    const sessionTime = parseInt(storedSessionTime, 10);
    const now = Date.now();

    // 检查 session 是否过期
    if (now - sessionTime < CONFIG.sessionTimeout) {
      sessionId = storedSessionId;
      sessionStartTime = sessionTime;
      lastActivityTime = now;
      return;
    }
  }

  // 创建新 session
  sessionId = generateUUID();
  sessionStartTime = Date.now();
  lastActivityTime = sessionStartTime;

  localStorage.setItem('__bxb_sid', sessionId);
  localStorage.setItem('__bxb_stime', sessionStartTime.toString());

  // 发送 session_start 事件
  track({
    eventType: 'session_start',
    action: 'session_start',
  });
}

/**
 * 更新 Session 活动
 */
function updateSessionActivity() {
  lastActivityTime = Date.now();
  localStorage.setItem('__bxb_stime', lastActivityTime.toString());
}

/**
 * 启动 Heartbeat
 */
function startHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  heartbeatTimer = setInterval(() => {
    if (document.visibilityState === 'visible') {
      updateSessionActivity();
      
      // 发送 heartbeat 事件
      track({
        eventType: 'session_heartbeat',
        action: 'heartbeat',
      });
    }
  }, CONFIG.heartbeatInterval);
}

/**
 * 设置 Page Exit 追踪
 */
function setupPageExitTracking() {
  // 监听 visibilitychange
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendPageExit();
    }
  });

  // 监听 pagehide（移动端更可靠）
  window.addEventListener('pagehide', () => {
    sendPageExit();
  });

  // 监听 beforeunload（桌面端）
  window.addEventListener('beforeunload', () => {
    sendPageExit();
  });
}

/**
 * 发送 Page Exit 事件
 */
function sendPageExit() {
  const durationMs = Date.now() - sessionStartTime;
  
  const payload = {
    eventType: 'page_exit',
    action: 'page_exit',
    path: window.location.pathname,
    sessionId,
    anonymousId,
    durationMs,
  };

  // 优先使用 sendBeacon
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon('/api/events', blob);
  } else {
    // Fallback: fetch with keepalive
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

/**
 * 追踪 Page View
 */
export function trackPageView() {
  if (typeof window === 'undefined') return;

  updateSessionActivity();

  track({
    eventType: 'page_view',
    action: 'page_view',
    path: window.location.pathname,
  });
}

/**
 * 追踪自定义事件
 */
export function trackCustomEvent(eventName: string, metadata?: any) {
  if (typeof window === 'undefined') return;

  updateSessionActivity();

  track({
    eventType: eventName,
    action: eventName,
    metadata,
  });
}

/**
 * 追踪工具事件
 */
export function trackToolEvent(
  toolName: string,
  action: string,
  metadata?: any
) {
  if (typeof window === 'undefined') return;

  updateSessionActivity();

  track({
    eventType: 'tool_action',
    toolName,
    action,
    metadata,
  });
}

/**
 * 获取 Session 信息
 */
export function getSessionInfo() {
  return {
    sessionId,
    anonymousId,
    sessionStartTime,
    lastActivityTime,
    duration: Date.now() - sessionStartTime,
  };
}

/**
 * 清理 Analytics
 */
export function cleanupAnalytics() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// 自动初始化（如果在浏览器环境）
if (typeof window !== 'undefined') {
  // 延迟初始化，确保 DOM 已加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAnalytics();
    });
  } else {
    initAnalytics();
  }
}

// 导出原有 track 函数
export { track };
export type { TrackEvent };
