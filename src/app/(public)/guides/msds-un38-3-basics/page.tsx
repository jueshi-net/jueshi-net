import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("MSDS/UN38.3 认证基础知识"),
  description: "MSDS 材料安全数据表和 UN38.3 锂电池测试认证完整指南：申请流程、测试项目、常见问题",
  alternates: { canonical: buildCanonical("/guides/msds-un38-3-basics") },
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">MSDS/UN38.3 认证基础知识</h1>
        <p className="text-gray-600">化学品和锂电池跨境运输必备认证</p>
      </header>

      <section className="prose max-w-none">
        <h2>适用人群</h2>
        <ul>
          <li>化学品卖家（涂料、清洁剂、化妆品）</li>
          <li>锂电池产品卖家（电子产品、电动工具）</li>
          <li>所有需要运输危险品的跨境卖家</li>
        </ul>

        <h2>什么是 MSDS？</h2>
        <h3>定义</h3>
        <p>MSDS（Material Safety Data Sheet）材料安全数据表，现称 SDS（Safety Data Sheet），是化学品安全信息的标准化文件。</p>

        <h3>包含内容</h3>
        <ol>
          <li>化学品及公司标识</li>
          <li>危险性识别</li>
          <li>成分/组成信息</li>
          <li>急救措施</li>
          <li>消防措施</li>
          <li>泄漏应急处理</li>
          <li>操作处置与储存</li>
          <li>接触控制/个体防护</li>
          <li>理化特性</li>
          <li>稳定性和反应性</li>
          <li>毒理学信息</li>
          <li>生态学信息</li>
          <li>废弃处置</li>
          <li>运输信息</li>
          <li>法规信息</li>
          <li>其他信息</li>
        </ol>

        <h3>何时需要 MSDS？</h3>
        <ul>
          <li>运输化学品（液体、粉末、气体）</li>
          <li>出口到欧美等发达国家</li>
          <li>承运商要求（DHL, FedEx, 船公司）</li>
          <li>海关清关</li>
        </ul>

        <h2>什么是 UN38.3？</h2>
        <h3>定义</h3>
        <p>UN38.3 是联合国《关于危险货物运输的建议书》第 38.3 节，规定锂电池必须通过的安全测试标准。</p>

        <h3>8 项测试</h3>
        <ol>
          <li><strong>T.1 高度模拟：</strong>模拟高空低压环境</li>
          <li><strong>T.2 热测试：</strong>极端温度循环测试</li>
          <li><strong>T.3 振动：</strong>模拟运输振动</li>
          <li><strong>T.4 冲击：</strong>模拟运输冲击</li>
          <li><strong>T.5 外短路：</strong>外部短路测试</li>
          <li><strong>T.6 碰撞/挤压：</strong>机械损伤测试</li>
          <li><strong>T.7 过充电：</strong>过充保护测试</li>
          <li><strong>T.8 强制放电：</strong>强制放电测试</li>
        </ol>

        <h3>何时需要 UN38.3？</h3>
        <ul>
          <li>运输锂电池（锂金属电池、锂离子电池）</li>
          <li>空运、海运、陆运都需要</li>
          <li>所有国家和地区都要求</li>
          <li>承运商和海关强制要求</li>
        </ul>

        <h2>申请流程</h2>
        <h3>MSDS 申请</h3>
        <ol>
          <li>准备产品样品和成分信息</li>
          <li>选择有资质的实验室（SGS, TUV, Intertek）</li>
          <li>填写申请表</li>
          <li>实验室测试（如需）</li>
          <li>出具 MSDS 报告</li>
          <li>有效期：通常 1 年</li>
        </ol>

        <h3>UN38.3 申请</h3>
        <ol>
          <li>准备电池样品（通常 10-20 个）</li>
          <li>选择有资质的实验室</li>
          <li>提交电池规格书</li>
          <li>完成 8 项测试</li>
          <li>出具 UN38.3 测试报告</li>
          <li>有效期：通常 1 年</li>
        </ol>

        <h2>费用参考</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">认证类型</th>
              <th className="border p-2">费用范围</th>
              <th className="border p-2">周期</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">MSDS</td>
              <td className="border p-2">¥2,000-¥8,000</td>
              <td className="border p-2">3-7 天</td>
            </tr>
            <tr>
              <td className="border p-2">UN38.3</td>
              <td className="border p-2">¥5,000-¥20,000</td>
              <td className="border p-2">7-15 天</td>
            </tr>
          </tbody>
        </table>

        <h2>常见错误</h2>
        <ul>
          <li>❌ 未做认证就发货，被海关扣留</li>
          <li>❌ 使用过期认证（超过 1 年）</li>
          <li>❌ 认证信息与实物不符</li>
          <li>❌ 未向承运商提供认证副本</li>
          <li>❌ 选择无资质的实验室</li>
          <li>❌ 电池规格变更后未重新认证</li>
        </ul>

        <h2>相关工具</h2>
        <ul>
          <li><Link href="/tools/hs-code" className="text-blue-600 hover:underline">HS 编码查询</Link></li>
          <li><Link href="/tools/commercial-invoice" className="text-blue-600 hover:underline">商业发票生成</Link></li>
        </ul>

        <h2>相关任务链</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">🚀 使用发货任务链，一站式完成所有单据</p>
          <Link href="/workspace/task-chains/shipping/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            创建发货任务链
          </Link>
        </div>

        <h2>FAQ</h2>
        <h3>Q: MSDS 和 SDS 有什么区别？</h3>
        <p>A: 没有本质区别。MSDS 是旧称，SDS 是新称（GHS 标准）。现在统一使用 SDS，但很多人仍习惯称 MSDS。</p>

        <h3>Q: UN38.3 认证可以在中国做吗？</h3>
        <p>A: 可以。中国有多个有资质的实验室（SGS 中国、TUV 中国、CQC 等）。</p>

        <h3>Q: 电池已经通过 UN38.3，还需要 MSDS 吗？</h3>
        <p>A: 需要。UN38.3 仅针对锂电池安全性，MSDS 针对化学品安全性。如果产品包含化学品（如电解液），两者都需要。</p>

        <h2>合规免责声明</h2>
        <p className="text-sm text-gray-600">本指南仅供参考，不构成法律或认证建议。具体认证要求请以目的地国家法规和承运商政策为准。建议咨询专业认证机构。</p>
      </section>
    </article>
  );
}
