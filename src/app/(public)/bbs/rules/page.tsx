import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Ban,
  Link as LinkIcon,
  Flag,
  ClipboardCheck,
  Gavel,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Plus,
  ScrollText,
} from "lucide-react";
import { buildTitle, buildCanonical, SITE_URL, SITE_NAME } from "@/lib/seo";
import JueshiV4PublicShell from "@/components/layout/JueshiV4PublicShell";
import BreadcrumbBar from "@/components/design-system/BreadcrumbBar";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: buildTitle("社区规则中心"),
  description:
    "绝世百宝箱社区规则中心：发帖规范、评论规范、禁止内容、外链政策、举报机制、审核流程、驳回申诉、隐私提醒与社区处罚等级说明，共建友善、专业、有用的海外华人社区。",
  keywords:
    "社区规则,论坛规范,发帖规范,评论规范,禁止内容,外链政策,举报机制,审核流程,驳回申诉,隐私保护,社区处罚",
  alternates: { canonical: buildCanonical("/bbs/rules") },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: buildTitle("社区规则中心"),
    description:
      "发帖规范、评论规范、禁止内容、外链政策、举报机制、审核流程、驳回申诉、隐私提醒与社区处罚等级说明。",
    url: buildCanonical("/bbs/rules"),
    type: "article",
  },
};

interface RuleSection {
  id: string;
  index: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  intro?: string;
  items: string[];
}

interface PenaltyLevel {
  level: string;
  name: string;
  desc: string;
  tone: "info" | "warning" | "danger" | "critical";
}

