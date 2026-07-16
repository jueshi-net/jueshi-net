'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OfficialLightApp } from '@/config/official-light-apps';

interface OfficialLightAppFrameProps {
  app: OfficialLightApp;
}

/**
 * 官方轻应用运行容器
 * 
 * 只负责 iframe 运行区域，标题/说明/隐私等由 ToolLandingPageShell 提供
 * 安全配置：
 * - sandbox="allow-scripts allow-forms allow-downloads allow-modals"
 * - referrerPolicy="no-referrer"
 * - loading="lazy"
 * 
 * 禁止：
 * - allow-same-origin
 * - allow-top-navigation
 * - allow-top-navigation-by-user-activation
 * - allow-popups
 */
export default function OfficialLightAppFrame({ app }: OfficialLightAppFrameProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollPositionRef = useRef(0);

  const iframeSrc = `/light-apps/${app.slug}/index.html`;

  // 根据视口宽度获取 iframe 高度
  const getIframeHeight = () => {
    if (typeof window === 'undefined') return app.viewport.desktopHeight;
    const width = window.innerWidth;
    if (width >= 1024) return app.viewport.desktopHeight;
    if (width >= 768) return app.viewport.tabletHeight;
    return app.viewport.mobileHeight;
  };

  const [iframeHeight, setIframeHeight] = useState(getIframeHeight());

  // 响应视口变化
  useEffect(() => {
    const handleResize = () => {
      setIframeHeight(getIframeHeight());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 专注模式：锁定滚动
  useEffect(() => {
    if (isFocused) {
      scrollPositionRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollPositionRef.current);
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isFocused]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <>
      {/* iframe 运行区 - 使用现有 Card 样式 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ minHeight: iframeHeight }}>
        {/* Loading 状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/90 z-10 text-gray-500 text-sm">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
            <span>正在加载工具...</span>
          </div>
        )}

        {/* 错误状态 */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/95 z-10 text-red-600 text-sm">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>工具加载失败，请刷新页面重试</span>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={iframeSrc}
          sandbox="allow-scripts allow-forms allow-downloads allow-modals"
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full border-0 block"
          title={app.name}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ height: iframeHeight }}
        />
      </div>

      {/* 专注模式按钮 - 使用现有 Button 样式 */}
      <div className="mt-4">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-teal-300 transition-colors"
          onClick={() => setIsFocused(!isFocused)}
          title={isFocused ? '退出专注模式' : '进入专注模式'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isFocused ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            )}
          </svg>
          <span>{isFocused ? '退出专注' : '专注使用'}</span>
        </button>
      </div>

      {/* 专注模式覆盖层 */}
      {isFocused && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0">
            <span className="font-semibold text-sm">{app.name}</span>
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-white/30 rounded-md bg-transparent text-white text-sm hover:bg-white/10 transition-colors"
              onClick={() => setIsFocused(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>退出专注模式</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              src={iframeSrc}
              sandbox="allow-scripts allow-forms allow-downloads allow-modals"
              referrerPolicy="no-referrer"
              className="w-full h-full border-0"
              title={`${app.name} - 专注模式`}
            />
          </div>
        </div>
      )}
    </>
  );
}
