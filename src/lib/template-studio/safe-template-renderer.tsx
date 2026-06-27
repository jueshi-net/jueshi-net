"use client";

/**
 * Safe Template Renderer
 *
 * 安全渲染策略：
 * - 零 dangerouslySetInnerHTML — 所有内容通过 React JSX 渲染
 * - 数据绑定通过 props 传入，不解析模板字符串
 * - 样式通过 inline style 对象应用，不注入 CSS 字符串
 * - 公司资料/商品/单据字段全部通过类型安全的数据接口
 *
 * @module template-studio/safe-template-renderer
 */

import React, { forwardRef } from "react";
import type {
  TemplateConfig,
  TemplateFieldConfig,
  TemplateColumnConfig,
  TemplateStyleConfig,
  TemplateLayoutConfig,
  ContentBlock,
  CompanyProfile,
  ProductItem,
  DocumentData,
} from "./template-schema";
import {
  getCompanyDisplayName,
  getCompanyDisplayNameEn,
  getPaperSizeConfig,
} from "./template-schema";
import { SealGenerator, defaultSealConfig } from "./seal-generator";
// ============================================================

export interface TemplateRenderData {
  company?: CompanyProfile | null;
  products?: ProductItem[];
  document?: DocumentData;
  customer?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  remarks?: string;
  terms?: string;
}

// ============================================================
// 样式工具
// ============================================================

/**
 * 将 TemplateStyleConfig 转换为 React CSSProperties 对象
 * 不使用字符串拼接，防止 CSS 注入
 */
function buildStyleObject(style: TemplateStyleConfig): React.CSSProperties {
  return {
    primaryColor: style.primaryColor,
    fontFamily: style.fontFamily || "system-ui, sans-serif",
    fontSize: style.fontSize || "14px",
  };
}

/**
 * 构建主色调样式
 */
function primaryColorStyle(color: string): React.CSSProperties {
  return {
    color: color,
  };
}

function primaryBgStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: color,
  };
}

function primaryBorderStyle(color: string): React.CSSProperties {
  return {
    borderColor: color,
  };
}

// ============================================================
// 子组件
// ============================================================

/** Logo 区域 */
function LogoArea({
  logo,
  position,
  companyName,
}: {
  logo?: string;
  position: string;
  companyName?: string;
}) {
  if (position === "none" || !logo) {
    return null;
  }

  const justify =
    position === "left" ? "flex-start" :
    position === "right" ? "flex-end" :
    "center";

  return (
    <div style={{ display: "flex", justifyContent: justify, marginBottom: "16px" }}>
      <img
        src={logo}
        alt={companyName || "Company Logo"}
        style={{ maxHeight: "60px", maxWidth: "200px", objectFit: "contain" }}
      />
    </div>
  );
}

