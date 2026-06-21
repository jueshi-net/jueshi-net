'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Folder } from 'lucide-react';
import { listTaskChains, createTaskChain, type TaskChain } from '@/lib/task-chain-api';

interface TaskChainSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (taskChain: TaskChain) => void;
  onCreateNew: (title: string) => Promise<TaskChain>;
  sourceTool: string;
}

export function TaskChainSelectDialog({
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
  sourceTool,
}: TaskChainSelectDialogProps) {
  const [taskChains, setTaskChains] = useState<TaskChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && !showCreateForm) {
      loadTaskChains();
    }
  }, [isOpen, showCreateForm]);

  const loadTaskChains = async () => {
    setLoading(true);
    try {
      const chains = await listTaskChains({ status: 'active' });
      setTaskChains(chains);
    } catch (error) {
      console.error('Failed to load task chains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;
    
    setCreating(true);
    try {
      const newChain = await onCreateNew(newTitle.trim());
      onSelect(newChain);
      setShowCreateForm(false);
      setNewTitle('');
    } catch (error) {
      console.error('Failed to create task chain:', error);
      alert('创建任务链失败，请稍后重试');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            加入任务链
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {showCreateForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  新任务链标题
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：发货任务 - 保温杯"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNew}
                  disabled={creating || !newTitle.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? '创建中...' : '创建并加入'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTitle('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Create new button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Plus className="w-5 h-5" />
                <span>创建新任务链</span>
              </button>

              {/* Existing task chains */}
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  加载中...
                </div>
              ) : taskChains.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无任务链</p>
                  <p className="text-sm">点击上方按钮创建新任务链</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    选择已有任务链：
                  </p>
                  {taskChains.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => onSelect(chain)}
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {chain.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        来源：{chain.sourceTool} · 更新于 {new Date(chain.updatedAt).toLocaleString('zh-CN')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
