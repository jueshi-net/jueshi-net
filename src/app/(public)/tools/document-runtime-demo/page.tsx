/**
 * Document Runtime Demo — 3 个个性化工具接入示范
 * 
 * 展示 CustomFormShell 如何让个性化工具接入统一能力，
 * 同时保留各自的独立 UI。
 * 
 * 示范工具：
 * 1. 供应链报价单 (supply-chain-quote) — company + product + draft + export
 * 2. 入库单 (inbound-receipt) — company + draft + export
 * 3. Debit Note (debit-note) — company + draft + export
 * 
 * @route /tools/document-runtime-demo
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Boxes, Building2, Save, Download } from "lucide-react";
import CustomFormShell, { useRuntimeContext } from "@/components/document-runtime/CustomFormShell";
import RuntimeCompanyBridge from "@/components/document-runtime/RuntimeCompanyBridge";
import RuntimeDraftBridge from "@/components/document-runtime/RuntimeDraftBridge";
import RuntimeExportBridge from "@/components/document-runtime/RuntimeExportBridge";

// ============================================================
// Demo Tool 1: 供应链报价单接入示范
// ============================================================

function SupplyChainQuoteDemo() {
  const ctx = useRuntimeContext();
  const [items, setItems] = useState([{ name: "商品A", qty: 10, price: 50 }]);

  return (
    <div className="space-y-4" data-testid="demo-supply-chain">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">供应链报价单 — Runtime 接入示范</h3>
        <p className="text-sm text-blue-700 mt-1">
          工具保持自身多步骤表单 UI，通过 Runtime 获取公司资料、商品、草稿、导出能力。
        </p>
      </div>

      {/* 公司资料 — 通过 Runtime 注入 */}
      {ctx?.company && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">公司资料（Runtime 注入）</span>
          </div>
          <RuntimeCompanyBridge adapter={ctx.company} testIdPrefix="demo-sc-company" />
        </div>
      )}

      {/* 商品行 — 工具自身 UI */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Boxes className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">商品明细（工具自身 UI）</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input className="flex-1 px-2 py-1 border rounded text-sm" value={item.name} readOnly />
            <input className="w-20 px-2 py-1 border rounded text-sm" value={item.qty} readOnly />
            <input className="w-24 px-2 py-1 border rounded text-sm" value={`$${item.price}`} readOnly />
          </div>
        ))}
      </div>

      {/* 草稿 + 导出 — 通过 Runtime 注入 */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
        {ctx?.draft && <RuntimeDraftBridge adapter={ctx.draft} testIdPrefix="demo-sc-draft" />}
        {ctx?.export && <RuntimeExportBridge adapter={ctx.export} data={{ items }} testIdPrefix="demo-sc-export" />}
      </div>
    </div>
  );
}

// ============================================================
// Demo Tool 2: 入库单接入示范
// ============================================================

