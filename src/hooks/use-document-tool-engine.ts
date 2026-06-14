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

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDraftLoader } from '@/lib/use-draft-loader';
import { trackEvent } from '@/lib/tracking';
import { usePermissions } from '@/lib/auth/client-permissions';
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
  const perms = usePermissions();

  const [data, setData] = useState<T>(defaultData);
  const [currentDocId, setCurrentDocId] = useState<string | null>(draftId);
  // Use ref as single source of truth to avoid stale closures in async saves
  const currentDocIdRef = useRef<string | null>(draftId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false); // guard against concurrent saves

  // Handle draft data loading
  const handleDraftData = useCallback((dataJson: string) => {
    try {
      const parsed = deserialize(JSON.parse(dataJson));
      setData((prev) => ({ ...prev, ...parsed } as T));
      
      if (draftId) {
        setCurrentDocId(draftId);
        currentDocIdRef.current = draftId;
      }

      onAfterRestore?.();
    } catch (e) {
      console.error('[useDocumentToolEngine] Failed to parse draft data:', e);
      setError('草稿数据格式错误');
    }
  }, [deserialize, draftId, onAfterRestore]);

  const { loadingDraft, draftError } = useDraftLoader(() => draftId, handleDraftData);

  useEffect(() => {
    if (draftError) {
      setError(draftError);
    }
  }, [draftError]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (savingRef.current) {
      console.log('[useDocumentToolEngine] save already in progress, skipping');
      return;
    }

    console.log('[useDocumentToolEngine] handleSave called', { toolKey, currentDocId: currentDocIdRef.current, hasValidate: !!validate });
    if (validate) {
      const result: DocumentToolValidationResult = validate(data);
      if (!result.valid) {
        console.log('[useDocumentToolEngine] validation failed', result.error);
        setError(result.error || '表单验证失败');
        return;
      }
    }

    console.log('[useDocumentToolEngine] setting saving=true');
    setSaving(true);
    savingRef.current = true;
    setError(null);
    setSaved(false);

    // Guest mode: save to localStorage
    if (!perms.authenticated && perms.role === 'guest') {
      try {
        const serializedData = serialize(data);
        const storageKey = `${toolKey}-draft`;
        localStorage.setItem(storageKey, JSON.stringify({
          data: serializedData,
          updatedAt: new Date().toISOString(),
        }));
        
        setSaved(true);
        setSaveMsg('💡 草稿已保存到本地浏览器');
        setTimeout(() => {
          setSaved(false);
          setSaveMsg(null);
        }, 3000);
        
        trackEvent('Document_Save', {
          toolSlug: toolKey,
          source: 'document_tool_engine',
          saveMode: 'localStorage',
        });
        
        alert('💡 草稿已保存到本地浏览器\n\n未登录时，草稿只会保存在当前浏览器。\n登录后即可永久保存，并跨设备同步。');
      } catch (e) {
        console.error('[useDocumentToolEngine] Failed to save to localStorage:', e);
        setError('本地保存失败');
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
      return;
    }

    // Snapshot the docId at call time to avoid stale closure
    const docId = currentDocIdRef.current;

    try {
      const serializedData = serialize(data);
      const payload = createDocumentPayload({
        toolKey: toolKey.replace(/-/g, '_'), // Map to snake_case for API tool_key column
        title: serializedData.title as string || `${toolKey} 草稿`,
        dataJson: JSON.stringify(serializedData),
        companyProfileId: serializedData.companyProfileId as string | undefined,
      });

      const method = docId ? 'PUT' : 'POST';
      const url = docId ? `/api/me/tool-documents/${docId}` : '/api/me/tool-documents';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (res.ok) {
        const result = await res.json();
        
        // If it's a new draft, update the currentDocId + URL
        if (!docId && result.data?.id) {
          const newId = result.data.id;
          setCurrentDocId(newId);
          currentDocIdRef.current = newId;

          // Update URL to include draftId without triggering navigation
          const newUrl = `${window.location.pathname}?draftId=${newId}`;
          window.history.replaceState(null, '', newUrl);
          
          // Trigger TrackEvent for Document_Save
          trackEvent('Document_Save', {
            toolSlug: toolKey,
            source: 'document_tool_engine',
            documentId: newId,
          });
        } else if (docId) {
          // Track PUT saves too
          trackEvent('Document_Save', {
            toolSlug: toolKey,
            source: 'document_tool_engine',
            documentId: docId,
          });
        }

        setSaved(true);
        setSaveMsg(docId ? '已更新草稿' : '已保存草稿');
        setTimeout(() => {
          setSaved(false);
          setSaveMsg(null);
        }, 3000);

        onAfterSave?.(result.data?.id || docId || '');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('请先登录后再保存到工作台');
          return;
        }
        throw new Error(errData.error || '保存失败');
      }
    } catch (e) {
      setError(mapApiErrorToMessage(e));
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [data, toolKey, serialize, validate, onAfterSave, perms.authenticated, perms.role]);

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
    setError,
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
