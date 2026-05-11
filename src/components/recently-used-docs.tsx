'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { getDrafts, type DocumentDraft } from '@/lib/documents/storage';
import { getDocumentType } from '@/lib/documents/document-types';

export default function RecentlyUsedWidget() {
  const [drafts, setDrafts] = useState<DocumentDraft[]>([]);

  useEffect(() => {
    const all = getDrafts();
    // Get unique types sorted by most recent
    const seen = new Set<string>();
    const unique = all.filter(d => {
      if (seen.has(d.type)) return false;
      seen.add(d.type);
      return true;
    }).slice(0, 4);
    setDrafts(unique);
  }, []);

  if (drafts.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 -mt-4 mb-8">
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            最近使用
          </h3>
          <Link href="/tools/documents/drafts" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
            查看全部草稿 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto">
          {drafts.map(draft => {
            const docType = getDocumentType(draft.type);
            const updated = new Date(draft.updatedAt);
            const timeStr = updated.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return (
              <Link
                key={draft.id}
                href={`/tools/documents/${draft.type}`}
                className="flex-shrink-0 w-44 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-lg mb-1">{docType?.icon || '📄'}</div>
                <p className="text-sm font-medium text-gray-900 truncate">{draft.title}</p>
                {draft.documentNo && <p className="text-xs text-gray-400 truncate">No. {draft.documentNo}</p>}
                <p className="text-xs text-gray-300 mt-1">{timeStr}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
