import Link from "next/link";
import { ArrowLeft, ExternalLink, AlertTriangle, Download } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "热门软件与网站推荐 — 海外百宝箱",
  description: "外网最常用的社交、视频、资讯平台与工具，一键直达。Telegram、YouTube、X、Instagram、Facebook 等。",
};

interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  platform: string[];
  color: string;
}

const appCategories = [
  { id: "social", name: "社交与通讯", icon: "💬" },
  { id: "video", name: "视频与内容", icon: "🎬" },
  { id: "shopping", name: "购物与生活", icon: "🛒" },
  { id: "productivity", name: "效率与工具", icon: "🛠️" },
];

const apps: AppItem[] = [
  // 社交与通讯
  {
    id: "telegram",
    name: "Telegram",
    description: "安全即时通讯，群组和频道功能强大",
    url: "https://telegram.org/",
    icon: "✈️",
    category: "social",
    platform: ["iOS", "Android", "Windows", "Mac", "Web"],
    color: "bg-blue-50 border-blue-100",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "全球最流行的即时通讯工具",
    url: "https://www.whatsapp.com/",
    icon: "📱",
    category: "social",
    platform: ["iOS", "Android", "Web"],
    color: "bg-green-50 border-green-100",
  },
  {
    id: "discord",
    name: "Discord",
    description: "社群语音聊天和文字交流",
    url: "https://discord.com/",
    icon: "🎮",
    category: "social",
    platform: ["iOS", "Android", "Windows", "Mac", "Web"],
    color: "bg-indigo-50 border-indigo-100",
  },
  {
    id: "signal",
    name: "Signal",
    description: "端到端加密通讯，隐私保护首选",
    url: "https://signal.org/",
    icon: "🔒",
    category: "social",
    platform: ["iOS", "Android"],
    color: "bg-blue-50 border-blue-100",
  },
  // 视频与内容
  {
    id: "youtube",
    name: "YouTube",
    description: "全球最大视频平台，免费学习资源极其丰富",
    url: "https://www.youtube.com/",
    icon: "▶️",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-red-50 border-red-100",
  },
  {
    id: "x",
    name: "X（Twitter）",
    description: "全球实时资讯和社交媒体平台",
    url: "https://x.com/",
    icon: "𝕏",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-gray-50 border-gray-100",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "图片视频分享社交平台",
    url: "https://www.instagram.com/",
    icon: "📸",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-pink-50 border-pink-100",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "海外版抖音，短视频社交平台",
    url: "https://www.tiktok.com/",
    icon: "🎵",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-gray-50 border-gray-100",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "全球最大社交网络",
    url: "https://www.facebook.com/",
    icon: "👥",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-blue-50 border-blue-100",
  },
  {
    id: "reddit",
    name: "Reddit",
    description: "全球最大社区论坛，覆盖所有兴趣领域",
    url: "https://www.reddit.com/",
    icon: "🤖",
    category: "video",
    platform: ["iOS", "Android", "Web"],
    color: "bg-orange-50 border-orange-100",
  },
  // 购物与生活
  {
    id: "amazon",
    name: "Amazon",
    description: "全球最大电商平台",
    url: "https://www.amazon.com/",
    icon: "📦",
    category: "shopping",
    platform: ["iOS", "Android", "Web"],
    color: "bg-yellow-50 border-yellow-100",
  },
  {
    id: "google-maps",
    name: "Google Maps",
    description: "全球地图导航，找路找地址必备",
    url: "https://maps.google.com/",
    icon: "🗺️",
    category: "shopping",
    platform: ["iOS", "Android", "Web"],
    color: "bg-green-50 border-green-100",
  },
  {
    id: "uber",
    name: "Uber",
    description: "海外打车必备",
    url: "https://www.uber.com/",
    icon: "🚗",
    category: "shopping",
    platform: ["iOS", "Android"],
    color: "bg-gray-50 border-gray-100",
  },
  {
    id: "google-pay",
    name: "Google Pay / Apple Pay",
    description: "海外常用移动支付工具",
    url: "https://pay.google.com/",
    icon: "💳",
    category: "shopping",
    platform: ["iOS", "Android"],
    color: "bg-blue-50 border-blue-100",
  },
  // 效率与工具
  {
    id: "google-drive",
    name: "Google Drive",
    description: "云盘存储，15GB 免费空间",
    url: "https://drive.google.com/",
    icon: "☁️",
    category: "productivity",
    platform: ["iOS", "Android", "Web"],
    color: "bg-blue-50 border-blue-100",
  },
  {
    id: "deepl",
    name: "DeepL",
    description: "高质量 AI 翻译工具",
    url: "https://www.deepl.com/",
    icon: "🌐",
    category: "productivity",
    platform: ["iOS", "Android", "Web"],
    color: "bg-blue-50 border-blue-100",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "AI 对话助手，写作、编程、翻译",
    url: "https://chatgpt.com/",
    icon: "🤖",
    category: "productivity",
    platform: ["iOS", "Android", "Web"],
    color: "bg-green-50 border-green-100",
  },
  {
    id: "notion",
    name: "Notion",
    description: "全能笔记和知识库",
    url: "https://www.notion.so/",
    icon: "📝",
    category: "productivity",
    platform: ["iOS", "Android", "Windows", "Mac", "Web"],
    color: "bg-gray-50 border-gray-100",
  },
];

export default function PopularAppsPage() {
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
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">热门软件与网站</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            外网最常用的社交、视频、资讯平台与效率工具，一键直达。
          </p>
        </div>

        {/* Category nav */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {appCategories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              {cat.icon} {cat.name}
            </a>
          ))}
        </div>

        {/* Sections */}
        {appCategories.map((cat) => {
          const catApps = apps.filter((a) => a.category === cat.id);
          return (
            <section key={cat.id} id={cat.id} className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.name}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {catApps.map((app) => (
                  <div
                    key={app.id}
                    className={`rounded-xl border p-4 ${app.color} hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{app.icon}</span>
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {app.description}
                    </p>

                    {/* Platform tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.platform.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 bg-white/70 text-gray-500 text-xs rounded"
                        >
                          {p}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      前往下载
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">温馨提示</p>
              <p className="mt-1">
                以上均为公开可用的软件与平台，所有链接均指向官方网站。
                请从官方渠道下载安装，注意保护个人信息安全。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
