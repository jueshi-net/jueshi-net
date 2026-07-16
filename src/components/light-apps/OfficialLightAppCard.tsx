import React from 'react';
import Link from 'next/link';
import { OfficialLightApp } from '@/config/official-light-apps';

interface OfficialLightAppCardProps {
  app: OfficialLightApp;
}

/**
 * 官方轻应用卡片组件
 * 用于工具中心展示
 */
export default function OfficialLightAppCard({ app }: OfficialLightAppCardProps) {
  return (
    <Link href={app.entry} className="official-light-app-card">
      <div className="card-icon">{app.icon}</div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{app.name}</h3>
          <span className="official-badge">官方轻应用</span>
        </div>
        <p className="card-description">{app.shortDescription}</p>
        <div className="card-footer">
          <span className="card-category">{app.category}</span>
          <span className="card-action">立即使用 →</span>
        </div>
      </div>
    </Link>
  );
}
