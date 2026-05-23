'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Check, Plus, ChevronRight, Clock } from 'lucide-react';

interface Todo {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  priority: 'high' | 'normal' | 'low';
}

const MOCK_TODOS: Todo[] = [
  { id: '1', title: '完善清关资料', done: false, due: '明天', priority: 'high' },
  { id: '2', title: '续费物流服务', done: false, due: '周五', priority: 'normal' },
  { id: '3', title: '更新产品定价表', done: false, priority: 'low' as const },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-400',
  normal: 'bg-amber-400',
  low: 'bg-gray-300',
};

export default function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('wb:todos');
      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        setTodos(MOCK_TODOS);
      }
    } catch {
      setTodos(MOCK_TODOS);
    }
  }, []);

  const saveTodos = (list: Todo[]) => {
    setTodos(list);
    try { localStorage.setItem('wb:todos', JSON.stringify(list)); } catch {}
  };

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTodo = () => {
    if (!newTitle.trim()) return;
    saveTodos([...todos, { id: Date.now().toString(), title: newTitle.trim(), done: false, priority: 'normal' }]);
    setNewTitle('');
  };

  const removeDone = () => {
    saveTodos(todos.filter(t => !t.done));
  };

  const pending = todos.filter(t => !t.done);
  const doneCount = todos.filter(t => t.done).length;

  if (!mounted) return null;

  return (
    <div className="min-w-[240px] sm:min-w-0 snap-start shrink-0 sm:shrink bg-white rounded-xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all hover:shadow-md hover:border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-md bg-violet-50 ring-1 ring-violet-100 flex items-center justify-center">
            <CheckSquare className="w-3 h-3 text-violet-500" />
          </div>
          <h3 className="text-xs font-semibold text-gray-900">待办事项</h3>
          {pending.length > 0 && (
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">{pending.length}</span>
          )}
        </div>
        {doneCount > 0 && (
          <button onClick={removeDone} className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
            清理已完成
          </button>
        )}
      </div>

      {/* Todo List */}
      <div className="px-3.5 pb-2 space-y-1 max-h-32 overflow-y-auto">
        {todos.length === 0 && (
          <p className="text-[11px] text-gray-300 py-4 text-center">暂无待办，添加一条吧</p>
        )}
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-start gap-2 py-1.5 group"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                todo.done
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'border-gray-200 hover:border-teal-300'
              }`}
            >
              {todo.done && <Check className="w-3 h-3" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-snug ${todo.done ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                {todo.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_COLORS[todo.priority]}`} />
                {todo.due && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />{todo.due}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Input */}
      <div className="px-3.5 pb-3 pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
            placeholder="添加待办..."
            className="flex-1 text-[11px] text-gray-700 placeholder:text-gray-300 bg-gray-50/50 rounded-lg border-0 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-200 transition-all"
          />
          <button
            onClick={addTodo}
            disabled={!newTitle.trim()}
            className="p-1.5 rounded-lg bg-violet-50 text-violet-500 hover:bg-violet-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* See All */}
      <div className="px-3.5 pb-2.5">
        <Link
          href="/dashboard/tasks"
          className="flex items-center justify-center gap-1 text-[10px] text-violet-600 hover:text-violet-700 font-medium py-1.5 rounded-lg hover:bg-violet-50/50 transition-all"
        >
          查看全部待办 <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
