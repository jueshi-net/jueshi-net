'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OfficialLightApp } from '@/config/official-light-apps';

interface OfficialLightAppFrameProps {
  app: OfficialLightApp;
}

/**
 * 官方轻应用运行容器
 * 
 * 使用 iframe 加载静态 HTML 工具
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
      <div className={`official-light-app-frame ${isFocused ? 'is-focused' : ''}`}>
        {/* 工具信息区 */}
        <div className="app-header">
          <div className="app-title-row">
            <span className="app-icon">{app.icon}</span>
            <h1 className="app-title">{app.name}</h1>
            <span className="official-badge">官方轻应用</span>
          </div>
          <p className="app-description">{app.shortDescription}</p>
        </div>

        {/* 隐私提示 */}
        <div className="privacy-notice">
          <i className="fas fa-info-circle"></i>
          <span>{app.privacyNote}</span>
        </div>

        {/* iframe 运行区 */}
        <div className="iframe-container" style={{ height: iframeHeight }}>
          {/* Loading 状态 */}
          {isLoading && (
            <div className="iframe-loading">
              <div className="loading-spinner"></div>
              <span>正在加载工具...</span>
            </div>
          )}

          {/* 错误状态 */}
          {hasError && (
            <div className="iframe-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>工具加载失败，请刷新页面重试</span>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={iframeSrc}
            sandbox="allow-scripts allow-forms allow-downloads allow-modals"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="app-iframe"
            title={app.name}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{ height: '100%' }}
          />
        </div>

        {/* 专注模式按钮 */}
        <button
          className="focus-mode-btn"
          onClick={() => setIsFocused(!isFocused)}
          title={isFocused ? '退出专注模式' : '进入专注模式'}
        >
          <i className={`fas ${isFocused ? 'fa-compress' : 'fa-expand'}`}></i>
          <span>{isFocused ? '退出专注' : '专注使用'}</span>
        </button>

        {/* 使用提示 */}
        <div className="usage-tips">
          <h3>使用提示</h3>
          <ul>
            <li>所有数据仅在您的浏览器中处理，不会上传到服务器</li>
            <li>请及时打印或下载您生成的单据</li>
            <li>刷新页面后数据将丢失，请提前保存</li>
          </ul>
        </div>
      </div>

      {/* 专注模式覆盖层 */}
      {isFocused && (
        <div className="focus-overlay">
          <div className="focus-overlay-header">
            <span className="focus-overlay-title">{app.name}</span>
            <button
              className="focus-overlay-close"
              onClick={() => setIsFocused(false)}
            >
              <i className="fas fa-times"></i>
              <span>退出专注模式</span>
            </button>
          </div>
          <div className="focus-overlay-content" style={{ height: `calc(100vh - 60px)` }}>
            <iframe
              src={iframeSrc}
              sandbox="allow-scripts allow-forms allow-downloads allow-modals"
              referrerPolicy="no-referrer"
              className="app-iframe"
              title={`${app.name} - 专注模式`}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          </div>
        </div>
      )}
    </>
  );
}