/** 公司资料区 */
function CompanyInfo({
  company,
  style,
}: {
  company: CompanyProfile | null | undefined;
  style: TemplateStyleConfig;
}) {
  const blockStyle = style.companyBlockStyle || "subtle";

  if (!company) {
    return (
      <div className="guide-outline" style={{ padding: "12px", color: "#999", border: "1px dashed #ccc", borderRadius: "4px", marginBottom: "16px" }}>
        未选择公司资料
      </div>
    );
  }

  // Determine container style based on companyBlockStyle
  let containerStyle: React.CSSProperties = { marginBottom: "16px" };
  if (blockStyle === "none") {
    containerStyle = { marginBottom: "16px", padding: "0" };
  } else if (blockStyle === "subtle") {
    containerStyle = { marginBottom: "16px", padding: "10px 14px", borderLeft: `3px solid ${style.primaryColor}`, backgroundColor: "#fafafa", borderRadius: "0 4px 4px 0" };
  } else if (blockStyle === "card") {
    containerStyle = { marginBottom: "16px", padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fdfdfd" };
  } else if (blockStyle === "bordered") {
    containerStyle = { marginBottom: "16px", padding: "12px 14px", border: `1px solid ${style.primaryColor}`, borderRadius: "4px" };
  }

  return (
    <div style={containerStyle} data-testid="template-preview-company-info">
      <div style={{ fontSize: "17px", fontWeight: "bold", color: style.primaryColor, marginBottom: "3px" }} data-testid="template-preview-company-name">
        {getCompanyDisplayName(company)}
      </div>
      {getCompanyDisplayNameEn(company) && (
        <div style={{ fontSize: "13px", color: "#888", marginBottom: "4px" }}>{getCompanyDisplayNameEn(company)}</div>
      )}
      <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.6" }}>
        {company.contactName && <span>联系人: {company.contactName}　</span>}
        {(company.address || company.cityPostal) && <span>地址: {company.address || ""}{company.cityPostal ? ` ${company.cityPostal}` : ""}　</span>}
        {company.phone && <span>电话: {company.phone}　</span>}
        {company.email && <span>邮箱: {company.email}　</span>}
        {company.website && <span>网址: {company.website}　</span>}
        {company.taxId && <span>税号: {company.taxId}</span>}
      </div>
    </div>
  );
}

/** 单据头部（编号、日期） */
function DocumentHeader({
  doc,
  fields,
  style,
}: {
  doc: DocumentData | undefined;
  fields: TemplateFieldConfig[];
  style: TemplateStyleConfig;
}) {
  const visibleFields = fields.filter(f => f.visible);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
      {visibleFields.map(field => {
        let value = "";
        if (field.key === "documentNumber" && doc?.number) value = doc.number;
        else if (field.key === "documentDate" && doc?.date) value = doc.date;
        else if (field.key === "dueDate" && doc?.dueDate) value = doc.dueDate;
        else if (field.key === "documentType" && doc?.type) value = doc.type;
        else if (field.key === "currency" && doc?.currency) value = doc.currency;

        return (
          <div key={field.key} style={{ minWidth: "120px" }}>
            <div style={{ fontSize: "12px", color: "#999" }}>{field.label}</div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: style.primaryColor }}>{value || "—"}</div>
          </div>
        );
      })}
    </div>
  );
}