function InboundReceiptDemo() {
  const ctx = useRuntimeContext();
  const [receiptNo] = useState(`IN${Date.now().toString().slice(-6)}`);

  return (
    <div className="space-y-4" data-testid="demo-inbound">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900">入库单 — Runtime 接入示范</h3>
        <p className="text-sm text-green-700 mt-1">
          仓库场景 UI 保持不变，仅接入公司资料、草稿、导出能力。
        </p>
      </div>

      {/* 入库单号 — 工具自身 UI */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="text-sm font-medium text-gray-700">入库单号</label>
        <input className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" value={receiptNo} readOnly />
      </div>

      {/* 公司资料 — 通过 Runtime 注入 */}
      {ctx?.company && (
        <div className="border border-gray-200 rounded-lg p-4">
          <RuntimeCompanyBridge adapter={ctx.company} testIdPrefix="demo-ib-company" />
        </div>
      )}

      {/* 草稿 + 导出 */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
        {ctx?.draft && <RuntimeDraftBridge adapter={ctx.draft} testIdPrefix="demo-ib-draft" />}
        {ctx?.export && <RuntimeExportBridge adapter={ctx.export} data={{ receiptNo }} testIdPrefix="demo-ib-export" />}
      </div>
    </div>
  );
}

// ============================================================
// Demo Tool 3: Debit Note 接入示范
// ============================================================

function DebitNoteDemo() {
  const ctx = useRuntimeContext();
  const [amount] = useState(1250.00);

  return (
    <div className="space-y-4" data-testid="demo-debit">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-semibold text-orange-900">Debit Note — Runtime 接入示范</h3>
        <p className="text-sm text-orange-700 mt-1">
          借记通知 UI 保持不变，接入公司资料、草稿、导出能力。
        </p>
      </div>

      {/* 金额 — 工具自身 UI */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="text-sm font-medium text-gray-700">借记金额</label>
        <div className="mt-1 text-2xl font-bold text-orange-600">USD {amount.toFixed(2)}</div>
      </div>

      {/* 公司资料 */}
      {ctx?.company && (
        <div className="border border-gray-200 rounded-lg p-4">
          <RuntimeCompanyBridge adapter={ctx.company} testIdPrefix="demo-dn-company" />
        </div>
      )}

      {/* 草稿 + 导出 */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
        {ctx?.draft && <RuntimeDraftBridge adapter={ctx.draft} testIdPrefix="demo-dn-draft" />}
        {ctx?.export && <RuntimeExportBridge adapter={ctx.export} data={{ amount }} testIdPrefix="demo-dn-export" />}
      </div>
    </div>
  );
}

// ============================================================
// 主页面 — Tab 切换 3 个示范
// ============================================================

type DemoTab = "supply-chain" | "inbound" | "debit";

export default function DocumentRuntimeDemoPage() {
  const [tab, setTab] = useState<DemoTab>("supply-chain");

  const tabs: { key: DemoTab; label: string; toolKey: string }[] = [
    { key: "supply-chain", label: "供应链报价单", toolKey: "supply-chain-quote" },
    { key: "inbound", label: "入库单", toolKey: "inbound-receipt" },
    { key: "debit", label: "Debit Note", toolKey: "debit-note" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 py-6 overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <Link href="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> 返回工具列表
          </Link>
          <h1 className="text-2xl font-bold mt-2">Document Runtime — 工具接入示范</h1>
          <p className="text-sm text-gray-500 mt-1">
            统一底座 + 自由模板：个性化工具接入公共能力，保留独立 UI
          </p>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6 border-b">
          {tabs.map((t) => (
            <button
              key={t.key}
              data-testid={`demo-tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 示范内容 — 每个工具用 CustomFormShell 包裹 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {tab === "supply-chain" && (
            <CustomFormShell toolKey="supply-chain-quote" showStatusBar>
              <SupplyChainQuoteDemo />
            </CustomFormShell>
          )}
          {tab === "inbound" && (
            <CustomFormShell toolKey="inbound-receipt" showStatusBar>
              <InboundReceiptDemo />
            </CustomFormShell>
          )}
          {tab === "debit" && (
            <CustomFormShell toolKey="debit-note" showStatusBar>
              <DebitNoteDemo />
            </CustomFormShell>
          )}
        </div>

        {/* 架构说明 */}
        <div className="mt-6 bg-gray-100 rounded-xl p-6">
          <h2 className="font-semibold mb-3">架构说明</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>统一底座</strong>：公司资料、商品、草稿、导出、会员、审计 — 通过 Runtime 注入</li>
            <li>• <strong>自由模板</strong>：每个工具保留自己的 UI 布局和交互逻辑</li>
            <li>• <strong>CustomFormShell</strong>：包裹工具，注入能力，不改变视觉</li>
            <li>• <strong>选择性接入</strong>：工具声明需要哪些能力，Runtime 按需注入</li>
            <li>• <strong>不破坏现有页面</strong>：现有工具页面不受影响，可逐步迁移</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