const RULE_SECTIONS: RuleSection[] = [
  {
    id: "posting",
    index: "01",
    title: "发帖规范",
    icon: FileText,
    intro: "发布高质量帖子，让其他成员能快速理解并参与讨论。",
    items: [
      "标题应准确概括内容，长度 5-80 字，避免使用夸张、诱导性词汇。",
      "正文 10-3000 字，支持纯文本与基本 Markdown 格式。",
      "选择最贴合内容的分类，便于其他成员查找和回复。",
      "转载内容须注明出处和原作者，未经授权请勿搬运受版权保护的内容。",
      "同一内容请勿在多个分类重复发布，避免刷屏。",
      "每日最多发布 5 条新帖，超出将被限制。",
      "发布前请使用预览检查错别字、链接和格式。",
    ],
  },
  {
    id: "commenting",
    index: "02",
    title: "评论规范",
    icon: MessageSquare,
    intro: "评论是社区交流的核心，请保持友善和理性。",
    items: [
      "评论应围绕帖子主题展开，与主题无关的内容请发新帖。",
      "尊重他人观点，理性讨论，不进行人身攻击或嘲讽。",
      "如有不同意见，请提供事实依据或合理论证，避免情绪化表达。",
      "单条评论建议控制在 500 字以内，长内容请考虑另开主题帖。",
      "引用资料、数据或他人言论时请附上来源链接，方便核对。",
      "对他人提供帮助的回复可用「点赞」表达感谢，而非大量「+1」灌水。",
    ],
  },
  {
    id: "prohibited",
    index: "03",
    title: "禁止内容",
    icon: Ban,
    intro: "以下内容一经发现将立即删除，并对发布者进行处理。",
    items: [
      "广告、推广、引流、灰产、诈骗、传销等商业性内容。",
      "涉政、敏感、危害国家安全或违反当地法律法规的信息。",
      "色情、低俗、暴力、恐怖、歧视性内容。",
      "人身攻击、侮辱、诽谤、恶意引战或煽动对立。",
      "泄露他人隐私或个人敏感信息（联系方式、住址、证件号等）。",
      "恶意刷帖、灌水、复读、无意义字符堆砌。",
      "冒充他人、官方账号或管理员，伪造身份信息。",
      "其他违反公序良俗或本社区规则的内容。",
    ],
  },
  {
    id: "external-links",
    index: "04",
    title: "外链政策",
    icon: LinkIcon,
    intro: "合理使用外链，禁止以引流、变现为目的的推广。",
    items: [
      "仅允许与帖子主题相关、对其他成员有明确价值的链接。",
      "禁止以引流、变现、拉新为目的的推广链接。",
      "禁止短链、跳转链、邀请码链接（官方活动公告除外）。",
      "禁止指向违法、灰产、侵权、钓鱼、恶意软件网站的链接。",
      "推广类外链须在发布前向管理员报备并获得书面许可。",
      "违规外链将被删除，重复违规将影响账号权限。",
      "对链接内容真实性负责，禁止传播虚假或误导性信息。",
    ],
  },
  {
    id: "reporting",
    index: "05",
    title: "举报机制",
    icon: Flag,
    intro: "发现问题内容请及时举报，共建良好社区环境。",
    items: [
      "每条帖子和评论均提供「举报」入口，无需登录即可查看入口位置。",
      "举报时请选择类型并填写简短说明，便于审核判断。",
      "支持举报类型：广告/灰产、人身攻击、违法信息、垃圾内容、隐私泄露、其他。",
      "同一内容被多人举报将优先进入审核队列。",
      "举报人身份严格保密，不会向被举报方公开。",
      "恶意举报、批量举报、报复性举报将影响举报人信用，情节严重者将受限。",
    ],
  },
  {
    id: "review",
    index: "06",
    title: "审核流程",
    icon: ClipboardCheck,
    intro: "新帖默认进入审核队列，确保社区内容质量。",
    items: [
      "普通用户发帖默认进入审核队列，审核通过后对所有用户可见。",
      "管理员通常会在 24 小时内完成审核，节假日可能略有延迟。",
      "审核通过后帖子对所有用户可见，并出现在对应分类列表。",
      "审核不通过的帖子将附上具体原因说明，便于修改。",
      "紧急或重大问题可联系管理员申请加急处理。",
      "长期高质量贡献者可申请「快速通道」，获得免审资格。",
      "管理员发布的帖子默认直接上线，但仍受社区规则约束。",
    ],
  },
  {
    id: "appeal",
    index: "07",
    title: "驳回和申诉说明",
    icon: Gavel,
    intro: "帖子被驳回不是终点，您可以修改后重新提交或提出申诉。",
    items: [
      "帖子被驳回时会显示具体原因（违反哪一条规则）。",
      "收到驳回通知后可根据原因修改内容并重新提交。",
      "如对驳回有异议，可在帖子页或私信联系管理员申诉。",
      "申诉请提供具体理由和必要的证据材料。",
      "申诉通常在 3 个工作日内回复，复杂情况可能延长。",
      "多次被驳回且情节严重者，可能被限制发帖权限。",
      "申诉期间请勿重复发布相同内容，以免触发刷帖规则。",
    ],
  },
  {
    id: "privacy",
    index: "08",
    title: "隐私提醒",
    icon: ShieldCheck,
    intro: "保护自己和他人的隐私，是每位成员的责任。",
    items: [
      "请勿在帖子和评论中公开自己的真实姓名、手机号、身份证号、银行卡号等敏感信息。",
      "请勿公开他人的隐私信息，包括联系方式、住址、工作单位、身份证件等。",
      "涉及订单、交易、物流信息时请做好脱敏处理（如打码、隐去关键号段）。",
      "私信同样不要发送敏感个人信息，私信内容请勿公开传播。",
      "如发现他人泄露你的隐私，请立即举报并联系管理员处理。",
      "本社区不会主动通过私信索取密码、验证码或支付信息，谨防诈骗。",
    ],
  },
];

const PENALTY_LEVELS: PenaltyLevel[] = [
  {
    level: "L1",
    name: "提醒",
    desc: "首次或轻微违规，系统提醒或单条评论删除，不记录处分。",
    tone: "info",
  },
  {
    level: "L2",
    name: "警告",
    desc: "累计违规或较轻违规，账号警告并限制部分功能 24 小时。",
    tone: "warning",
  },
  {
    level: "L3",
    name: "禁言",
    desc: "中度违规，禁止发帖和评论 3-7 天，期间仅可浏览。",
    tone: "danger",
  },
  {
    level: "L4",
    name: "封禁",
    desc: "严重或重复违规，账号封禁 30 天或永久，期间无法登录。",
    tone: "critical",
  },
  {
    level: "L5",
    name: "永久封禁",
    desc: "违法、诈骗、灰产等严重违规，永久封禁并记录备查。",
    tone: "critical",
  },
];

const PENALTY_TONE_CLASSES: Record<PenaltyLevel["tone"], string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-orange-200 bg-orange-50 text-orange-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

