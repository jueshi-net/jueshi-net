"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, Building2, FileText, Loader2, Eye, Video, Download } from "lucide-react";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";
import { useDraftLoader } from "@/lib/use-draft-loader";

const PLATFORMS = ["小红书", "TikTok", "Facebook", "Instagram", "YouTube Shorts", "其他"] as const;
const VIDEO_TYPES = ["物流科普", "产品介绍", "客户案例", "仓库实拍", "报价解释", "避坑提醒", "教程类", "其他"] as const;

interface FormData {
  title: string;
  platform: string;
  videoType: string;
  targetAudience: string;
  coreSellingPoint: string;
  ctaText: string;
  hook: string;
  painPoint: string;
  solution: string;
  sellingPoint1: string;
  sellingPoint2: string;
  sellingPoint3: string;
  visualSuggestion: string;
  voiceoverScript: string;
  subtitleScript: string;
  endingCta: string;
  scenePrep: string;
  propPrep: string;
  shotList: string;
  shootingNotes: string;
  editingNotes: string;
  publishChecklist: string;
}

const emptyForm: FormData = {
  title: "",
  platform: "",
  videoType: "",
  targetAudience: "",
  coreSellingPoint: "",
  ctaText: "",
  hook: "",
  painPoint: "",
  solution: "",
  sellingPoint1: "",
  sellingPoint2: "",
  sellingPoint3: "",
  visualSuggestion: "",
  voiceoverScript: "",
  subtitleScript: "",
  endingCta: "",
  scenePrep: "",
  propPrep: "",
  shotList: "",
  shootingNotes: "",
  editingNotes: "",
  publishChecklist: "",
};

