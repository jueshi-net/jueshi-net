'use client';

import { useState, useEffect } from 'react';
import { Clock, ExternalLink, Truck, FileText, MapPin, Calculator, Package, Bookmark } from 'lucide-react';
import Link from 'next/link';

interface RecentTool {
  toolName: string;
  toolTitle: string;
  lastUsed: string;
  useCount: number;
  route: string;
  icon: React.ReactNode;
}

interface RecentToolsProps {
  userId: string;
}

// 默认推荐工具
const DEFAULT_TOOLS = [
  { toolName: 'shipping-calculator', toolTitle: '运费计算器', route: '/tools/shipping-calculator', icon: <Calculator className="w-4 h-4" /> },
  { toolName: 'tracking', toolTitle: '物流追踪', route: '/tracking', icon: <Truck className="w-4 h-4" /> },
  { toolName: 'postal-code', toolTitle: '邮编查询', route: '/tools/postal-code', icon: <MapPin className="w-4 h-4" /> },
  { toolName: 'hs-code', toolTitle: 'HS 编码', route: '/tools/hs-code', icon: <FileText className="w-4 h-4" /> },
  { toolName: 'exchange-rate', toolTitle: '汇率换算', route: '/tools/exchange-rate', icon: <Calculator className="w-4 h-4" /> },
  { toolName: 'documents', toolTitle: '单据工具', route: '/tools/documents', icon: <Package className="w-4 h-4" /> },
];

export default function RecentTools({ userId }: RecentToolsProps) {
  const [tools, setTools] = useState<RecentTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTools();
  }, [userId]);

  const fetchRecentTools = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workbench/recent-tools');
      const data = await res.json();
      
      if (data.tools && data.tools.length > 0) {
        setTools(data.tools);
      } else {
        // 使用默认推荐工具
        setTools(DEFAULT_TOOLS.map(t => ({
          ...t,
          lastUsed: new Date().toISOString(),
          useCount: 0,
        })));
      }
    } catch (error) {
      console.error('获取最近使用工具失败:', error);
      // 使用默认推荐工具
      setTools(DEFAULT_TOOLS.map(t => ({
        ...t,
        lastUsed: new Date().toISOString(),
        useCount: 0,
      })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="animate-pulse grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-2 gap-2 p-3">
        {tools.slice(0, 6).map(tool => (
          <Link
            key={tool.toolName}
            href={tool.route}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate group-hover:text-teal-700">
                {tool.toolTitle}
              </div>
              {tool.useCount > 0 && (
                <div className="text-[10px] text-gray-400">
                  使用 {tool.useCount} 次
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="border-t border-gray-100 p-2 bg-gray-50/50">
        <Link 
          href="/tools" 
          className="flex items-center justify-center gap-1 text-xs text-teal-600 hover:text-teal-700 py-1"
        >
          去工具中心 <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