/** 客户/收货方区域 */
function CustomerInfo({
  customer,
  style,
}: {
  customer?: { name?: string; address?: string; phone?: string; email?: string };
  style: TemplateStyleConfig;
}) {
  if (!customer || (!customer.name && !customer.address)) {
    return null;
  }

  return (
    <div style={{ marginBottom: "16px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
      <div style={{ fontSize: "13px", color: "#999", marginBottom: "4px" }}>客户 / 收货方</div>
      {customer.name && (
        <div style={{ fontSize: "15px", fontWeight: "600", color: style.primaryColor }}>{customer.name}</div>
      )}
      {customer.address && (
        <div style={{ fontSize: "13px", color: "#555" }}>{customer.address}</div>
      )}
      {customer.phone && (
        <div style={{ fontSize: "13px", color: "#555" }}>电话: {customer.phone}</div>
      )}
      {customer.email && (
        <div style={{ fontSize: "13px", color: "#555" }}>邮箱: {customer.email}</div>
      )}
    </div>
  );
}

/** 商品明细表格 */
function ProductTable({
  products,
  columns,
  style,
}: {
  products: ProductItem[];
  columns: TemplateColumnConfig[];
  style: TemplateStyleConfig;
}) {
  const visibleColumns = columns.filter(c => c.visible);
  const tableStyleName = style.tableStyle || "clean";

  if (visibleColumns.length === 0) {
    return null;
  }

  // Header style: thin bottom border, no heavy box
  const headerBorderStyle = tableStyleName === "bordered"
    ? `1px solid ${style.tableHeaderBg}`
    : `1px solid ${style.tableHeaderBg}`;
  const headerBg = style.tableHeaderBg || style.primaryColor;
  const headerColor = style.tableHeaderColor || "#fff";

  // Cell border: very thin, light color
  const cellBorder = tableStyleName === "bordered"
    ? "1px solid #d1d5db"
    : "none";
  const cellBorderBottom = tableStyleName === "clean"
    ? "1px solid #e5e7eb"
    : "1px solid #d1d5db";

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: style.fontSize || "13px" }} data-testid="template-product-table">
      <thead>
        <tr style={{ backgroundColor: headerBg }}>
          {visibleColumns.map(col => (
            <th key={col.key} style={{
              padding: style.cellPadding || "8px 12px",
              textAlign: "left",
              color: headerColor,
              fontSize: "12px",
              fontWeight: "600",
              borderBottom: `1px solid ${style.primaryColor}`,
              borderLeft: tableStyleName === "bordered" ? cellBorder : "none",
              borderRight: tableStyleName === "bordered" ? cellBorder : "none",
              borderTop: tableStyleName === "bordered" ? cellBorder : "none",
            }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.length === 0 ? (
          <tr>
            <td colSpan={visibleColumns.length} style={{ padding: "16px", textAlign: "center", color: "#999", borderBottom: cellBorderBottom }}>
              暂无商品明细
            </td>
          </tr>
        ) : (
          products.map((product, idx) => (
            <tr key={product.id || idx} style={{
              borderBottom: cellBorderBottom,
              backgroundColor: tableStyleName === "striped" && idx % 2 === 1 ? "#f9fafb" : "transparent",
            }}>
              {visibleColumns.map(col => {
                let value: string | number = "";
                switch (col.key) {
                  case "name": value = product.name || ""; break;
                  case "sku": value = product.sku || ""; break;
                  case "nameEn": value = product.nameEn || ""; break;
                  case "hsCode": value = product.hsCode || ""; break;
                  case "unit": value = product.unit || ""; break;
                  case "quantity": value = product.quantity ?? ""; break;
                  case "unitPrice": value = product.unitPrice ?? ""; break;
                  case "totalPrice": value = product.totalPrice ?? ""; break;
                  case "weight": value = product.weight ? `${product.weight} kg` : ""; break;
                  case "volume": value = product.volume ? `${product.volume} m³` : ""; break;
                  case "origin": value = product.origin || ""; break;
                  default:
                    value = (product as Record<string, unknown>)[col.key] as string | number || "";
                    break;
                }
                return (
                  <td key={col.key} style={{
                    padding: style.cellPadding || "8px 12px",
                    borderBottom: cellBorderBottom,
                    borderLeft: tableStyleName === "bordered" ? cellBorder : "none",
                    borderRight: tableStyleName === "bordered" ? cellBorder : "none",
                    fontSize: "13px",
                    color: "#333",
                  }}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

/** 金额汇总区 */
function AmountSummary({
  products,
  doc,
  style,
  layout,
}: {
  products: ProductItem[];
  doc: DocumentData | undefined;
  style: TemplateStyleConfig;
  layout: TemplateLayoutConfig;
}) {
  if (!layout.showAmountSummary) return null;

  const subtotal = products.reduce((sum, p) => sum + (p.totalPrice || 0), 0);
  const currency = doc?.currency || "CNY";
  const itemCount = products.length;
  const totalStyle = style.totalBlockStyle || "minimal";

  // Minimal: no border, just right-aligned text
  // Table: small clean table
  // Card: light border card
  let containerStyle: React.CSSProperties = {};
  if (totalStyle === "minimal") {
    containerStyle = { minWidth: "220px" };
  } else if (totalStyle === "table") {
    containerStyle = { minWidth: "240px" };
  } else if (totalStyle === "card") {
    containerStyle = { minWidth: "240px", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fdfdfd" };
  }

  if (totalStyle === "table") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <table style={{ ...containerStyle, borderCollapse: "collapse", fontSize: "13px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 16px 4px 0", color: "#666", textAlign: "right" }}>商品数量</td>
              <td style={{ padding: "4px 0", fontWeight: "500", textAlign: "right", minWidth: "80px" }}>{itemCount}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 16px 4px 0", color: "#666", textAlign: "right" }}>小计</td>
              <td style={{ padding: "4px 0", fontWeight: "500", textAlign: "right" }}>{currency} {subtotal.toFixed(2)}</td>
            </tr>
            <tr style={{ borderTop: `1px solid ${style.primaryColor}` }}>
              <td style={{ padding: "6px 16px 6px 0", fontWeight: "bold", color: style.primaryColor, textAlign: "right" }}>总计</td>
              <td style={{ padding: "6px 0", fontWeight: "bold", color: style.primaryColor, textAlign: "right", fontSize: "15px" }}>{currency} {subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Minimal or card
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
      <div style={containerStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>商品数量</span>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#555" }}>{itemCount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>小计</span>
          <span style={{ fontSize: "13px", fontWeight: "500", color: "#555" }}>{currency} {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: `1px solid ${style.primaryColor}` }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: style.primaryColor }}>总计</span>
          <span style={{ fontSize: "15px", fontWeight: "bold", color: style.primaryColor }}>{currency} {subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

/** 备注/条款区 */
function RemarksTerms({
  remarks,
  terms,
  style,
  layout,
}: {
  remarks?: string;
  terms?: string;
  style: TemplateStyleConfig;
  layout: TemplateLayoutConfig;
}) {
  return (
    <>
      {layout.showRemarks && remarks && (
        <div style={{ marginBottom: "12px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "4px" }}>备注</div>
          <div style={{ fontSize: "13px", color: "#555", whiteSpace: "pre-wrap" }}>{remarks}</div>
        </div>
      )}
      {layout.showTerms && terms && (
        <div style={{ marginBottom: "12px", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
          <div style={{ fontSize: "13px", color: "#999", marginBottom: "4px" }}>条款</div>
          <div style={{ fontSize: "12px", color: "#777", whiteSpace: "pre-wrap" }}>{terms}</div>
        </div>
      )}
    </>
  );
}

/** 自定义内容块渲染 */
function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);
  const visible = sorted.filter(b => b.visible);

  if (visible.length === 0) return null;

  return (
    <>
      {visible.map(block => {
        if (block.type === "spacer") {
          return <div key={block.id} style={{ height: "24px" }} />;
        }
        if (block.type === "divider") {
          return (
            <div
              key={block.id}
              style={{ height: "1px", backgroundColor: "#e5e7eb", margin: "12px 0" }}
            />
          );
        }
        // text block
        return (
          <div
            key={block.id}
            style={{
              marginBottom: "12px",
              padding: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
            }}
          >
            {block.title && (
              <div style={{ fontSize: "13px", color: "#999", marginBottom: "4px" }}>
                {block.title}
              </div>
            )}
            <div style={{ fontSize: "13px", color: "#555", whiteSpace: "pre-wrap" }}>
              {block.content}
            </div>
          </div>
        );
      })}
    </>
  );
}

/** 签名/印章区 */
function SignatureArea({
  style,
  showSignature,
  showStamp,
  companyName,
  company,
}: {
  style: TemplateStyleConfig;
  showSignature: boolean;
  showStamp: boolean;
  companyName?: string;
  company?: CompanyProfile | null;
}) {
  if (!showSignature && !showStamp) return null;

  const stampMode = style.stampMode || "placeholder";

  // Determine stamp rendering
  let stampElement: React.ReactNode = null;
  if (showStamp && stampMode !== "none") {
    if (stampMode === "placeholder") {
      // Placeholder: visible on screen, hidden in print/PNG
      stampElement = (
        <div style={{ minWidth: "200px", textAlign: "right" }}>
          <div
            data-testid="stamp-placeholder"
            className="stamp-placeholder"
            style={{
              width: "80px",
              height: "80px",
              border: `2px dashed ${style.primaryColor}`,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: style.primaryColor,
              fontSize: "12px",
              opacity: 0.4,
            }}
          >
            印章占位
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>盖章</div>
        </div>
      );
    } else if (stampMode === "generated") {
      // Generated: real SVG circular seal with arc text, visible in print/PNG
      const stampText = companyName || "公司印章";
      const sealColor = style.sealColor || "#dc2626";
      const sealConfig = defaultSealConfig(
        style.sealTopText || stampText,
        sealColor,
      );
      // Override with user-configured values if provided
      if (style.sealBottomText) sealConfig.bottomText = style.sealBottomText;
      if (style.sealCenterText) sealConfig.centerText = style.sealCenterText;
      stampElement = (
        <div style={{ minWidth: "200px", textAlign: "right" }}>
          <div
            data-testid="stamp-generated"
            className="stamp-generated"
            style={{
              display: "inline-block",
              opacity: 0.85,
              transform: "rotate(-5deg)",
            }}
          >
            <SealGenerator {...sealConfig} size={120} />
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>盖章</div>
        </div>
      );
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "40px", paddingTop: "16px", borderTop: `1px solid #d1d5db` }}>
      {showSignature && (
        <div style={{ minWidth: "200px" }}>
          <div style={{ height: "50px" }} />
          <div style={{ borderTop: "1px solid #555", paddingTop: "4px", fontSize: "12px", color: "#666" }}>授权签字</div>
        </div>
      )}
      {stampElement}
    </div>
  );
}

// ============================================================
// 主渲染器
// ============================================================

export interface SafeTemplateRendererProps {
  config: TemplateConfig;
  data: TemplateRenderData;
}

/**
 * SafeTemplateRenderer — 安全模板渲染器
 *
 * 接收模板配置和数据，渲染为 React 组件树。
 * 不使用 dangerouslySetInnerHTML，不解析模板字符串，
 * 所有数据通过类型安全的 props 传入。
 */
export const SafeTemplateRenderer = forwardRef<HTMLDivElement, SafeTemplateRendererProps>(
  ({ config, data }, ref) => {
    const { style, layout, fields, columns, contentBlocks } = config;
    const company = data.company || null;
    const products = data.products || [];
    const doc = data.document;

    const paperConfig = getPaperSizeConfig(style.paperSize || "A4");
    const aspectRatio = paperConfig.aspectRatio;
    // Calculate preview dimensions based on paper size (scale down for screen)
    const previewWidth = 800; // px
    const previewHeight = previewWidth / aspectRatio;

    return (
      <div
        ref={ref}
        data-testid="template-preview"
        className="template-preview template-print-area"
        style={{
          fontFamily: style.fontFamily || "system-ui, sans-serif",
          fontSize: style.fontSize || "14px",
          color: "#333",
          backgroundColor: "#fff",
          padding: style.pageMargin || "32px",
          width: `${previewWidth}px`,
          height: `${previewHeight}px`,
          margin: "0 auto",
          borderRadius: style.borderRadius || "8px",
          aspectRatio: `${paperConfig.width} / ${paperConfig.height}`,
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <LogoArea
          logo={company?.logoDataUrl || company?.logo}
          position={style.logoPosition}
          companyName={company ? getCompanyDisplayName(company) : undefined}
        />

        {/* 标题 */}
        {layout.showHeader && (
          <h1 style={{
            textAlign: "center",
            fontSize: style.titleFontSize || "22px",
            fontWeight: "bold",
            color: style.primaryColor,
            marginBottom: "20px",
            paddingBottom: "8px",
            borderBottom: `1px solid ${style.primaryColor}`,
          }} data-testid="template-preview-title">
            {config.name}
          </h1>
        )}

        {/* 公司资料 */}
        {layout.showCompanyInfo && (
          <CompanyInfo company={company} style={style} />
        )}

        {/* 单据头部 */}
        <DocumentHeader doc={doc} fields={fields} style={style} />

        {/* 客户/收货方 */}
        <CustomerInfo customer={data.customer} style={style} />

        {/* 商品明细 */}
        {layout.showProductTable && (
          <ProductTable products={products} columns={columns} style={style} />
        )}

        {/* 金额汇总 */}
        <AmountSummary products={products} doc={doc} style={style} layout={layout} />

        {/* 自定义内容块 */}
        <ContentBlocks blocks={contentBlocks || []} />

        {/* 备注/条款 */}
        <RemarksTerms
          remarks={data.remarks}
          terms={data.terms}
          style={style}
          layout={layout}
        />

        {/* 签名/印章 */}
        <SignatureArea
          style={style}
          showSignature={style.showSignature}
          showStamp={style.showStamp}
          companyName={company ? getCompanyDisplayName(company) : undefined}
          company={company}
        />
      </div>
    );
  }
);

SafeTemplateRenderer.displayName = "SafeTemplateRenderer";

export default SafeTemplateRenderer;
