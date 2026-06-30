/**
 * Official Templates
 *
 * 3 个官方预设模板，覆盖核心单据类型。
 * 用户可基于官方模板复制、修改、保存为自己的模板。
 *
 * @module template-studio/official-templates
 */

import type { TemplateConfig } from "./template-schema";
import { defaultFields, defaultColumns } from "./template-schema";

const OFFICIAL_TEMPLATES: TemplateConfig[] = [
  {
    id: "official-quotation",
    toolKey: "standard-quotation",
    name: "标准报价单模板",
    origin: "official",
    ownerId: "",
    fields: defaultFields(),
    columns: defaultColumns(),
    contentBlocks: [],
    style: {
      primaryColor: "#1a56db",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      titleFontSize: "22px",
      pageMargin: "32px",
      logoPosition: "left",
      showSignature: true,
      showStamp: true,
      stampMode: "placeholder",
      tableHeaderBg: "#1a56db",
      tableHeaderColor: "#ffffff",
      borderRadius: "8px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "minimal",
      tableStyle: "clean",
      guideOutline: true,
      stylePreset: "classic-blue",
    },
    layout: {
      showHeader: true,
      showCompanyInfo: true,
      showProductTable: true,
      showAmountSummary: true,
      showRemarks: true,
      showTerms: true,
      showFooter: true,
    },
    bindings: {
      company: true,
      products: true,
      documentNumber: true,
      date: true,
      amountSummary: true,
      remarks: true,
      terms: true,
      logo: true,
      signature: true,
      stamp: true,
      customer: true,
    },
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "official-commercial-invoice",
    toolKey: "commercial-invoice",
    name: "标准商业发票模板",
    origin: "official",
    ownerId: "",
    fields: defaultFields(),
    columns: defaultColumns(),
    contentBlocks: [],
    style: {
      primaryColor: "#059669",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "13px",
      titleFontSize: "20px",
      pageMargin: "28px",
      logoPosition: "left",
      showSignature: true,
      showStamp: true,
      stampMode: "placeholder",
      tableHeaderBg: "#1a56db",
      tableHeaderColor: "#ffffff",
      borderRadius: "8px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "minimal",
      tableStyle: "clean",
      guideOutline: true,
      stylePreset: "classic-blue",
    },
    layout: {
      showHeader: true,
      showCompanyInfo: true,
      showProductTable: true,
      showAmountSummary: true,
      showRemarks: true,
      showTerms: true,
      showFooter: true,
    },
    bindings: {
      company: true,
      products: true,
      documentNumber: true,
      date: true,
      amountSummary: true,
      remarks: true,
      terms: true,
      logo: true,
      signature: true,
      stamp: false,
      customer: true,
    },
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "official-supply-chain-quote",
    toolKey: "supply-chain-quote",
    name: "供应链报价单模板",
    origin: "official",
    ownerId: "",
    fields: defaultFields(),
    columns: defaultColumns(),
    contentBlocks: [],
    style: {
      primaryColor: "#7c3aed",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "14px",
      titleFontSize: "24px",
      pageMargin: "32px",
      logoPosition: "left",
      showSignature: true,
      showStamp: true,
      stampMode: "placeholder",
      tableHeaderBg: "#1a56db",
      tableHeaderColor: "#ffffff",
      borderRadius: "8px",
      cellPadding: "8px",
      companyBlockStyle: "subtle",
      totalBlockStyle: "minimal",
      tableStyle: "clean",
      guideOutline: true,
      stylePreset: "classic-blue",
    },
    layout: {
      showHeader: true,
      showCompanyInfo: true,
      showProductTable: true,
      showAmountSummary: true,
      showRemarks: true,
      showTerms: false,
      showFooter: true,
    },
    bindings: {
      company: true,
      products: true,
      documentNumber: true,
      date: true,
      amountSummary: true,
      remarks: true,
      terms: false,
      logo: true,
      signature: true,
      stamp: false,
      customer: true,
    },
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
];

/**
 * 根据工具 key 获取默认模板
 */
export function getOfficialTemplateForTool(toolKey: string): TemplateConfig | undefined {
  return OFFICIAL_TEMPLATES.find(t => t.toolKey === toolKey);
}

/**
 * 根据 id 获取官方模板
 */
export function getOfficialTemplateById(id: string): TemplateConfig | undefined {
  return OFFICIAL_TEMPLATES.find(t => t.id === id);
}

/**
 * 获取所有官方模板
 */
export function getAllOfficialTemplates(): TemplateConfig[] {
  return OFFICIAL_TEMPLATES;
}
