"use client";
import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Bug, Lightbulb, HelpCircle } from "lucide-react";

const typeOptions = [
  { value: "suggestion", label: "功能建议", icon: Lightbulb, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { value: "bug", label: "问题反馈", icon: Bug, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { value: "question", label: "使用咨询", icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
];

export default function FeedbackPage() {
  const [type, setType] = useState("suggestion");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, url: url || window.location.href })
      });

      if (res.ok) {
        setSuccess(true);
        setContent("");
        setUrl("");
      }
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">感谢反馈！</h2>
        <p className="text-gray-500 mb-6">我们会认真处理每一条反馈</p>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          继续提交
        </button>
      </div>
    );
  }

  const selectedType = typeOptions.find(t => t.value === type);
  const Icon = selectedType?.icon || Lightbulb;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">意见反馈</h1>
          <p className="text-sm text-gray-500">您的建议是我们进步的动力</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        {/* Type Selection */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">反馈类型</label>
          <div className="grid grid-cols-3 gap-3">
            {typeOptions.map(opt => {
              const OptIcon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    type === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                  }`}
                >
                  <OptIcon className={`w-6 h-6 mx-auto mb-1 ${opt.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            <span className="flex items-center gap-1">
              <Icon className="w-4 h-4" />
              详细内容
            </span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            placeholder="请详细描述您的反馈..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-y"
            required
          />
        </div>

        {/* URL (optional) */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">相关页面 (可选)</label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? "提交中..." : "提交反馈"}
        </button>
      </form>
    </div>
  );
}
