import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "更新日志 | 海外百宝箱",
  description: "海外百宝箱的版本更新历史记录",
};

const changelogs = [
  {
    version: "v0.12.0",
    date: "2026-05-04",
    tag: "最新",
    tagColor: "bg-green-100 text-green-700",
    changes: [
      { type: "feat", desc: "站点地图自动生成 (/sitemap.xml)" },
      { type: "feat", desc: "RSS 订阅源 (/rss.xml)" },
      { type: "feat", desc: "robots.txt 动态生成" },
      { type: "feat", desc: "Dark Mode 深色模式支持" },
      { type: "feat", desc: "主题切换按钮（Header）" },
      { type: "feat", desc: "邮件订阅系统 (/api/subscribe)" },
      { type: "feat", desc: "Webhook 集成 (/api/webhooks)" },
      { type: "feat", desc: "后台系统设置页 (/admin/settings)" },
      { type: "improve", desc: "全局 CSS 变量支持深色模式" },
      { type: "improve", desc: "Header/Footer 深色模式适配" },
    ]
  },
  {
    version: "v0.11.0",
    date: "2026-05-04",
    tag: "数据可视化",
    tagColor: "bg-blue-100 text-blue-700",
    changes: [
      { type: "feat", desc: "管理面板数据图表 (Recharts)" },
      { type: "feat", desc: "分类分布饼图" },
      { type: "feat", desc: "热门链接柱状图" },
      { type: "feat", desc: "统计 API (/api/stats)" },
      { type: "feat", desc: "后台快捷操作区" },
      { type: "improve", desc: "管理面板改为客户端渲染" },
    ]
  },
  {
    version: "v0.10.0",
    date: "2026-05-04",
    tag: "SEO 优化",
    tagColor: "bg-purple-100 text-purple-700",
    changes: [
      { type: "feat", desc: "广告管理卡片视图" },
      { type: "feat", desc: "404 美化页面" },
      { type: "feat", desc: "链接 Favicon 自动获取" },
      { type: "feat", desc: "Favicon 代理服务 (/api/favicon)" },
      { type: "improve", desc: "LinkCard 组件 favicon 集成" },
    ]
  },
  {
    version: "v0.9.0",
    date: "2026-05-04",
    tag: "功能完善",
    tagColor: "bg-orange-100 text-orange-700",
    changes: [
      { type: "feat", desc: "用户管理 CRUD (/admin/users)" },
      { type: "feat", desc: "文章管理 PUT/DELETE API" },
      { type: "feat", desc: "首页最新文章展示" },
      { type: "feat", desc: "后台链接点击数排序" },
      { type: "improve", desc: "博客 SEO meta 标签" },
      { type: "improve", desc: "注册成功提示优化" },
    ]
  },
  {
    version: "v0.8.0",
    date: "2026-05-04",
    tag: "权限+导出",
    tagColor: "bg-red-100 text-red-700",
    changes: [
      { type: "feat", desc: "链接点击重定向 (/go/[id])" },
      { type: "feat", desc: "链接导入导出 (JSON/CSV)" },
      { type: "feat", desc: "数据库备份 API" },
      { type: "feat", desc: "requireAdmin 权限守卫" },
      { type: "feat", desc: "后台看板 (7天趋势)" },
      { type: "feat", desc: "独立注册 API" },
      { type: "feat", desc: "CMS Markdown 预览" },
    ]
  },
];

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">更新日志</h1>

      <div className="space-y-8">
        {changelogs.map(log => (
          <div key={log.version} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{log.version}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${log.tagColor}`}>{log.tag}</span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-3 h-3" />
                {log.date}
              </span>
            </div>
            <ul className="space-y-2">
              {log.changes.map((change, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1 px-1.5 py-0.5 rounded text-xs font-mono ${
                    change.type === "feat" ? "bg-green-100 text-green-700" :
                    change.type === "fix" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {change.type}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{change.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
