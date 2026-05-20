"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Printer, Building2, FileText, Loader2, Eye, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentToolBase } from "@/lib/use-document-tool-base";
import CompanyProfilePicker, { CompanyProfile } from "@/components/document-tools/company-profile-picker";
import ToolHistoryPanel from "@/components/document-tools/tool-history-panel";

// ─── Style constants (UI Design System) ───

const textareaStyles = {
  base: "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y break-words whitespace-pre-wrap",
  hint: "text-xs text-gray-400 mt-1",
};

const cardStyles = {
  base: "bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-6",
  section: "space-y-4",
  sectionHeader: "text-base font-bold text-gray-900 mb-3 flex items-center gap-2",
  sectionNumber: "w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-bold",
};

const buttonVariants = {
  primary: "inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium min-h-[44px] disabled:opacity-50 transition-colors",
  secondary: "inline-flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm min-h-[44px] transition-colors",
  chip: (active: boolean, color: "teal" | "pink") =>
    cn(
      "px-3 py-1.5 rounded-lg text-sm border min-h-[44px] transition-colors",
      active
        ? color === "teal"
          ? "bg-teal-600 text-white border-teal-600"
          : "bg-pink-600 text-white border-pink-600"
        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
    ),
  previewToggle: "inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 rounded hover:bg-gray-200 min-h-[36px] print:hidden transition-colors",
};

const inputStyles = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[44px]";

// ─── Constants ───

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

// ─── Sub-components ───

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={textareaStyles.base}
      />
      {hint && <p className={textareaStyles.hint}>{hint}</p>}
    </div>
  );
}