// JSON-LD structured data: WebPage schema for the rules document
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "社区规则中心 | 绝世百宝箱",
  description:
    "绝世百宝箱社区规则中心：发帖规范、评论规范、禁止内容、外链政策、举报机制、审核流程、驳回申诉、隐私提醒与社区处罚等级说明。",
  url: `${SITE_URL}/bbs/rules`,
  inLanguage: "zh-CN",
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  about: {
    "@type": "Thing",
    name: "社区规则与社区指南",
  },
};

export default function BBSRulesPage() {
  const breadcrumbs = [
    { title: "首页", href: "/" },
    { title: "社区论坛", href: "/bbs" },
    { title: "社区规则中心", current: true },
  ];

  return (
    <JueshiV4PublicShell>
      <div className="min-h-screen bg-gray-50">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-3">
              <BreadcrumbBar items={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand/5 rounded-full text-xs text-brand border border-brand/10">
                <ScrollText className="w-3.5 h-3.5" />
                <span>社区规则</span>
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              社区规则中心
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 max-w-2xl">
              欢迎来到绝世百宝箱社区。请遵守以下规则，与我们共同维护一个友善、专业、有用的海外华人交流空间。
            </p>
            <p className="text-xs text-gray-400 mt-2">
              最后更新：2026 年 7 月 · 规则可能根据社区发展进行调整，以最新版本为准。
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 pb-16">
          {/* Quick links */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/bbs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-brand/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回社区首页
            </Link>
            <Link
              href="/bbs/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              发布新帖
            </Link>
          </div>

          {/* Table of contents (desktop) */}
          <nav
            aria-label="目录"
            className="hidden md:block bg-white rounded-xl border border-gray-200 p-5 mb-8"
          >
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              目录
            </h2>
            <ol className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {RULE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex items-baseline gap-2 text-gray-700 hover:text-brand transition-colors"
                  >
                    <span className="font-mono text-xs text-brand/60">
                      {section.index}
                    </span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#penalties"
                  className="flex items-baseline gap-2 text-gray-700 hover:text-brand transition-colors"
                >
                  <span className="font-mono text-xs text-brand/60">09</span>
                  <span>社区处罚等级说明</span>
                </a>
              </li>
            </ol>
          </nav>

          {/* Rule sections */}
          <div className="space-y-6">
            {RULE_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm scroll-mt-20"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand/10 text-brand shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand/60">
                          {section.index}
                        </span>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                          {section.title}
                        </h2>
                      </div>
                      {section.intro && (
                        <p className="text-sm text-gray-500 mt-1">
                          {section.intro}
                        </p>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2.5 pl-1">
                    {section.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 w-1.5 h-1.5 rounded-full bg-brand/40 shrink-0"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {/* Penalty levels - visual table */}
            <section
              id="penalties"
              className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm scroll-mt-20"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-50 text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand/60">
                      09
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      社区处罚等级说明
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    根据违规严重程度和累计次数，社区将分级处理，确保公平与一致。
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {PENALTY_LEVELS.map((penalty) => (
                  <div
                    key={penalty.level}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${PENALTY_TONE_CLASSES[penalty.tone]}`}
                  >
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-white/70 border border-current/20 text-xs font-bold font-mono shrink-0">
                      {penalty.level}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm">{penalty.name}</p>
                      <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                        {penalty.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  · 处罚记录将影响账号的「快速通道」资格和社区勋章。
                  <br />· 处罚期内对处罚有异议，可按
                  <a
                    href="#appeal"
                    className="text-brand hover:underline mx-0.5"
                  >
                    驳回和申诉说明
                  </a>
                  的流程向管理员申诉。
                  <br />· 同一行为不会因多次举报而叠加处罚，以最终裁定为准。
                </p>
              </div>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="mt-10 bg-gradient-to-br from-brand/5 to-brand/10 rounded-xl border border-brand/10 p-6 md:p-8 text-center">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              准备好了？一起去社区看看
            </h2>
            <p className="text-sm text-gray-600 mb-5 max-w-xl mx-auto">
              遵守规则是享受社区的前提。欢迎参与讨论、分享经验、提出问题。
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/bbs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-dark transition-colors min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" />
                返回社区首页
              </Link>
              <Link
                href="/bbs/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-brand/30 transition-colors min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                发布新帖
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400 mt-8">
            本规则由绝世百宝箱社区团队制定并维护，最终解释权归管理团队所有。
          </p>
        </div>
      </div>
    </JueshiV4PublicShell>
  );
}
