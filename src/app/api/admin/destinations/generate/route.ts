import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// AI generate endpoint — uses any OpenAI-compatible API
// Set env vars: AI_API_BASE_URL, AI_API_KEY, AI_MODEL
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { countryName, countryEn } = body;

  if (!countryName) {
    return NextResponse.json({ success: false, error: "countryName is required" }, { status: 400 });
  }

  const baseUrl = process.env.AI_API_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY || "";
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "AI_API_KEY not configured. Set it in .env.production",
    }, { status: 500 });
  }

  const prompt = `你是一位资深跨境出海专家与 SEO 大师。请为目标国家生成完整的 pSEO 聚合页数据。

目标国家：${countryName}${countryEn ? ` (${countryEn})` : ""}

请严格按照以下 JSON Schema 输出，不要输出任何额外文字或解释：

{
  "slug": "国家英文名小写连字符 (如 united-kingdom)",
  "name": "国家中文名",
  "nameEn": "国家英文名",
  "currency": "ISO 货币代码 (如 GBP)",
  "region": "所属大区 (北美/欧洲/东南亚/日韩/拉美/中东/澳洲)",
  "emoji": "国旗 emoji",
  "heroTitle": "吸引人的 Hero 标题，如 'XXX 出海全能工具箱'",
  "heroSubtitle": "一行副标题，突出核心服务",
  "seoTitle": "SEO 标题，包含核心关键词",
  "seoDescription": "150字左右的 SEO 描述",
  "keywords": ["关键词1", "关键词2", ...],  // 7-10 个长尾关键词
  "keyCities": ["城市1", "城市2", ...],  // 5 个主要城市
  "userCount": "商家数量，如 '5,000+'",
  "docCount": "单据数量，如 '20,000+'",
  "guides": [
    {
      "title": "指南标题",
      "description": "80-150字的详细描述，包含实操要点",
      "type": "guide | regulation | tax | logistics | customs"
    }
    // 生成 4-6 条指南，覆盖报关、税务、物流、指南等类型
  ],
  "services": [
    {
      "title": "服务商标题",
      "category": "仓储 | 物流 | 报关 | 税务 | 合规 | 代购",
      "description": "服务商描述，50-80字"
    }
    // 生成 3-4 条服务商
  ],
  "tools": [
    // 推荐 5-7 个工具 slug，从以下列表选择：
    // commercial-invoice, proforma-invoice, packing-list, sales-contract,
    // booking-instruction, customs-declaration-authorization, delivery-note,
    // freight-statement, consolidation-inbound-receipt, consolidation-packing-list,
    // express-declaration, quotation, shipping-instruction, trucking-dispatch-order,
    // shipping-mark, container-loading-list, return-packing-list,
    // certificate-of-origin-template, fumigation-certificate-template,
    // letter-of-credit-info-sheet, label-maker, postal-code,
    // shipping-calculator, exchange-rate
  ]
}

要求：
1. 内容真实、专业、符合该国实际法规和商业环境
2. guides 要覆盖不同 type，包含实用的实操细节和具体数字
3. services 要覆盖不同 category
4. tools 要选取最适合该国的工具组合
5. 所有文字使用简体中文
6. 仅输出 JSON，不要任何 markdown 代码块或其他文字`;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a professional JSON API. Only output valid JSON, no markdown, no explanations." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ success: false, error: `AI API error: ${response.status} ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";

    // Strip markdown code blocks if present
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ success: false, error: "AI returned invalid JSON" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: parsed });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: `Request failed: ${e.message}` }, { status: 500 });
  }
}
