import { Crown, FileText, Building2, Star, RefreshCw } from "lucide-react";

const CAPABILITIES = [
  {
    icon: FileText,
    title: "保存单据草稿",
    desc: "随时保存、继续编辑，不丢失任何进度",
  },
  {
    icon: Building2,
    title: "复用公司资料",
    desc: "一键填入常用公司信息，快速生成单据",
  },
  {
    icon: Star,
    title: "管理收藏与历史",
    desc: "收藏常用模板，历史记录随时回溯",
  },
  {
    icon: RefreshCw,
    title: "多端同步",
    desc: "手机、平板、电脑数据实时同步",
  },
];

export default function PremiumSection() {
  return (
    <section className="w-full bg-gradient-to-b from-teal-600 to-cyan-600">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white/80">工作台能力</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            会员专属能力
          </h2>
          <p className="mt-2 text-sm text-white/70">免费够用，会员更强</p>
        </div>

        {/* 4-column card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/15 hover:bg-white/15 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 mb-3">
                <cap.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{cap.title}</h3>
              <p className="text-xs text-white/65 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-white/15 backdrop-blur-sm text-white text-sm font-bold rounded-2xl cursor-not-allowed border border-white/20">
            即将开放 <Crown className="w-4 h-4 text-yellow-300" />
          </div>
          <p className="mt-2 text-xs text-white/60">会员功能正在开发中，敬请期待</p>
        </div>
      </div>
    </section>
  );
}
