'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, Trash2, Play, Loader2 } from 'lucide-react';
import { saveTaskChain, type TaskChainContext } from '@/lib/task-chain';
import { trackEvent } from '@/lib/analytics';

interface TaskChainDraft {
  id: string;
  title: string;
  status: string;
  sourceTool: string;
  lastActiveTool: string | null;
  context: TaskChainContext;
  createdAt: string;
  updatedAt: string;
}

export function TaskChainList() {
  const [taskChains, setTaskChains] = useState<TaskChainDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskChains();
  }, []);

  const fetchTaskChains = async () => {
    try {
      const response = await fetch('/api/me/task-chains?status=active&limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch task chains');
      }
      const data = await response.json();
      setTaskChains(data.data || []);
    } catch (err) {
      setError('加载失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = (taskChain: TaskChainDraft) => {
    // Write context back to localStorage
    saveTaskChain(taskChain.context);
    
    // Track event
    trackEvent.custom('workspace', 'task_chain_workspace_resume_click');
    
    // Navigate to last active tool
    if (taskChain.lastActiveTool) {
      const toolPath = getToolPath(taskChain.lastActiveTool);
      if (toolPath) {
        window.location.href = toolPath;
      }
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/me/task-chains/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      
      if (response.ok) {
        setTaskChains(prev => prev.filter(tc => tc.id !== id));
        trackEvent.custom('workspace', 'task_chain_workspace_archive');
      }
    } catch (err) {
      console.error('Failed to archive task chain:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;
    
    try {
      const response = await fetch(`/api/me/task-chains/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setTaskChains(prev => prev.filter(tc => tc.id !== id));
        trackEvent.custom('workspace', 'task_chain_workspace_delete');
      }
    } catch (err) {
      console.error('Failed to delete task chain:', err);
    }
  };

  const getToolPath = (toolSlug: string): string | null => {
    const toolPaths: Record<string, string> = {
      'hs-code': '/tools/hs-code',
      'exchange-rate': '/tools/exchange-rate',
      'postal-code': '/tools/postal-code',
      'address-formatter': '/tools/address-formatter',
      'shipping-calculator': '/tools/shipping-calculator',
      'commercial-invoice': '/tools/documents/commercial-invoice',
      'quotation': '/tools/documents/quotation',
    };
    return toolPaths[toolSlug] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        {error}
      </div>
    );
  }

  if (taskChains.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无保存的跨境发货任务
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {taskChains.map((taskChain) => (
        <div
          key={taskChain.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {taskChain.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>来源: {taskChain.sourceTool}</span>
                {taskChain.lastActiveTool && (
                  <>
                    <span>•</span>
                    <span>最后活动: {taskChain.lastActiveTool}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                更新于 {new Date(taskChain.updatedAt).toLocaleString('zh-CN')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResume(taskChain)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors"
                title="继续任务"
              >
                <Play className="w-3 h-3" />
                继续
              </button>
              <button
                onClick={() => handleArchive(taskChain.id)}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="归档"
              >
                <Archive className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDelete(taskChain.id)}
                className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
