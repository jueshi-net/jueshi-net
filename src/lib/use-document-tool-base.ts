"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDraftLoader } from "./use-draft-loader";
import { CompanyProfile } from "@/components/document-tools/company-profile-picker";

interface UseDocumentToolBaseOptions<T extends object> {
  toolKey: string;
  emptyForm: T;
  localStorageKey: string;
  getTitle: (form: T) => string;
  draftId: string | null;
}

interface UseDocumentToolBaseReturn<T extends object> {
  form: T;
  setForm: React.Dispatch<React.SetStateAction<T>>;
  update: (field: keyof T, value: string) => void;
  reset: () => void;
  selectedProfile: CompanyProfile | null;
  setSelectedProfile: React.Dispatch<React.SetStateAction<CompanyProfile | null>>;
  handleProfileSelect: (profile: CompanyProfile) => void;
  currentDocId: string | null;
  saving: boolean;
  saved: boolean;
  saveMsg: string;
  loadingDraft: boolean;
  draftError: string | null;
  handleSave: () => Promise<void>;
  handleRestore: (snapshotJson: string) => void;
  handleReset: () => void;
}

/**
 * useDocumentToolBase — 通用文档工具基础 Hook
 *
 * 封装了：
 * - draft 加载（useDraftLoader）
 * - localStorage 自动保存（500ms debounce）
 * - 保存草稿（POST/PUT）
 * - 恢复历史版本
 * - Profile 自动填充
 * - 表单 reset
 */
export function useDocumentToolBase<T extends object>(
  options: UseDocumentToolBaseOptions<T>
): UseDocumentToolBaseReturn<T> {
  const { toolKey, emptyForm, localStorageKey, getTitle, draftId } = options;

  const [form, setForm] = useState<T>({ ...emptyForm });
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft from URL param
  const loadDraftData = useCallback(
    (dataJson: string) => {
      try {
        const d = JSON.parse(dataJson) as Partial<T>;
        setForm((prev) => ({ ...prev, ...d }));
      } catch {
        /* ignore */
      }
    },
    []
  );

  const { loadingDraft, draftError, draftLoaded } = useDraftLoader(() => draftId, loadDraftData);

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
        const d = JSON.parse(saved) as Partial<T>;
        setForm((prev) => ({ ...prev, ...d }));
      }
    } catch {
      /* ignore */
    }
  }, [draftId, localStorageKey]);

  // Auto-save to localStorage with 500ms debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(form));
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, localStorageKey]);

  const update = useCallback(
    (field: keyof T, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleProfileSelect = useCallback(
    (profile: CompanyProfile) => {
      setSelectedProfile(profile);
      // Auto-fill: title
      if (!(form as Record<string, unknown>).title) {
        setForm((prev) => ({ ...prev, title: profile.companyName + " 短视频脚本" } as T));
      }
      // Auto-fill: CTA
      if (
        !(form as Record<string, unknown>).ctaText &&
        (profile.phone || profile.email)
      ) {
        const parts: string[] = [];
        if (profile.phone) parts.push("电话: " + profile.phone);
        if (profile.email) parts.push("邮箱: " + profile.email);
        if (profile.website) parts.push("网站: " + profile.website);
        setForm((prev) => ({ ...prev, ctaText: parts.join(" | ") } as T));
      }
      // Auto-fill: sellingPoint1
      if (
        !(form as Record<string, unknown>).sellingPoint1 &&
        profile.companyName
      ) {
        setForm((prev) => ({
          ...prev,
          sellingPoint1: profile.companyName + " 专业提供跨境物流服务",
        } as T));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [(form as Record<string, unknown>).title, (form as Record<string, unknown>).ctaText, (form as Record<string, unknown>).sellingPoint1]
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setSaveMsg("");
    try {
      const method = currentDocId ? "PUT" : "POST";
      const url = currentDocId
        ? `/api/me/tool-documents/${currentDocId}`
        : "/api/me/tool-documents";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolKey,
          title: getTitle(form),
          dataJson: JSON.stringify({
            ...form,
            selectedCompanyId: selectedProfile?.id || null,
            selectedCompanyName: selectedProfile?.companyName || null,
          }),
          ...(selectedProfile?.id && { companyProfileId: selectedProfile.id }),
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.data?.id && !currentDocId) setCurrentDocId(d.data.id);
        setSaved(true);
        setSaveMsg("已保存草稿");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const e = await res.json().catch(() => ({}));
        setSaveMsg(e.error || "保存失败");
      }
    } catch {
      setSaveMsg("网络错误");
    }
    setSaving(false);
  }, [currentDocId, form, selectedProfile, toolKey, getTitle]);

  const handleRestore = useCallback(
    (snapshotJson: string) => {
      try {
        const d = JSON.parse(snapshotJson) as Record<string, unknown>;
        // Restore form fields (filter out metadata fields)
        const { selectedCompanyId, selectedCompanyName, ...rest } = d;
        setForm((prev) => ({ ...prev, ...(rest as Partial<T>) }));
        setSaveMsg("已恢复历史版本，点击「保存草稿」确认");
      } catch {
        setSaveMsg("恢复数据解析失败");
      }
    },
    []
  );

  const reset = useCallback(() => {
    setForm({ ...emptyForm });
  }, [emptyForm]);

  const handleReset = useCallback(() => {
    if (confirm("确定要清空所有填写内容吗？")) {
      setForm({ ...emptyForm });
      localStorage.removeItem(localStorageKey);
    }
  }, [emptyForm, localStorageKey]);

  return {
    form,
    setForm,
    update,
    reset,
    selectedProfile,
    setSelectedProfile,
    handleProfileSelect,
    currentDocId,
    saving,
    saved,
    saveMsg,
    loadingDraft,
    draftError,
    handleSave,
    handleRestore,
    handleReset,
  };
}
