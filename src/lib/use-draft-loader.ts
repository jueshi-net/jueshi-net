import { useState, useEffect } from "react";

/**
 * Hook to load a draft by draftId from URL params.
 * Each tool provides its own loadDraftData function to populate its specific form fields.
 */
export function useDraftLoader(
  getDraftId: () => string | null,
  loadDraftData: (dataJson: string) => void
) {
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const draftId = getDraftId();
    if (!draftId) return;

    let cancelled = false;
    setLoadingDraft(true);
    setDraftError(null);

    fetch(`/api/me/tool-documents/${draftId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) { window.location.href = "/login"; return; }
          if (res.status === 404) { setDraftError("草稿不存在或无权访问"); return; }
          setDraftError("加载草稿失败");
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        const draft = json.data;
        if (draft?.dataJson) {
          loadDraftData(draft.dataJson);
          setDraftLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDraftError("网络错误，加载草稿失败");
      })
      .finally(() => {
        if (!cancelled) setLoadingDraft(false);
      });

    return () => { cancelled = true; };
  }, [getDraftId, loadDraftData]);

  return { loadingDraft, draftError, draftLoaded };
}