function ChipSelector({
  label,
  options,
  value,
  onChange,
  color = "teal",
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  color?: "teal" | "pink";
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={buttonVariants.chip(value === opt, color)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───

export default function VideoScriptSopClient({ draftId }: { draftId: string | null }) {
  const [showPreview, setShowPreview] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    form,
    setForm,
    update,
    selectedProfile,
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
  } = useDocumentToolBase<FormData>({
    toolKey: "video-script-sop",
    emptyForm,
    localStorageKey: "video-script-sop-draft",
    getTitle: (f) => (f as FormData).title || "短视频 SOP 脚本草稿",
    draftId,
  });

  // Preview text generation
  const generatePreview = useCallback(() => {
    const f = form as FormData;
    const lines: string[] = [];
    lines.push("═══════════════════════════════════════════");
    lines.push("       短视频 SOP 脚本文档");
    lines.push("═══════════════════════════════════════════");
    lines.push("");
    lines.push("📋 基础信息");
    lines.push("───────────────────────────────────────────");
    if (f.title) lines.push(`视频标题: ${f.title}`);
    if (selectedProfile) lines.push(`品牌/公司: ${selectedProfile.companyName}`);
    if (f.platform) lines.push(`发布平台: ${f.platform}`);
    if (f.videoType) lines.push(`视频类型: ${f.videoType}`);
    if (f.targetAudience) lines.push(`目标受众: ${f.targetAudience}`);
    if (f.coreSellingPoint) lines.push(`核心卖点: ${f.coreSellingPoint}`);
    if (f.ctaText) lines.push(`CTA 引导: ${f.ctaText}`);
    lines.push("");
    lines.push("🎬 脚本结构");
    lines.push("───────────────────────────────────────────");
    if (f.hook) lines.push(`【开头 3 秒钩子】\n${f.hook}`);
    if (f.painPoint) lines.push(`【痛点描述】\n${f.painPoint}`);
    if (f.solution) lines.push(`【解决方案】\n${f.solution}`);
    if (f.sellingPoint1) lines.push(`【关键卖点 1】\n${f.sellingPoint1}`);
    if (f.sellingPoint2) lines.push(`【关键卖点 2】\n${f.sellingPoint2}`);
    if (f.sellingPoint3) lines.push(`【关键卖点 3】\n${f.sellingPoint3}`);
    if (f.visualSuggestion) lines.push(`【画面建议】\n${f.visualSuggestion}`);
    if (f.voiceoverScript) lines.push(`【口播文案】\n${f.voiceoverScript}`);
    if (f.subtitleScript) lines.push(`【字幕文案】\n${f.subtitleScript}`);
    if (f.endingCta) lines.push(`【结尾 CTA】\n${f.endingCta}`);
    lines.push("");
    lines.push("📸 拍摄 SOP");
    lines.push("───────────────────────────────────────────");
    if (f.scenePrep) lines.push(`【场景准备】\n${f.scenePrep}`);
    if (f.propPrep) lines.push(`【道具准备】\n${f.propPrep}`);
    if (f.shotList) lines.push(`【镜头清单】\n${f.shotList}`);
    if (f.shootingNotes) lines.push(`【拍摄注意事项】\n${f.shootingNotes}`);
    if (f.editingNotes) lines.push(`【剪辑注意事项】\n${f.editingNotes}`);
    if (f.publishChecklist) lines.push(`【发布前检查清单】\n${f.publishChecklist}`);
    lines.push("");
    lines.push("═══════════════════════════════════════════");
    lines.push("生成时间: " + new Date().toLocaleString("zh-CN"));
    if (selectedProfile) lines.push("公司资料: " + selectedProfile.companyName);
    lines.push("");
    return lines.join("\n");
  }, [form, selectedProfile]);

  const previewText = generatePreview();

  const f = form as FormData;

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
            <div className={cardStyles.base}>
              {/* Section 1: Basic Info */}
              <div>
                <h2 className={cardStyles.sectionHeader}>
                  <span className={cardStyles.sectionNumber}>1</span>
                  基础信息
                </h2>
                <div className={cardStyles.section}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">项目 / 视频标题</label>
                    <input
                      value={f.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="如：XX 物流 30 秒带货脚本"
                      className={inputStyles}
                    />
                  </div>
                  {selectedProfile && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm text-teal-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 shrink-0" />
                      <span>已选择：{selectedProfile.companyName}</span>
                    </div>
                  )}
                  <ChipSelector
                    label="发布平台"
                    options={PLATFORMS}
                    value={f.platform}
                    onChange={(v) => update("platform", v)}
                    color="teal"
                  />
                  <ChipSelector
                    label="视频类型"
                    options={VIDEO_TYPES}
                    value={f.videoType}
                    onChange={(v) => update("videoType", v)}
                    color="pink"
                  />
                  <TextArea
                    label="目标受众"
                    value={f.targetAudience}
                    onChange={(v) => update("targetAudience", v)}
                    placeholder="如：25-40 岁跨境电商卖家、集运用户"
                  />
                  <TextArea
                    label="核心卖点"
                    value={f.coreSellingPoint}
                    onChange={(v) => update("coreSellingPoint", v)}
                    placeholder="一句话说清楚你的产品或服务最大的优势是什么"
                  />
                  <TextArea
                    label="CTA 联系方式 / 引导语"
                    value={f.ctaText}
                    onChange={(v) => update("ctaText", v)}
                    placeholder="如：私信我获取报价 / 点击下方链接"
                  />
                </div>
              </div>

              {/* Section 2: Script Structure */}
              <div>
                <h2 className={cardStyles.sectionHeader}>
                  <span className={cardStyles.sectionNumber}>2</span>
                  脚本结构
                </h2>
                <div className={cardStyles.section}>
                  <TextArea
                    label="开头 3 秒钩子"
                    value={f.hook}
                    onChange={(v) => update("hook", v)}
                    placeholder="抓住观众注意力的第一句话，如：90% 的人不知道这个省钱方法"
                    rows={2}
                  />
                  <TextArea
                    label="痛点描述"
                    value={f.painPoint}
                    onChange={(v) => update("painPoint", v)}
                    placeholder="描述目标用户遇到的具体问题和困扰"
                  />
                  <TextArea
                    label="解决方案"
                    value={f.solution}
                    onChange={(v) => update("solution", v)}
                    placeholder="你的产品/服务如何解决这个痛点"
                  />
                  <TextArea
                    label="关键卖点 1"
                    value={f.sellingPoint1}
                    onChange={(v) => update("sellingPoint1", v)}
                    placeholder="第一个核心卖点"
                    rows={2}
                  />
                  <TextArea
                    label="关键卖点 2"
                    value={f.sellingPoint2}
                    onChange={(v) => update("sellingPoint2", v)}
                    placeholder="第二个核心卖点"
                    rows={2}
                  />
                  <TextArea
                    label="关键卖点 3"
                    value={f.sellingPoint3}
                    onChange={(v) => update("sellingPoint3", v)}
                    placeholder="第三个核心卖点（可选）"
                    rows={2}
                  />
                  <TextArea
                    label="画面建议"
                    value={f.visualSuggestion}
                    onChange={(v) => update("visualSuggestion", v)}
                    placeholder="每个段落建议拍什么画面、用什么镜头"
                  />
                  <TextArea
                    label="口播文案"
                    value={f.voiceoverScript}
                    onChange={(v) => update("voiceoverScript", v)}
                    placeholder="完整的口播逐字稿"
                    rows={4}
                  />
                  <TextArea
                    label="字幕文案"
                    value={f.subtitleScript}
                    onChange={(v) => update("subtitleScript", v)}
                    placeholder="视频字幕文字（可与口播一致或简化）"
                    rows={4}
                  />
                  <TextArea
                    label="结尾 CTA"
                    value={f.endingCta}
                    onChange={(v) => update("endingCta", v)}
                    placeholder="引导观众行动的话术，如关注、私信、点击链接"
                  />
                </div>
              </div>

              {/* Section 3: Shooting SOP */}
              <div>
                <h2 className={cardStyles.sectionHeader}>
                  <span className={cardStyles.sectionNumber}>3</span>
                  拍摄 SOP
                </h2>
                <div className={cardStyles.section}>
                  <TextArea
                    label="场景准备"
                    value={f.scenePrep}
                    onChange={(v) => update("scenePrep", v)}
                    placeholder="需要准备的拍摄场地、背景布置、光线等"
                  />
                  <TextArea
                    label="道具准备"
                    value={f.propPrep}
                    onChange={(v) => update("propPrep", v)}
                    placeholder="需要用到的产品、包装盒、标签、道具等"
                  />
                  <TextArea
                    label="镜头清单"
                    value={f.shotList}
                    onChange={(v) => update("shotList", v)}
                    placeholder="按顺序列出每个镜头的内容、角度、时长"
                  />
                  <TextArea
                    label="拍摄注意事项"
                    value={f.shootingNotes}
                    onChange={(v) => update("shootingNotes", v)}
                    placeholder="拍摄时需要特别注意的事项"
                  />
                  <TextArea
                    label="剪辑注意事项"
                    value={f.editingNotes}
                    onChange={(v) => update("editingNotes", v)}
                    placeholder="剪辑时的要点、转场、配乐、字幕样式等"
                  />
                  <TextArea
                    label="发布前检查清单"
                    value={f.publishChecklist}
                    onChange={(v) => update("publishChecklist", v)}
                    placeholder="标题、标签、封面、描述、发布时间等检查项"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={buttonVariants.primary}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  保存草稿
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={buttonVariants.secondary}
                >
                  <Eye className="w-4 h-4" /> {showPreview ? "隐藏预览" : "显示预览"}
                </button>
                <button
                  onClick={() => window.print()}
                  className={buttonVariants.secondary}
                >
                  <Printer className="w-4 h-4" /> 打印
                </button>
                <button
                  onClick={handleReset}
                  className={buttonVariants.secondary}
                >
                  <Printer className="w-4 h-4 rotate-180" /> 清空
                </button>
              </div>

              {/* Status messages */}
              {loadingDraft && (
                <div className="text-sm px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 正在加载草稿...
                </div>
              )}
              {draftError && (
                <div className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {draftError}
                </div>
              )}
              {saveMsg && (
                <div
                  className={cn(
                    "text-sm px-3 py-2 rounded-lg border",
                    saved
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}
                >
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
                  <button
                    onClick={() => window.print()}
                    className={buttonVariants.previewToggle}
                  >
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
        <pre className="text-sm whitespace-pre-wrap break-words font-mono text-gray-800">
          {previewText}
        </pre>
      </div>
    </div>
  );
}
