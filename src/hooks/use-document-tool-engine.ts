/**
 * useDocumentToolEngine — 通用文档工具引擎 Hook
 *
 * Self-contained engine that handles:
 * - Draft loading (via useDraftLoader)
 * - localStorage auto-save (500ms debounce)
 * - Save draft (POST/PUT with serialize)
 * - Restore from history (with deserialize)
 * - Form reset
 * - Company Profile auto-fill
 * - openPrintWindow utility
 * - Event tracking (Tool_View, Document_Save, Document_Export)
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDraftLoader } from "@/lib/use-draft-loader";
import { trackEvent } from "@/lib/tracking";
import { CompanyProfile } from "@/components/document-tools/company-profile-picker";

interface UseDocumentToolEngineOptions<T extends object> {
  toolKey: string;
  defaultData: T;
  serialize: (data: T) => Record<string, unknown>;
  deserialize: (json: Record<string, unknown>) => Partial<T>;
  onAfterSave?: () => void;
  onAfterRestore?: () => void;
  getTitle?: (data: T) => string;
  draftId?: string | null;
}

export function useDocumentToolEngine<T extends object>(options: UseDocumentToolEngineOptions<T>) {
  const { toolKey, defaultData, serialize, deserialize, onAfterSave, onAfterRestore, getTitle, draftId } = options;

  const [data, setData] = useState<T>({ ...defaultData });
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(draftId || null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTrackedView = useRef(false);

  const localStorageKey = `doc_tool_${toolKey}`;

  // Load draft from URL param
  const loadDraftData = useCallback(
    (dataJson: string) => {
      try {
        const parsed = JSON.parse(dataJson) as Record<string, unknown>;
        const partial = deserialize(parsed);
        setData((prev) => ({ ...prev, ...partial }));
      } catch {
        // ignore
      }
    },
    [deserialize]
  );

  const { loadingDraft, draftError, draftLoaded } = useDraftLoader(() => draftId || null, loadDraftData);

  // Set currentDocId after draft loads
  useEffect(() => {
    if (draftLoaded && draftId) setCurrentDocId(draftId);
  }, [draftLoaded, draftId]);

  // Load from localStorage on mount (only if no draftId)
  useEffect(() => {
    if (draftId) return;
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        const partial = deserialize(parsed);
        setData((prev) => ({ ...prev, ...partial }));
      }
    } catch {
      // ignore
    }
  }, [draftId, localStorageKey, deserialize]);

  // Auto-save to localStorage with 500ms debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(localStorageKey, JSON.stringify(serialize(data)));
      } catch {
        // ignore
      }
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data, localStorageKey, serialize]);

  // Track Tool_View on mount (once)
  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      try {
        navigator.sendBeacon(
          "/api/events",
          JSON.stringify({
            event: "Tool_View",
            toolSlug: toolKey,
            source: "document_tool_engine",
            ts: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    }
  }, [toolKey]);

  // Handle Save
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setSaveMsg("");
    setError(null);
    try {
      const serialized = serialize(data);
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId
        ? `/api/me/tool-documents/${currentDocId}`
        : "/api/me/tool-documents";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolKey,
          title: getTitle ? getTitle(data) : `${toolKey} ${new Date().toISOString().split("T")[0]}`,
          dataJson: JSON.stringify(serialized),
          ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.data?.id && !currentDocId) setCurrentDocId(d.data.id);
        setSaved(true);
        setSaveMsg(currentDocId ? "已更新草稿" : "已保存草稿");
        setTimeout(() => setSaved(false), 3000);

        // Track Document_Save event
        try {
          navigator.sendBeacon(
            "/api/events",
            JSON.stringify({
              event: "Document_Save",
              toolSlug: toolKey,
              source: "document_tool_engine",
              ts: Date.now(),
            })
          );
        } catch {
          // ignore
        }

        onAfterSave?.();
      } else {
        const e = await res.json().catch(() => ({}));
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        setError(e.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    }
    setSaving(false);
  }, [currentDocId, data, selectedProfile, toolKey, getTitle, serialize, onAfterSave]);

  // Handle Restore from history
  const handleRestore = useCallback(
    (snapshotJson: string) => {
      try {
        const parsed = JSON.parse(snapshotJson) as Record<string, unknown>;
        // Try to extract the actual dataJson from the restore response
        // The restore endpoint returns the full document, so dataJson is nested
        const actualData = parsed.dataJson ? JSON.parse(parsed.dataJson as string) : parsed;
        const partial = deserialize(actualData);
        setData((prev) => ({ ...prev, ...partial }));
        setSaveMsg("已恢复历史版本，点击「保存草稿」确认");
        onAfterRestore?.();
      } catch {
        setError("恢复数据解析失败");
      }
    },
    [deserialize, onAfterRestore]
  );

  // Handle Reset
  const handleReset = useCallback(() => {
    if (confirm("确定要清空所有内容吗？")) {
      setData({ ...defaultData });
      localStorage.removeItem(localStorageKey);
      setCurrentDocId(null);
      setSelectedProfile(null);
      setSaved(false);
      setSaveMsg("");
      setError(null);
    }
  }, [defaultData, localStorageKey]);

  // openPrintWindow utility
  const openPrintWindow = useCallback((title: string, contentHtml: string, styles: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      `<html><head><title>${title}</title><style>${styles}</style></head><body>${contentHtml}</body></html>`
    );
    win.document.close();
    win.print();
  }, []);

  return {
    data,
    setData,
    loadingDraft,
    error: error || draftError,
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
