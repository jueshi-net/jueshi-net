import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("中国发德国 shipping guide"),
  description: "中国到德国跨境发货完整指南：海运/空运/快递选择、关税政策、VAT 处理、清关流程、常见错误",
  alternates: { canonical: buildCanonical("/guides/shipping-from-china-to-germany") },
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">中国发德国 shipping guide</h1>
        <p className="text-gray-600">跨境卖家发货到德国的完整操作指南</p>
      </header>

      <section className="prose max-w-none">
        <h2>适用人群</h2>
        <ul>
          <li>跨境电商卖家（Amazon.de, eBay.de, 独立站）</li>
          <li>B2B 外贸企业</li>
          <li>个人寄件到德国</li>
        </ul>

        <h2>运输方式选择</h2>
        <h3>海运</h3>
        <ul>
          <li>时效：30-45 天</li>
          <li>成本：最低，适合大批量</li>
          <li>适合：家具、大件商品、非紧急货物</li>
        </ul>

        <h3>空运</h3>
        <ul>
          <li>时效：7-12 天</li>
          <li>成本：中等</li>
          <li>适合：电子产品、时尚商品、中等紧急度</li>
        </ul>

        <h3>快递（DHL/UPS/FedEx）</h3>
        <ul>
          <li>时效：3-7 天</li>
          <li>成本：最高</li>
          <li>适合：小件、紧急、高价值商品</li>
        </ul>

        <h2>德国关税与 VAT</h2>
        <h3>进口关税</h3>
        <ul>
          <li>起征点：€150（低于此值免关税）</li>
          <li>税率：根据 HS 编码，通常 0-17%</li>
        </ul>

        <h3>VAT（增值税）</h3>
        <ul>
          <li>标准税率：19%</li>
          <li>优惠税率：7%（食品、书籍等）</li>
          <li>起征点：€22（低于此值免 VAT）</li>
          <li>需要德国 VAT 号或 OSS 注册</li>
        </ul>

        <h2>清关流程</h2>
        <ol>
          <li>准备文件：商业发票、装箱单、提单/运单</li>
          <li>提交清关申请</li>
          <li>海关审核文件</li>
          <li>缴纳关税和 VAT</li>
          <li>放行提货</li>
        </ol>

        <h2>常见错误</h2>
        <ul>
          <li>❌ HS 编码错误导致关税计算错误</li>
          <li>❌ 缺少 CE 认证（电子产品）</li>
          <li>❌ 缺少 REACH 合规声明（化学品）</li>
          <li>❌ 商业发票信息不完整</li>
          <li>❌ 未注册德国 VAT</li>
          <li>❌ 包装不符合德国环保要求</li>
        </ul>

        <h2>相关工具</h2>
        <ul>
          <li><Link href="/tools/hs-code" className="text-blue-600 hover:underline">HS 编码查询</Link></li>
          <li><Link href="/tools/cbm" className="text-blue-600 hover:underline">CBM 计算</Link></li>
          <li><Link href="/tools/postal-code" className="text-blue-600 hover:underline">德国邮编查询</Link></li>
        </ul>

        <h2>相关任务链</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">🚀 使用发货任务链，一站式完成所有单据</p>
          <Link href="/workspace/task-chains/shipping/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            创建发货任务链
          </Link>
        </div>

        <h2>FAQ</h2>
        <h3>Q: 发货到德国需要哪些认证？</h3>
        <p>A: 电子产品需要 CE 认证，化学品需要 REACH 合规，纺织品需要 OEKO-TEX 认证（推荐）。</p>

        <h3>Q: 德国 VAT 如何注册？</h3>
        <p>A: 需要通过德国税务局申请，或使用 OSS（One Stop Shop）简化注册。建议咨询专业税务顾问。</p>

        <h3>Q: 海运到德国汉堡需要多久？</h3>
        <p>A: 通常 30-45 天，具体取决于出发港口和船期。</p>

        <h2>合规免责声明</h2>
        <p className="text-sm text-gray-600">本指南仅供参考，不构成法律或税务建议。具体关税、VAT 政策请以德国海关和税务局官方信息为准。建议咨询专业报关行或税务顾问。</p>
      </section>
    </article>
  );
}
