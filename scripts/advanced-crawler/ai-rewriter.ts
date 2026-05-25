// AI 净网与智能洗稿引擎
// 使用 DeepSeek API 进行：风控过滤、原创重构、自动打标

import { config } from "dotenv";
import { resolve } from "path";

// 加载 .env 文件
config({ path: resolve(__dirname, "../../.env") });

import { crawlUrl, extractDomain } from "./engine";

interface AiEnvConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

export interface AiEvaluationResult {
  status: "ACCEPT" | "REJECT";
  reason?: string; // 拒绝原因
  rewrittenDescription?: string; // 原创 SEO 描述（50字内）
  category?: string; // 自动分类
  tags?: string[]; // 自动标签
  qualityScore?: number; // 0-100
}

const SYSTEM_PROMPT = `你是一位资深的"出海向导"编辑，负责评估和收录海外实用网站/工具。

请对给定的网站信息进行严格评估，并以 JSON 格式返回结果。

评估维度：
1. **风控过滤**：检测是否含有博彩、色情、灰产、诈骗、恶意软件、硬广或毫无实质内容的空壳站。若命中，返回 REJECT。
2. **原创重构**：若内容优质，用中文生成 50 字以内的高度精炼 SEO 介绍。语气专业、实用、非营销。
3. **自动打标**：从以下分类中选择最精准的一项：life（海外生活）, logistics（跨境物流）, business（出海经营）, templates（工具模板）, education（教育学习）, tools（实用工具）
4. **质量评分**：0-100，基于内容充实度、实用性、权威性综合打分。

返回 JSON 格式（不要包含 markdown 代码块标记）：
{
  "status": "ACCEPT" | "REJECT",
  "reason": "拒绝原因（仅当 status 为 REJECT 时填写）",
  "rewrittenDescription": "50字以内的中文原创描述",
  "category": "life|logistics|business|templates|education|tools",
  "tags": ["标签1", "标签2"],
  "qualityScore": 85
}`;

function getAiConfig(): AiEnvConfig {
  const apiUrl =
    process.env.AI_API_BASE_URL || "https://api.deepseek.com/v1";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "deepseek-chat";

  if (!apiKey) {
    throw new Error("AI_API_KEY 环境变量未设置");
  }

  return { apiUrl, apiKey, model };
}

/**
 * 调用 AI 对网站信息进行评估与洗稿
 */
export async function evaluateWithAI(
  siteInfo: {
    url: string;
    title: string;
    description: string;
    domainAgeDays: number | null;
  },
  config?: AiEnvConfig
): Promise<AiEvaluationResult> {
  const cfg = config || getAiConfig();

  const prompt = `请评估以下网站：

URL: ${siteInfo.url}
标题: ${siteInfo.title}
原始描述: ${siteInfo.description || "(无)"}
域名年龄: ${siteInfo.domainAgeDays ? `${siteInfo.domainAgeDays} 天` : "未知"}`;

  try {
    // Timeout after 30s for AI calls
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const resp = await fetch(`${cfg.apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`AI API 错误: ${resp.status} ${errText}`);
    }

    const data = (await resp.json()) as any;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI 返回空响应");
    }

    // 解析 JSON（处理可能的 markdown 包裹）
    const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
    const result: AiEvaluationResult = JSON.parse(jsonStr);

    return result;
  } catch (err: any) {
    // 网络错误时返回降级结果
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return {
        status: "ACCEPT",
        rewrittenDescription:
          siteInfo.description?.slice(0, 50) || "海外实用网站",
        category: "tools",
        tags: ["海外工具"],
        qualityScore: 50,
      };
    }
    throw err;
  }
}

/**
 * 批量评估（带速率控制）
 */
export async function batchEvaluate(
  sites: Array<{
    url: string;
    title: string;
    description: string;
    domainAgeDays: number | null;
  }>,
  concurrency = 3,
  delayMs = 2000
): Promise<(AiEvaluationResult & { url: string })[]> {
  const results: (AiEvaluationResult & { url: string })[] = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    console.log(
      `  [${i + 1}/${sites.length}] AI 评估: ${site.title} (${site.url})`
    );

    try {
      const evalResult = await evaluateWithAI(site);
      results.push({ url: site.url, ...evalResult });
      console.log(
        `    → ${evalResult.status} | ${evalResult.category} | 评分: ${evalResult.qualityScore}`
      );
    } catch (err: any) {
      console.error(`    ✗ AI 评估失败: ${err.message}`);
      results.push({
        url: site.url,
        status: "REJECT",
        reason: `AI 评估异常: ${err.message}`,
        qualityScore: 0,
      });
    }

    if (i < sites.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return results;
}
