'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitBranch, Loader2, Package, X, Plus, ArrowRight } from 'lucide-react';

interface TaskChainDraft {
  id: string;
  title: string;
  status: string;
  sourceTool: string;
  context: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface TaskChainGeneratorButtonProps {
  /** Callback when a task chain is selected. Receives the task chain's context data. */
  onSelect: (context: Record<string, any>, taskChain: TaskChainDraft) => void;
  /** Optional: which tool types to filter by (e.g., only show chains from relevant tools) */
  filterSourceTools?: string[];
  /** Button label override */
  label?: string;
}

export default function TaskChainGeneratorButton({
  onSelect,
  filterSourceTools,
  label = '从任务链生成',
}: TaskChainGeneratorButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskChains, setTaskChains] = useState<TaskChainDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);

    // Check auth first
    fetch('/api/auth/session', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const loggedIn = !!data?.user;
        setIsLoggedIn(loggedIn);
        if (!loggedIn) {
          setLoading(false);
          return;
        }
        // Fetch task chains
        return fetch('/api/task-chains')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
          })
          .then(data => {
            let chains: TaskChainDraft[] = data.taskChains || [];
            if (filterSourceTools && filterSourceTools.length > 0) {
              chains = chains.filter(tc => filterSourceTools.includes(tc.sourceTool));
            }
            setTaskChains(chains);
          });
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false));
  }, [open, filterSourceTools]);

  const handleSelect = (tc: TaskChainDraft) => {
    onSelect(tc.context || {}, tc);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors min-h-[44px] font-medium"
        title="从已保存的发货任务链中导入数据"
      >
        <GitBranch className="w-4 h-4" />
        {label}
      </button>

      {open && (
        /* Modal overlay — also serves as backdrop; click to close */
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          {/* Modal card */}
          <div
            className="w-full max-w-md max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-teal-600" />
                选择发货任务
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading && (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">加载中...</span>
                </div>
              )}

              {!loading && isLoggedIn === false && (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">请先登录以使用任务链功能</p>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                  >
                    去登录
                  </Link>
                </div>
              )}

              {!loading && isLoggedIn === true && taskChains.length === 0 && (
                <div className="p-4 text-center">
                  <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">暂无发货任务</p>
                  <p className="text-xs text-gray-400 mb-3">先使用 HS 编码查询、运费计算等工具创建任务</p>
                  <Link
                    href="/tools/hs-code"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
                    onClick={() => setOpen(false)}
                  >
                    <Plus className="w-4 h-4" />
                    先创建发货任务
                  </Link>
                </div>
              )}

              {!loading && taskChains.length > 0 && (
                <div className="divide-y divide-gray-50">
                  {taskChains.map(tc => (
                    <button
                      key={tc.id}
                      onClick={() => handleSelect(tc)}
                      className="w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-teal-700">
                            {tc.title}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tc.context?.productName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                                {tc.context.productName}
                              </span>
                            )}
                            {tc.context?.hsCode && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">
                                HS: {tc.context.hsCode}
                              </span>
                            )}
                            {tc.context?.destinationCountry && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">
                                → {tc.context.destinationCountry}
                              </span>
                            )}
                            {tc.context?.buyerName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px]">
                                {tc.context.buyerName}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            来源: {tc.sourceTool} · {new Date(tc.updatedAt).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {isLoggedIn === true && taskChains.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 shrink-0">
                <Link
                  href="/workspace/task-chains"
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  onClick={() => setOpen(false)}
                >
                  管理所有任务链 →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
