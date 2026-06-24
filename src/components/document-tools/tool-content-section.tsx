"use client";

import { useState } from "react";

interface ToolContentSectionProps {
  toolSlug: string;
  toolName: string;
}

const TOOL_CONTENT: Record<string, {
  guide?: { title: string; content: string }[];
  faq?: { q: string; a: string }[];
  errors?: { title: string; desc: string; solution: string; severity: string }[];
}> = {
  "commercial-invoice": {
    guide: [
      { title: "商业发票填写指南", content: "商业发票是国际贸易中的核心单据，用于报关、收汇和纳税。填写时注意：1）卖方信息完整准确 2）买方信息与合同一致 3）商品描述详细（品名、数量、单价、总金额）4）贸易术语（FOB/CIF等）5）原产地 6）签名和盖章" },
    ],
    faq: [
      { q: "商业发票和形式发票有什么区别？", a: "形式发票（PI）是报价性质，商业发票（CI）是正式交易凭证。CI 用于报关和付款，PI 用于报价确认。" },
      { q: "商业发票需要盖章吗？", a: "通常需要卖方签字和盖章。电子签名在部分国家也被接受。" },
      { q: "币种应该填什么？", a: "币种应与合同约定一致，常用 USD、CNY、EUR。填写 ISO 4217 三字母代码。" },
    ],
    errors: [
      { title: "买卖方信息不一致", desc: "发票上的买方/卖方与合同不一致", solution: "核对合同，确保发票与合同信息完全一致", severity: "warning" },
      { title: "商品描述过于简略", desc: "只写了品名没有规格", solution: "添加详细规格、材质、用途等信息，便于海关分类", severity: "info" },
      { title: "金额计算错误", desc: "数量×单价≠总金额", solution: "使用工具自动计算，避免手算错误", severity: "error" },
    ],
  },
  "packing-list": {
    guide: [
      { title: "装箱单填写指南", content: "装箱单详细列出每箱的包装信息。填写时注意：1）每箱编号唯一 2）品名与发票一致 3）数量准确 4）毛重/净重正确 5）箱规（长×宽×高） 6）总箱数和总重量" },
    ],
    faq: [
      { q: "装箱单需要和商业发票数量一致吗？", a: "是的，装箱单的总数量应与商业发票一致。" },
      { q: "毛重和净重怎么填？", a: "净重是商品本身重量，毛重是含包装的重量。毛重≥净重。" },
      { q: "箱规重要吗？", a: "箱规（长×宽×高）用于计算体积和运费，非常重要。" },
    ],
    errors: [
      { title: "总箱数与明细不符", desc: "各箱数量之和≠总数量", solution: "逐箱核对，确保加总正确", severity: "error" },
      { title: "毛重小于净重", desc: "数据填写逻辑错误", solution: "毛重应≥净重，检查单位是否统一", severity: "warning" },
    ],
  },
  "quotation": {
    guide: [
      { title: "报价单填写指南", content: "报价单是向客户报价的正式文件。填写时注意：1）报价有效期 2）币种和贸易术语 3）商品明细清晰 4）付款方式 5）交货期 6）联系方式" },
    ],
    faq: [
      { q: "报价有效期一般多久？", a: "通常7-30天，视市场波动而定。汇率波动大时建议缩短有效期。" },
      { q: "FOB和CIF怎么选？", a: "FOB是离岸价（买方承担运费保险），CIF是到岸价（卖方承担运费保险）。根据双方约定选择。" },
    ],
    errors: [
      { title: "缺少报价有效期", desc: "报价单未注明有效期", solution: "添加有效期，避免价格争议", severity: "warning" },
    ],
  },
  "postal-code": {
    guide: [
      { title: "邮编查询使用指南", content: "邮编查询工具帮助您查找各国邮政编码。选择国家，输入城市或地址关键词即可查询。支持中国、美国、加拿大、澳大利亚、英国、日本等主要国家。" },
    ],
    faq: [
      { q: "查不到邮编怎么办？", a: "尝试输入更短的关键词，或检查城市名称拼写。部分小镇可能需要输入上级城市名。" },
      { q: "支持哪些国家？", a: "目前支持中国、美国、加拿大、澳大利亚、英国、日本、德国等主要国家。" },
    ],
    errors: [
      { title: "城市名称不匹配", desc: "输入了中文但数据库只有英文", solution: "尝试使用英文城市名或拼音", severity: "info" },
    ],
  },
  "express-declaration": {
    guide: [
      { title: "国际快递申报单填写指南", content: "国际快递申报单用于海关申报。填写时注意：1）收发件人信息完整 2）品名详细（中英文） 3）申报价值准确 4）数量和重量一致 5）HS Code（如知道）" },
    ],
    faq: [
      { q: "申报价值应该填多少？", a: "申报价值应填写实际交易价值，低报可能导致罚款或扣件。" },
      { q: "HS Code必填吗？", a: "部分国家要求必填，建议尽量填写以便快速清关。" },
    ],
    errors: [
      { title: "申报价值过低", desc: "远低于市场价", solution: "填写真实交易价值，避免海关扣件", severity: "error" },
    ],
  },
};

export default function ToolContentSection({ toolSlug, toolName }: ToolContentSectionProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "faq" | "errors">("guide");
  const content = TOOL_CONTENT[toolSlug];

  if (!content) return null;

  const severityColors: Record<string, string> = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div className="mt-6" data-testid="tool-content-section">
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="flex border-b">
          {content.guide && (
            <button
              onClick={() => setActiveTab("guide")}
              data-testid="tool-guide-section"
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === "guide" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              📖 使用指南
            </button>
          )}
          {content.faq && (
            <button
              onClick={() => setActiveTab("faq")}
              data-testid="tool-faq-section"
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === "faq" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              ❓ FAQ
            </button>
          )}
          {content.errors && (
            <button
              onClick={() => setActiveTab("errors")}
              data-testid="tool-common-errors-section"
              className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === "errors" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              ⚠️ 常见错误
            </button>
          )}
        </div>

        <div className="p-5">
          {activeTab === "guide" && content.guide && (
            <div className="space-y-3">
              {content.guide.map((g, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-gray-800 mb-1">{g.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{g.content}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "faq" && content.faq && (
            <div className="space-y-3">
              {content.faq.map((f, i) => (
                <div key={i} className="border-b pb-2 last:border-0">
                  <p className="font-medium text-gray-800 text-sm">Q: {f.q}</p>
                  <p className="text-sm text-gray-600 mt-1">A: {f.a}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "errors" && content.errors && (
            <div className="space-y-3">
              {content.errors.map((e, i) => (
                <div key={i} className={`rounded-lg border p-3 ${severityColors[e.severity] || severityColors.info}`}>
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-sm mt-1 opacity-90">{e.desc}</p>
                  <p className="text-sm mt-1">💡 {e.solution}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
