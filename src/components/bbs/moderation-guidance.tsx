"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shield, AlertTriangle, Link2, Ban, Info } from "lucide-react";

const GUIDANCE_SECTIONS = [
  {
    title: "审核判断参考",
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      "标题与正文是否相关：标题描述应与内容一致",
      "正文是否实质：仅含链接、表情、无意义字符的帖子应驳回",
      "分类是否正确：发帖分类应与内容主题匹配",
      "是否重复发帖：同一用户短时间内发布相同内容应注意",
      "转载是否注明：转载内容应标注来源",
    ],
  },
  {
    title: "举报处理建议",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    items: [
      "先查看举报对象内容和举报原因",
      "核实内容是否确实违反社区规则",
      "有效举报应 resolve 并对内容采取相应操作（隐藏/驳回）",
      "无效举报应 dismiss，并注明理由",
      "受理后 48 小时内应有处理结果",
    ],
  },
  {
    title: "外链风险提示",
    icon: Link2,
    color: "text-purple-600",
    bg: "bg-purple-50",
    items: [
      "单帖外链超过 5 个可能为推广内容",
      "外链指向未知短链服务需格外警惕",
      "外链与帖子主题无关时可能为广告",
      "外链指向已知恶意网站应直接隐藏并记录",
    ],
  },
  {
    title: "常见违规示例",
    icon: Ban,
    color: "text-red-600",
    bg: "bg-red-50",
    items: [
      "广告推广：大量外链、产品推销、联系方式刷屏",
      "垃圾内容：重复无意义文字、随机字符组合",
      "辱骂攻击：针对个人的侮辱性语言",
      "违规信息：涉及违法、色情、暴力的内容",
      "虚假信息：故意散布不实信息误导他人",
    ],
  },
  {
    title: "操作不可逆提醒",
    icon: AlertTriangle,
    color: "text-orange-600",
    bg: "bg-orange-50",
    items: [
      "隐藏帖子后公开链接将返回 404",
      "驳回帖子作者会收到通知",
      "置顶和精华操作会影响所有用户看到的排序",
      "锁定帖子后无法新增评论",
      "处理举报后会通知举报人，不可撤回",
      "每次操作都会写入 ModerationLog，无法删除记录",
    ],
  },
  {
    title: "管理动作结果说明",
    icon: Info,
    color: "text-gray-600",
    bg: "bg-gray-50",
    items: [
      "approve → 帖子状态变为 published，作者收到审核通过通知",
      "reject → 帖子状态变为 rejected，作者收到驳回原因通知",
      "hide → 帖子状态变为 hidden，公开链接返回 404，作者收到隐藏通知",
      "restore → 帖子状态恢复为 published",
      "pin → 帖子在列表中置顶显示，作者收到通知",
      "unpin → 取消置顶（无通知）",
      "feature → 帖子标记为精华，作者收到通知",
      "unfeature → 取消精华（无通知）",
      "lock → 锁定帖子，禁止新增评论，作者收到通知",
      "unlock → 解锁帖子（作者收到通知）",
    ],
  },
];

export function ModerationGuidance() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-bold text-gray-900">内容治理帮助</h3>
      </div>

      <div className="space-y-2">
        {GUIDANCE_SECTIONS.map((section, idx) => {
          const Icon = section.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div key={idx} className="rounded-lg border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${section.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 pt-1">
                  <ul className="space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-500 leading-relaxed pl-3 relative">
                        <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-gray-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400 italic">
        以上参考不替代管理员独立判断，系统不会自动执行处罚。
      </p>
    </div>
  );
}
