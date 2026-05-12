'use client';

import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, Shield, ClipboardList, MessageSquare } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { trackEvent } from '@/lib/analytics';
interface SensitiveItem {
  name: string;
  type: string;
  channel: string;
  note: string;
  confirm: string[];
  risk: 'low' | 'medium' | 'high';
}

const items: SensitiveItem[] = [
  {
    name: "普通食品（零食/干货）",
    type: "敏感货",
    channel: "食品专线",
    note: "通常需原厂密封包装，不可含液体或肉类成分",
    confirm: ["是否含肉类/乳制品成分", "保质期要求（通常需≥6个月）", "是否需要食品标签翻译", "目的国是否有食品进口限制"],
    risk: "low",
  },
  {
    name: "液体（饮料/护肤品）",
    type: "敏感货",
    channel: "敏感货专线",
    note: "需密封防漏，部分国家对液体品类有严格限制",
    confirm: ["液体总量和单瓶容量限制", "是否含酒精或易燃成分", "包装是否需要防漏加固", "目的国是否禁止进口该品类"],
    risk: "medium",
  },
  {
    name: "电池/含电池产品（手机/充电宝等）",
    type: "敏感货",
    channel: "带电专线",
    note: "通常需提供 MSDS 报告和 UN38.3 测试报告",
    confirm: ["电池类型（锂电/干电池/镍氢）", "电池容量（Wh 或 mAh）", "是否需要 UN38.3 / MSDS 文件", "产品是否内置电池或可拆卸"],
    risk: "medium",
  },
  {
    name: "化妆品（护肤品/彩妆/香水）",
    type: "敏感货",
    channel: "敏感货专线",
    note: "通常需原包装，含液体或喷雾需特殊渠道",
    confirm: ["是否含酒精或易燃成分（如香水）", "是否为压缩气罐包装", "成分表是否需要提供", "目的国对化妆品的成分限制"],
    risk: "medium",
  },
  {
    name: "粉末状物品（调料/蛋白粉/颜料）",
    type: "敏感货",
    channel: "敏感货专线",
    note: "通常需提供成分证明，部分白色粉末可能被严格检查",
    confirm: ["粉末成分和用途说明", "是否需要成分鉴定报告", "是否为白色粉末（可能被重点检查）", "包装是否密封且标识清晰"],
    risk: "high",
  },
  {
    name: "药品/保健品（非处方/处方药）",
    type: "敏感货",
    channel: "药品专线",
    note: "部分处方药可能禁止邮寄，需遵守目的国药品法规",
    confirm: ["是否为处方药（部分国家严禁邮寄）", "是否需要医生处方或证明", "药品成分是否在目的国允许清单内", "数量是否超过个人自用范围"],
    risk: "high",
  },
  {
    name: "品牌商品（含仿牌/高仿）",
    type: "高度敏感",
    channel: "特殊渠道",
    note: "仿牌商品可能被海关扣押，需品牌授权",
    confirm: ["是否有品牌授权证明", "是否为仿牌/高仿（可能违法）", "目的国对仿牌的处罚力度", "是否涉及商标侵权"],
    risk: "high",
  },
  {
    name: "木制/竹制产品（家具/工艺品）",
    type: "敏感货",
    channel: "熏蒸专线",
    note: "通常需熏蒸证明或植物检疫证书",
    confirm: ["是否需要熏蒸处理证明", "是否为原木材料（部分国家禁止）", "是否需要植物检疫证书", "目的国对木制品的特殊要求"],
    risk: "medium",
  },
  {
    name: "刀具/利器（厨房刀/工具刀）",
    type: "禁运/高度敏感",
    channel: "特殊确认",
    note: "部分国家严格禁止邮寄刀具，务必提前确认",
    confirm: ["目的国是否允许邮寄刀具", "刀具类型和刃长是否合规", "是否需要特殊审批", "是否可走海运而非空运"],
    risk: "high",
  },
  {
    name: "大件物品（家具/家电/大件包裹）",
    type: "特殊计费",
    channel: "大件专线/海运",
    note: "按体积重计费，超大件可能需海运或拼箱",
    confirm: ["包裹尺寸和重量是否超过上限", "是否适合空运或需海运", "目的国派送是否需额外费用", "是否需要送货上门服务"],
    risk: "low",
  },
  {
    name: "含磁铁产品（音响/磁性配件）",
    type: "敏感货",
    channel: "带电专线/磁性专线",
    note: "磁性物品航空运输需进行磁性检测",
    confirm: ["磁性强度是否超过航空标准", "是否需要磁性检测报告", "是否可走海运规避限制", "包装是否需防磁处理"],
    risk: "medium",
  },
  {
    name: "电子烟/烟油",
    type: "禁运/高度敏感",
    channel: "特殊确认",
    note: "多数国家严格限制或禁止邮寄电子烟和烟油",
    confirm: ["目的国是否合法允许电子烟", "烟油是否含尼古丁（部分国家禁止）", "电池部分是否符合航空运输标准", "是否有合法进口许可证"],
    risk: "high",
  },
];

