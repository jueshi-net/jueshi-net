import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("电池运输注意事项 shipping guide"),
  description: "锂电池、干电池跨境运输完整指南：IATA DGR、UN38.3 认证、包装要求、常见错误",
  alternates: { canonical: buildCanonical("/guides/battery-shipping-notice") },
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">电池运输注意事项</h1>
        <p className="text-gray-600">锂电池、干电池跨境运输完整指南</p>
      </header>

      <section className="prose max-w-none">
        <h2>适用人群</h2>
        <ul>
          <li>电子产品卖家（手机、笔记本、蓝牙耳机）</li>
          <li>电动工具卖家</li>
          <li>玩具卖家（含电池）</li>
          <li>所有需要运输电池类商品的跨境卖家</li>
        </ul>

        <h2>电池分类</h2>
        <h3>锂电池（Lithium Ion / Li-ion）</h3>
        <ul>
          <li>UN3481：与设备包装在一起</li>
          <li>UN3480：单独运输</li>
          <li>常见：手机电池、笔记本电池、充电宝</li>
        </ul>

        <h3>锂金属电池（Lithium Metal）</h3>
        <ul>
          <li>UN3091：与设备包装在一起</li>
          <li>UN3090：单独运输</li>
          <li>常见：纽扣电池、一次性锂电池</li>
        </ul>

        <h3>干电池（碱性/碳性）</h3>
        <ul>
          <li>非危险品，但仍需正确包装</li>
          <li>常见：AA、AAA、C、D 型电池</li>
        </ul>

        <h2>IATA DGR 规定</h2>
        <h3>空运限制</h3>
        <ul>
          <li>锂电池：必须通过 UN38.3 测试</li>
          <li>额定能量 ≤100Wh：可客机运输</li>
          <li>100Wh &lt; 额定能量 ≤160Wh：仅限货机</li>
          <li>&gt;160Wh：禁止空运（需特殊审批）</li>
        </ul>

        <h3>包装要求</h3>
        <ul>
          <li>防短路：每个电池独立包装</li>
          <li>防移动：固定在内包装中</li>
          <li>防挤压：使用坚固外包装</li>
          <li>标识：贴锂电池标签 + UN 编号</li>
        </ul>

        <h2>UN38.3 认证</h2>
        <h3>什么是 UN38.3？</h3>
        <p>联合国《关于危险货物运输的建议书》第 38.3 节，规定锂电池必须通过 8 项测试：</p>
        <ol>
          <li>高度模拟（T.1）</li>
          <li>热测试（T.2）</li>
          <li>振动（T.3）</li>
          <li>冲击（T.4）</li>
          <li>外短路（T.5）</li>
          <li>碰撞/挤压（T.6）</li>
          <li>过充电（T.7）</li>
          <li>强制放电（T.8）</li>
        </ol>

        <h3>认证流程</h3>
        <ol>
          <li>选择有资质的实验室（SGS, TUV, UL 等）</li>
          <li>提交样品和资料</li>
          <li>完成 8 项测试</li>
          <li>获取 UN38.3 测试报告</li>
          <li>有效期：通常 1 年</li>
        </ol>

        <h2>商业发票要求</h2>
        <ul>
          <li>必须标注：电池类型、UN 编号、额定能量</li>
          <li>示例：&quot;Lithium Ion Battery, UN3481, 3.7V 2000mAh (7.4Wh)&quot;</li>
          <li>必须附带 UN38.3 测试报告副本</li>
        </ul>

        <h2>常见错误</h2>
        <ul>
          <li>❌ 未做 UN38.3 认证就发货</li>
          <li>❌ 商业发票未标注电池信息</li>
          <li>❌ 包装不符合防短路要求</li>
          <li>❌ 未贴锂电池标签</li>
          <li>❌ 超过额定能量限制仍走空运</li>
          <li>❌ 锂电池和干电池混装</li>
          <li>❌ 损坏或召回的电池仍在运输</li>
        </ul>

        <h2>相关工具</h2>
        <ul>
          <li><Link href="/tools/hs-code" className="text-blue-600 hover:underline">HS 编码查询（电池类：8506, 8507）</Link></li>
          <li><Link href="/tools/commercial-invoice" className="text-blue-600 hover:underline">商业发票生成</Link></li>
        </ul>

        <h2>相关任务链</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">🚀 使用发货任务链，一站式完成电池运输单据</p>
          <Link href="/workspace/task-chains/shipping/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            创建发货任务链
          </Link>
        </div>

        <h2>FAQ</h2>
        <h3>Q: 充电宝可以空运吗？</h3>
        <p>A: 可以，但额定能量必须 ≤100Wh。超过 100Wh 需走货机，超过 160Wh 禁止空运。</p>

        <h3>Q: UN38.3 认证多少钱？</h3>
        <p>A: 通常 ¥5,000-¥20,000，取决于电池类型和实验室。有效期 1 年。</p>

        <h3>Q: 干电池需要 UN38.3 吗？</h3>
        <p>A: 不需要。UN38.3 仅针对锂电池。干电池（碱性/碳性）属于非危险品。</p>

        <h2>合规免责声明</h2>
        <p className="text-sm text-gray-600">本指南仅供参考，不构成法律或运输建议。具体运输规定请以 IATA DGR、IMDG Code 及承运商最新政策为准。电池运输存在安全风险，建议咨询专业物流公司。</p>
      </section>
    </article>
  );
}
