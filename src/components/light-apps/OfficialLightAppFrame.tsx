'use client';

import React from 'react';
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
  const iframeSrc = `/light-apps/${app.slug}/index.html`;

  return (
    <div className="official-light-app-frame">
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
      <div className="iframe-container">
        <iframe
          src={iframeSrc}
          sandbox="allow-scripts allow-forms allow-downloads allow-modals"
          referrerPolicy="no-referrer"
          loading="lazy"
          className="app-iframe"
          title={app.name}
        />
      </div>

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
  );
}