export default function VideoScriptSopClient({ draftId }: { draftId: string | null }) {
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load draft from URL param
  const loadDraftData = useCallback((dataJson: string) => {
    try {
      const d = JSON.parse(dataJson);
      setForm((prev) => ({ ...prev, ...d }));
    } catch { /* ignore */ }
  }, []);

  const { loadingDraft, draftError, draftLoaded } = useDraftLoader(() => draftId, loadDraftData);

  useEffect(() => {
    if (draftLoaded && draftId) setCurrentDocId(draftId);
  }, [draftLoaded, draftId]);

  // Load draft from localStorage on mount (only if no draftId)
  useEffect(() => {
    if (draftId) return;
    try {
      const saved = localStorage.getItem("video-script-sop-draft");
      if (saved) {
        const d = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...d }));
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem("video-script-sop-draft", JSON.stringify(form));
    }, 500);
    return () => clearTimeout(t);
  }, [form]);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSelect = useCallback((profile: CompanyProfile) => {
    setSelectedProfile(profile);
    if (!form.title) update("title", profile.companyName + " 短视频脚本");
    if (!form.ctaText && (profile.phone || profile.email)) {
      const parts: string[] = [];
      if (profile.phone) parts.push("电话: " + profile.phone);
      if (profile.email) parts.push("邮箱: " + profile.email);
      if (profile.website) parts.push("网站: " + profile.website);
      update("ctaText", parts.join(" | "));
    }
    if (!form.sellingPoint1 && profile.companyName) {
      update("sellingPoint1", profile.companyName + " 专业提供跨境物流服务");
    }
  }, [form.title, form.ctaText, form.sellingPoint1]);

  const handleSave = async () => {
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
          toolKey: "video-script-sop",
          title: form.title || "短视频 SOP 脚本草稿",
          dataJson: JSON.stringify({ ...form, selectedCompanyId: selectedProfile?.id || null, selectedCompanyName: selectedProfile?.companyName || null }),
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
  };

  const handleRestore = useCallback((snapshotJson: string) => {
    try {
      const d = JSON.parse(snapshotJson);
      // Restore form fields (filter out metadata fields)
      const { selectedCompanyId, selectedCompanyName, ...rest } = d as Record<string, unknown>;
      setForm((prev) => ({ ...prev, ...rest }));
      setSaveMsg("已恢复历史版本，点击「保存草稿」确认");
    } catch {
      setSaveMsg("恢复数据解析失败");
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm("确定要清空所有填写内容吗？")) {
      setForm({ ...emptyForm });
      localStorage.removeItem("video-script-sop-draft");
    }
  };

  // Preview text generation
  const generatePreview = () => {
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════");
    lines.push("       短视频 SOP 脚本文档");
    lines.push("═══════════════════════════════════════════");
    lines.push("");
    lines.push("📋 基础信息");
    lines.push("───────────────────────────────────────────");
    if (form.title) lines.push(`视频标题: ${form.title}`);
    if (selectedProfile) lines.push(`品牌/公司: ${selectedProfile.companyName}`);
    if (form.platform) lines.push(`发布平台: ${form.platform}`);
    if (form.videoType) lines.push(`视频类型: ${form.videoType}`);
    if (form.targetAudience) lines.push(`目标受众: ${form.targetAudience}`);
    if (form.coreSellingPoint) lines.push(`核心卖点: ${form.coreSellingPoint}`);
    if (form.ctaText) lines.push(`CTA 引导: ${form.ctaText}`);
    lines.push("");
    lines.push("🎬 脚本结构");
    lines.push("───────────────────────────────────────────");
    if (form.hook) lines.push(`【开头 3 秒钩子】\n${form.hook}`);
    if (form.painPoint) lines.push(`【痛点描述】\n${form.painPoint}`);
    if (form.solution) lines.push(`【解决方案】\n${form.solution}`);
    if (form.sellingPoint1) lines.push(`【关键卖点 1】\n${form.sellingPoint1}`);
    if (form.sellingPoint2) lines.push(`【关键卖点 2】\n${form.sellingPoint2}`);
    if (form.sellingPoint3) lines.push(`【关键卖点 3】\n${form.sellingPoint3}`);
    if (form.visualSuggestion) lines.push(`【画面建议】\n${form.visualSuggestion}`);
    if (form.voiceoverScript) lines.push(`【口播文案】\n${form.voiceoverScript}`);
    if (form.subtitleScript) lines.push(`【字幕文案】\n${form.subtitleScript}`);
    if (form.endingCta) lines.push(`【结尾 CTA】\n${form.endingCta}`);
    lines.push("");
    lines.push("📸 拍摄 SOP");
    lines.push("───────────────────────────────────────────");
    if (form.scenePrep) lines.push(`【场景准备】\n${form.scenePrep}`);
    if (form.propPrep) lines.push(`【道具准备】\n${form.propPrep}`);
    if (form.shotList) lines.push(`【镜头清单】\n${form.shotList}`);
    if (form.shootingNotes) lines.push(`【拍摄注意事项】\n${form.shootingNotes}`);
    if (form.editingNotes) lines.push(`【剪辑注意事项】\n${form.editingNotes}`);
    if (form.publishChecklist) lines.push(`【发布前检查清单】\n${form.publishChecklist}`);
    lines.push("");
    lines.push("═══════════════════════════════════════════");
    lines.push("生成时间: " + new Date().toLocaleString("zh-CN"));
    if (selectedProfile) lines.push("公司资料: " + selectedProfile.companyName);
    lines.push("");
    return lines.join("\n");
  };

  const previewText = generatePreview();

  const textArea = (
    label: string,
    field: keyof FormData,
    placeholder: string,
    rows = 3,
    hint?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={form[field]}
        onChange={(e) => update(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y break-words whitespace-pre-wrap"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/tools/document-tools" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </Link>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-600" /> 短视频 SOP 脚本
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CompanyProfilePicker onSelect={handleProfileSelect} selectedId={selectedProfile?.id || null} />
            {currentDocId && (
              <ToolHistoryPanel documentId={currentDocId} toolKey="video-script-sop" onRestore={handleRestore} />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Editor */}
          <div className="flex-1 min-w-0 print:hidden">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6">
              {/* Section 1: Basic Info */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  基础信息
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">项目 / 视频标题</label>
                    <input
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="如：XX 物流 30 秒带货脚本"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]"
                    />
                  </div>
                  {selectedProfile && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>已选择：{selectedProfile.companyName}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">发布平台</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() => update("platform", form.platform === p ? "" : p)}
                          className={`px-3 py-1.5 rounded-lg text-sm border min-h-[44px] transition ${
                            form.platform === p
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">视频类型</label>
                    <div className="flex flex-wrap gap-2">
                      {VIDEO_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => update("videoType", form.videoType === t ? "" : t)}
                          className={`px-3 py-1.5 rounded-lg text-sm border min-h-[44px] transition ${
                            form.videoType === t
                              ? "bg-pink-600 text-white border-pink-600"
                              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {textArea("目标受众", "targetAudience", "如：25-40 岁跨境电商卖家、集运用户")}
                  {textArea("核心卖点", "coreSellingPoint", "一句话说清楚你的产品或服务最大的优势是什么")}
                  {textArea("CTA 联系方式 / 引导语", "ctaText", "如：私信我获取报价 / 点击下方链接")}
                </div>
              </div>

              {/* Section 2: Script Structure */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  脚本结构
                </h2>
                <div className="space-y-4">
                  {textArea("开头 3 秒钩子", "hook", "抓住观众注意力的第一句话，如：\"90% 的人不知道这个省钱方法\"", 2)}
                  {textArea("痛点描述", "painPoint", "描述目标用户遇到的具体问题和困扰")}
                  {textArea("解决方案", "solution", "你的产品/服务如何解决这个痛点")}
                  {textArea("关键卖点 1", "sellingPoint1", "第一个核心卖点", 2)}
                  {textArea("关键卖点 2", "sellingPoint2", "第二个核心卖点", 2)}
                  {textArea("关键卖点 3", "sellingPoint3", "第三个核心卖点（可选）", 2)}
                  {textArea("画面建议", "visualSuggestion", "每个段落建议拍什么画面、用什么镜头")}
                  {textArea("口播文案", "voiceoverScript", "完整的口播逐字稿", 4)}
                  {textArea("字幕文案", "subtitleScript", "视频字幕文字（可与口播一致或简化）", 4)}
                  {textArea("结尾 CTA", "endingCta", "引导观众行动的话术，如关注、私信、点击链接")}
                </div>
              </div>

              {/* Section 3: Shooting SOP */}
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  拍摄 SOP
                </h2>
                <div className="space-y-4">
                  {textArea("场景准备", "scenePrep", "需要准备的拍摄场地、背景布置、光线等")}
                  {textArea("道具准备", "propPrep", "需要用到的产品、包装盒、标签、道具等")}
                  {textArea("镜头清单", "shotList", "按顺序列出每个镜头的内容、角度、时长")}
                  {textArea("拍摄注意事项", "shootingNotes", "拍摄时需要特别注意的事项")}
                  {textArea("剪辑注意事项", "editingNotes", "剪辑时的要点、转场、配乐、字幕样式等")}
                  {textArea("发布前检查清单", "publishChecklist", "标题、标签、封面、描述、发布时间等检查项")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium min-h-[44px] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存草稿
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm min-h-[44px]"
                >
                  <Eye className="w-4 h-4" /> {showPreview ? "隐藏预览" : "显示预览"}
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm min-h-[44px]"
                >
                  <Printer className="w-4 h-4" /> 打印
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm min-h-[44px]"
                >
                  <Download className="w-4 h-4 rotate-180" /> 清空
                </button>
              </div>
              {loadingDraft && (
                <div className="text-sm px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 正在加载草稿...
                </div>
              )}
              {draftError && (
                <div className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">{draftError}</div>
              )}
              {saveMsg && (
                <div className={`text-sm px-3 py-2 rounded-lg ${saved ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {saveMsg}
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-full lg:w-96 xl:w-[28rem] shrink-0 print:w-full print:max-w-none">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 sticky top-4 print:static print:border-none print:p-0 print:shadow-none">
                <div className="flex items-center justify-between mb-3 print:hidden">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 预览
                  </h3>
                  <button onClick={handlePrint} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200 min-h-[36px] print:hidden">
                    <Printer className="w-3.5 h-3.5" /> 打印
                  </button>
                </div>
                <div
                  ref={previewRef}
                  className="bg-gray-50 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap break-words text-gray-800 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:bg-white print:p-0"
                >
                  {previewText || "填写内容后将在此生成预览..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print-only preview wrapper */}
      <div className="hidden print:block print:p-8">
        <pre className="text-sm whitespace-pre-wrap break-words font-mono text-gray-800">{previewText}</pre>
      </div>
    </div>
  );
}
