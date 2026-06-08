/**
 * useDocumentToolEngine Hook
 * 
 * Core engine hook that abstracts common document tool logic:
 * - Draft loading & restoration
 * - Save state & API interaction
 * - Form reset
 * - Print window handling
 * 
 * Composes useDraftLoader for draft retrieval.
 */

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDraftLoader } from '@/lib/use-draft-loader';
import { trackEvent } from '@/lib/tracking';
import { 
  DocumentToolEngineOptions, 
  DocumentToolEngineResult,
  DocumentToolValidationResult 
} from '@/types/document-tool';
import { createDocumentPayload, mapApiErrorToMessage, buildPrintWindowHtml } from '@/lib/document-tools/document-tool-helpers';

export function useDocumentToolEngine<T extends object>({
  toolKey,
  defaultData,
  serialize,
  deserialize,
  validate,
  onAfterSave,
  onAfterRestore,
}: DocumentToolEngineOptions<T>): DocumentToolEngineResult<T> {
  const searchParams = useSearchParams();
  const draftId = searchParams?.get('draftId') ?? null;

  const [data, setData] = useState<T>(defaultData);
  const [currentDocId, setCurrentDocId] = useState<string | null>(draftId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle draft data loading
  const handleDraftData = useCallback((dataJson: string) => {
    try {
      const parsed = deserialize(JSON.parse(dataJson));
      setData((prev) => ({ ...prev, ...parsed } as T));
      
      if (draftId) {
        setCurrentDocId(draftId);
      }

      onAfterRestore?.();
    } catch (e) {
      console.error('[useDocumentToolEngine] Failed to parse draft data:', e);
      setError('草稿数据格式错误');
    }
  }, [deserialize, draftId, onAfterRestore]);

  const { loadingDraft, draftError } = useDraftLoader(() => draftId, (dataJson: string) => {
    handleDraftData(dataJson);
  });

  useEffect(() => {
    if (draftError) {
      setError(draftError);
    }
  }, [draftError]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (validate) {
      const result: DocumentToolValidationResult = validate(data);
      if (!result.valid) {
        setError(result.error || '表单验证失败');
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const serializedData = serialize(data);
      const payload = createDocumentPayload({
        toolKey: toolKey.replace(/-/g, '_'), // Map to snake_case for API tool_key column
        title: serializedData.title as string || `${toolKey} 草稿`,
        dataJson: JSON.stringify(serializedData),
        companyProfileId: serializedData.companyProfileId as string | undefined,
      });

      const method = currentDocId ? 'PUT' : 'POST';
      const url = currentDocId ? `/api/me/tool-documents/${currentDocId}` : '/api/me/tool-documents';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        
        // If it's a new draft, update the currentDocId
        if (!currentDocId && result.data?.id) {
          setCurrentDocId(result.data.id);
          
          // Trigger TrackEvent for Document_Save
          trackEvent('Document_Save', {
            toolSlug: toolKey,
            source: 'tool_engine',
            documentId: result.data.id,
          });
        }

        setSaved(true);
        setSaveMsg(currentDocId ? '已更新草稿' : '已保存草稿');
        setTimeout(() => {
          setSaved(false);
          setSaveMsg(null);
        }, 3000);

        onAfterSave?.(result.data?.id || currentDocId || '');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(errData.error || '保存失败');
      }
    } catch (e) {
      setError(mapApiErrorToMessage(e));
    } finally {
      setSaving(false);
    }
  }, [data, toolKey, serialize, validate, currentDocId, onAfterSave]);

  // Restore handler (called from ToolHistoryPanel)
  const handleRestore = useCallback((dataJson: string) => {
    handleDraftData(dataJson);
  }, [handleDraftData]);

  // Reset handler
  const handleReset = useCallback(() => {
    if (window.confirm('确定要清空所有内容吗？')) {
      setData(defaultData);
      setCurrentDocId(null);
      setSaved(false);
      setSaveMsg(null);
      setError(null);
      onAfterRestore?.();
    }
  }, [defaultData, onAfterRestore]);

  // Print helper
  const openPrintWindow = useCallback((title: string, contentHtml: string, styles: string) => {
    const win = window.open('', '_blank');
    if (!win) {
      setError('请允许浏览器打开弹出窗口以进行打印');
      return;
    }
    win.document.write(buildPrintWindowHtml({ title, contentHtml, styles }));
    win.document.close();
    win.print();
  }, []);

  return {
    data,
    setData,
    loadingDraft,
    error,
    saving,
    saved,
    saveMsg,
    currentDocId,
    handleSave,
    handleRestore,
    handleReset,
    openPrintWindow,
  };
}