// High-risk consultation script — emphasizes compliance, never suggests workarounds
const consultationScript = (itemName: string, confirmQuestions: string[], isHighRisk: boolean) => {
  const intro = isHighRisk
    ? `您好，我想咨询关于"${itemName}"的邮寄事宜。我了解此类物品可能受严格限制，请先帮我确认以下合规问题：`
    : `您好，我想咨询一下关于邮寄"${itemName}"的相关要求：`;

  const body = confirmQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n');

  const closing = isHighRisk
    ? `\n\n另外，如果该物品不符合目的国法律或贵司规定，我不会寄送，请如实告知。谢谢！`
    : `\n\n谢谢！`;

  return `${intro}

${body}
${closing}`;
};

export default function SensitiveGoodsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">敏感货参考查询</h1>
          <p className="text-lg text-orange-100">了解常见物品的邮寄分类参考，非任何服务商的接货规则</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">重要声明</p>
              <p>
                不同国家、服务商和渠道规则不同，本表仅为常见情况的参考汇总，不代表任何物流服务商的接货规则。
                高风险物品（药品/仿牌/刀具/电子烟/粉末等）请务必遵守目的国法律法规。
                发货前请向您所选择的物流服务商确认具体要求。
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="p-5 border-b bg-gray-50 dark:bg-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">常见物品分类速查</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b text-left">
                <tr>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">物品类型</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">货物性质</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">通常走什么渠道</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">注意事项</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white text-sm">{item.name}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.risk === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        item.risk === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {item.risk === 'high' ? <AlertTriangle className="w-3 h-3"/> : <Info className="w-3 h-3"/>}
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{item.channel}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">{item.note}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => copyScript(consultationScript(item.name, item.confirm, item.risk === 'high'), i)}
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 whitespace-nowrap"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {copiedIndex === i ? '已复制' : '生成话术'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm checklist */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            向物流服务商确认什么？
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "货物属性", items: ["物品是否属于敏感货/禁运品", "是否需要特殊渠道或证明文件", "货物价值和是否需要保价"] },
              { title: "渠道与时效", items: ["走什么渠道最划算", "预计时效（工作日/自然日）", "是否支持全程追踪"] },
              { title: "费用构成", items: ["首重和续重价格", "是否收取操作费/燃油附加费", "偏远地区是否加收派送费"] },
              { title: "包装要求", items: ["是否需要原厂包装", "液体/粉末是否需要特殊加固", "是否需要提供成分或价值声明"] },
            ].map((section, i) => (
              <div key={i} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h3>
                <ul className="space-y-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Risk notice */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <p className="font-semibold mb-2">高风险物品特别提醒</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>仿牌/高仿商品</strong>：邮寄可能涉及商标侵权，部分国家海关会直接扣押并处罚。如有授权请提供证明文件</li>
                <li><strong>处方药品</strong>：多国法律严禁个人邮寄处方药，请遵守目的国药品管理法规。不符合要求的请勿寄送</li>
                <li><strong>刀具/利器</strong>：航空运输严格限制，部分国家完全禁止邮寄。请遵守目的国刀具管制法规</li>
                <li><strong>电子烟/烟油</strong>：多数国家对尼古丁烟油有严格管制，请先确认目的国法律。不符合法规的请勿寄送</li>
                <li><strong>粉末/液体</strong>：白色粉末和含酒精液体可能被重点检查，请提供完整的成分说明</li>
              </ul>
              <p className="mt-3 font-medium">
                以上信息仅供参考，不构成法律建议。如物品不符合目的国法规或服务商规定，请勿寄送。
              </p>
            </div>
          </div>
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* FAQ */}
        <FAQSection title="敏感货邮寄常见问题" items={[
          { question: "什么是敏感货？", answer: "敏感货是指在国际运输中受特殊监管或限制的物品，包括食品、液体、粉末、电池、化妆品、药品、品牌仿品等。不同承运商对敏感货的定义和接受程度不同。" },
          { question: "食品可以邮寄吗？", answer: "部分集运渠道可以邮寄包装完好的预包装食品，但生鲜、肉类、乳制品通常被禁止。建议邮寄前与承运商确认。" },
          { question: "带电池的电子产品怎么寄？", answer: "含锂电池的电子产品（如手机、笔记本）通常需要通过特殊渠道运输，且电池容量和数量有严格限制。建议走专门的带电渠道。" },
        ]} />

        <RelatedGuidesSection slugs={["restricted-items-shipping-guide"]} />
      </div>
    </div>
  );
}
