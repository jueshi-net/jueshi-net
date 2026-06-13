import Link from "next/link";
import { Check, X, Crown } from "lucide-react";

const FEATURES = [
  { label: "Logo 上传", free: false, pro: true },
  { label: "公司资料库", free: false, pro: true },
  { label: "高级单据模板", free: false, pro: true },
  { label: "无限草稿保存", free: false, pro: true },
  { label: "AI 工具优先体验", free: false, pro: true },
  { label: "专属客服支持", free: false, pro: true },
  { label: "基础工具使用", free: true, pro: true },
  { label: "基础单据生成", free: true, pro: true },
  { label: "社区浏览", free: true, pro: true },
  { label: "草稿数量", free: "3 个", pro: "无限" },
  { label: "广告体验", free: "有广告", pro: "无广告" },
];

export default function PremiumSection() {
  return (
    <section className="w-full bg-gradient-to-b from-teal-600 to-cyan-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold text-white/80">MEMBERSHIP</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            会员专属能力
          </h2>
          <p className="mt-2 text-sm text-white/70">免费够用，会员更强</p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-2xl mx-auto bg-white rounded-[20px] shadow-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-4 text-sm font-semibold text-gray-500 text-center">功能</div>
            <div className="p-4 text-sm font-semibold text-gray-500 text-center border-l border-gray-200">免费用户</div>
            <div className="p-4 text-sm font-semibold text-teal-600 bg-teal-50 text-center border-l border-gray-200 flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4" /> 会员
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {FEATURES.map((f) => (
              <div key={f.label} className="grid grid-cols-3 text-sm">
                <div className="p-3 text-gray-700 font-medium">{f.label}</div>
                <div className="p-3 text-center border-l border-gray-100 text-gray-400">
                  {f.free === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : f.free === false ? <X className="w-4 h-4 text-gray-300 mx-auto" /> : f.free}
                </div>
                <div className="p-3 text-center border-l border-gray-100 bg-teal-50/30 text-teal-700 font-medium">
                  {f.pro === true ? <Check className="w-4 h-4 text-teal-500 mx-auto" /> : f.pro === false ? <X className="w-4 h-4 text-gray-300 mx-auto" /> : f.pro}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-6 bg-teal-50 border-t border-teal-100 text-center">
            <div className="inline-flex items-center gap-2 px-8 py-3 bg-gray-400 text-white text-sm font-bold rounded-2xl cursor-not-allowed">
              即将开放 <Crown className="w-4 h-4" />
            </div>
            <p className="mt-2 text-xs text-gray-500">会员功能正在开发中，敬请期待</p>
          </div>
        </div>
      </div>
    </section>
  );
}
