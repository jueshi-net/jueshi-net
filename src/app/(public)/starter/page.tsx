import Link from "next/link";
import { ArrowLeft, ExternalLink, Shield, AlertTriangle } from "lucide-react";
import { Metadata } from "next";
import { starterResources, starterCategories } from "@/lib/data/starter-resources";
import { ScenarioCardGrid } from "@/components/starter/scenario-card-grid";

export const metadata: Metadata = {
  title: "外网新手资源清单 — 海外百宝箱",
  description: "公开网站、软件、工具和学习平台的整理导航。浏览器、翻译、AI工具、密码管理、在线课程等，一次整理清楚。",
};

const categoryLabels: Record<string, string> = {
  starter: "新手必装",
  "ai-tools": "AI 工具",
  "video-learning": "视频学习",
  security: "账号安全",
  "browser-extensions": "浏览器插件",
};

const sectionAnchors: Record<string, string> = {
  starter: "starter",
  "ai-tools": "ai-tools",
  "video-learning": "learning",
  security: "security",
  "browser-extensions": "extensions",
};

const langLabels: Record<string, string> = {
  zh: "中文",
  en: "英文",
  multi: "多语言",
};

const platformLabels: Record<string, string> = {
  website: "网站",
  app: "App",
  "chrome-extension": "插件",
  video: "视频",
};

export default function StarterPage() {
  const grouped = starterCategories.map((cat) => ({
    ...cat,
    resources: starterResources.filter((r) => r.category === cat.id),
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">外网新手资源清单</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            公开网站、软件、工具和学习平台的整理导航。
            <br />
            不提供 VPN、代理节点或网络访问服务。
          </p>
        </div>

        {/* ===== 按场景开始 ===== */}
        <ScenarioCardGrid
          title="按场景开始"
          subtitle="不知道从哪开始？选一个适合你的场景，一站式工具包马上可用"
        />

        {/* Category nav */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {grouped.map((cat) => (
            <a
              key={cat.id}
              href={`#${sectionAnchors[cat.id]}`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              {cat.icon} {cat.name}
              <span className="ml-1 text-xs text-gray-400">({cat.resources.length})</span>
            </a>
          ))}
        </div>

        {/* Sections */}
        {grouped.map((cat) => (
          <section key={cat.id} id={sectionAnchors[cat.id]} className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span>{cat.icon}</span>
              {cat.name}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {categoryLabels[cat.id] || ""}
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.resources.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{r.title}</h3>
                    {r.isRecommended && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded font-medium">
                        推荐
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-3">{r.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {r.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                    {r.platform && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                        {platformLabels[r.platform] || r.platform}
                      </span>
                    )}
                    {r.language && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                        {langLabels[r.language] || r.language}
                      </span>
                    )}
                    {r.sourceType && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                        {r.sourceType === "official" ? "官网" : "第三方"}
                      </span>
                    )}
                  </div>

                  {/* Link */}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    前往官网
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">免责声明</p>
              <p className="mt-1">
                本站仅整理公开可用的软件、网站和学习平台，不提供任何 VPN、代理节点或网络访问服务。
                所有链接均指向官方网站，本站不对第三方服务的安全性、可用性或合法性作出任何保证。
                请用户自行判断和选择。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
