import type { Metadata } from "next";
import Link from "next/link";
import { buildCanonical, buildTitle } from "@/lib/seo";

export const metadata: Metadata = {
  title: buildTitle("发货询价模板 shipping quote template"),
  description: "跨境发货询价模板：给物流商询价、给客户报价的完整模板，包含所有必要信息",
  alternates: { canonical: buildCanonical("/guides/shipping-quote-template") },
  robots: { index: true, follow: true },
};

export default function GuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">发货询价模板</h1>
        <p className="text-gray-600">给物流商询价、给客户报价的完整模板</p>
      </header>

      <section className="prose max-w-none">
        <h2>适用人群</h2>
        <ul>
          <li>跨境电商卖家</li>
          <li>B2B 外贸企业</li>
          <li>货代/物流公司</li>
        </ul>

        <h2>给物流商询价模板</h2>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3>Subject: Shipping Rate Inquiry - [Your Company Name]</h3>
          <pre className="text-sm overflow-x-auto">
{`Dear [Logistics Company],

We are looking for shipping rates for our upcoming shipments. Please provide your best rates for the following:

SHIPMENT DETAILS:
- Origin: [City, China]
- Destination: [City, Country]
- Cargo Type: [General / Dangerous Goods / Temperature Controlled]
- Total Weight: [XXX kg]
- Total Volume: [XXX CBM]
- Number of Packages: [XXX cartons]
- Package Dimensions: [L x W x H cm per carton]

PRODUCT INFORMATION:
- Product Name: [Product Name]
- HS Code: [XXXX.XX]
- Product Value: [USD XXXX]
- Contains Battery: [Yes/No] (If yes, specify type and UN number)
- Contains Liquid/Powder: [Yes/No]

SHIPPING REQUIREMENTS:
- Shipping Method: [Air / Sea / Express]
- Service Type: [Door-to-Door / Port-to-Port / CFS]
- Required Transit Time: [XX days]
- Cargo Ready Date: [YYYY-MM-DD]

ADDITIONAL SERVICES NEEDED:
- Customs Clearance: [Yes/No]
- Insurance: [Yes/No]
- Warehousing: [Yes/No]
- Fumigation: [Yes/No]

Please provide:
1. Ocean freight / Air freight rates
2. Local charges (origin and destination)
3. Transit time
4. Validity period of the quote

Looking forward to your prompt response.

Best regards,
[Your Name]
[Your Company]
[Contact Information]`}
          </pre>
        </div>

        <h2>给客户报价模板</h2>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3>Subject: Shipping Quotation - [Order/Project Name]</h3>
          <pre className="text-sm overflow-x-auto">
{`Dear [Customer Name],

Thank you for your inquiry. Please find our shipping quotation below:

QUOTATION DETAILS:
- Quotation No: [QT-XXXX]
- Date: [YYYY-MM-DD]
- Valid Until: [YYYY-MM-DD]

SHIPMENT INFORMATION:
- Origin: [City, China]
- Destination: [City, Country]
- Cargo: [Product Name]
- Weight: [XXX kg]
- Volume: [XXX CBM]

SHIPPING OPTIONS:

OPTION 1: Sea Freight (LCL/FCL)
- Transit Time: [XX-XX days]
- Ocean Freight: USD [XXXX]
- Local Charges: USD [XXX]
- Customs Clearance: USD [XXX]
- Total: USD [XXXX]

OPTION 2: Air Freight
- Transit Time: [XX-XX days]
- Air Freight: USD [XXXX]
- Local Charges: USD [XXX]
- Customs Clearance: USD [XXX]
- Total: USD [XXXX]

OPTION 3: Express (DHL/UPS/FedEx)
- Transit Time: [X-X days]
- Express Rate: USD [XXXX]
- Customs Clearance: USD [XXX]
- Total: USD [XXXX]

NOTES:
- Rates are subject to change based on actual shipment details
- Insurance: [Included / Available at X% of cargo value]
- above rates do not include duties and taxes at destination
- Free storage: [X days] at origin/destination

TERMS AND CONDITIONS:
- Payment terms: [Prepaid / Collect]
- Claims must be filed within [XX days] of delivery
- Force majeure events excluded

If you have any questions, please feel free to contact us.

Best regards,
[Your Name]
[Your Company]
[Contact Information]`}
          </pre>
        </div>

        <h2>必要信息清单</h2>
        <h3>给物流商询价时必须提供</h3>
        <ul>
          <li>✅ 起运地和目的地</li>
          <li>✅ 货物重量和体积</li>
          <li>✅ 包装数量和尺寸</li>
          <li>✅ 产品名称和 HS 编码</li>
          <li>✅ 货物价值</li>
          <li>✅ 是否含电池/液体/粉末</li>
          <li>✅ 运输方式偏好</li>
          <li>✅ 货物就绪日期</li>
        </ul>

        <h3>给客户报价时必须包含</h3>
        <ul>
          <li>✅ 报价编号和有效期</li>
          <li>✅ 多种运输方式选项</li>
          <li>✅ 各项费用明细</li>
          <li>✅ 运输时效</li>
          <li>✅ 附加服务说明</li>
          <li>✅ 付款条款</li>
          <li>✅ 免责条款</li>
        </ul>

        <h2>常见错误</h2>
        <ul>
          <li>❌ 未提供完整货物信息，导致报价不准确</li>
          <li>❌ 未说明是否含危险品（电池、液体）</li>
          <li>❌ 未确认报价有效期</li>
          <li>❌ 未包含所有费用（漏掉本地费用）</li>
          <li>❌ 未说明付款条款</li>
          <li>❌ 未提供多种运输方式选项</li>
        </ul>

        <h2>相关工具</h2>
        <ul>
          <li><Link href="/tools/cbm" className="text-blue-600 hover:underline">CBM 计算器</Link></li>
          <li><Link href="/tools/hs-code" className="text-blue-600 hover:underline">HS 编码查询</Link></li>
          <li><Link href="/tools/commercial-invoice" className="text-blue-600 hover:underline">商业发票生成</Link></li>
        </ul>

        <h2>相关任务链</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">🚀 使用发货任务链，自动生成询价和报价单据</p>
          <Link href="/workspace/task-chains/shipping/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            创建发货任务链
          </Link>
        </div>

        <h2>FAQ</h2>
        <h3>Q: 询价后多久能收到报价？</h3>
        <p>A: 通常 1-3 个工作日。紧急询价可以标注 &quot;Urgent&quot;。</p>

        <h3>Q: 报价有效期通常是多久？</h3>
        <p>A: 海运通常 15-30 天，空运 7-15 天，快递 7 天。旺季可能更短。</p>

        <h3>Q: 如何比较不同物流商的报价？</h3>
        <p>A: 比较总成本（包括所有本地费用）、运输时效、服务质量和口碑。不要只看海运费。</p>

        <h2>合规免责声明</h2>
        <p className="text-sm text-gray-600">本模板仅供参考，不构成法律或商业建议。具体报价请以实际物流商报价为准。建议咨询专业货代或物流公司。</p>
      </section>
    </article>
  );
}
