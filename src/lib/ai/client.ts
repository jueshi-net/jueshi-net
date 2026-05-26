// src/lib/ai/client.ts — OpenAI-compatible AI client
// Supports any OpenAI-compatible API (OpenAI, Groq, local, etc.)

export function getEnv() {
  return {
    baseUrl: process.env.AI_API_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.AI_API_KEY || "",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    enabled: process.env.AI_ENABLED === "true",
    mock: process.env.AI_MOCK === "true",
  };
}

export function isAIEnabled(): boolean {
  const env = getEnv();
  return env.enabled || env.mock;
}

export function isMockMode(): boolean {
  return getEnv().mock;
}

export function getMockResponse(toolType: string): string {
  const mocks: Record<string, string> = {
    product_copy: JSON.stringify({
      title: "【测试模式】Premium Wireless Bluetooth Headphones — 降噪舒适长续航",
      bullets: [
        "【主动降噪】搭载 ANC 3.0 芯片，有效隔绝环境噪音，适合通勤办公",
        "【40 小时续航】满电可连续播放 40 小时，支持快充 10 分钟用 3 小时",
        "【舒适佩戴】记忆海绵耳罩 + 轻量化头梁，长时间佩戴不压迫",
        "【多设备连接】支持蓝牙 5.3，可同时连接手机和电脑无缝切换",
        "【清晰通话】内置 4 麦克风阵列，通话降噪，视频会议更清晰",
      ],
      videoScript: "开头 3 秒：展示噪音场景 → 戴上耳机瞬间安静。中间：突出续航、舒适度、音质。结尾：引导购买 + 限时优惠。",
      seoKeywords: ["wireless headphones", "noise cancelling", "bluetooth headphones", "40 hour battery", "comfortable headphones"],
    }),
    translate_polish: JSON.stringify({
      translated: "Dear Customer,\n\nThank you for your recent inquiry regarding the order status. We sincerely appreciate your patience and understanding.",
      polished: "尊敬的客户，\n\n感谢您近日关于订单状态的咨询。我们衷心感谢您的耐心与理解。",
      notes: "使用正式商务语气，保持礼貌和简洁。原文意思完全保留，未添加或删减关键信息。",
    }),
    document_summary: JSON.stringify({
      summary: "【测试模式】这是一份标准房屋租赁合同摘要。合同期为 12 个月，月租金 $1,500，押金为一个月租金。",
      keyPoints: [
        "租期：2026 年 6 月 1 日至 2027 年 5 月 31 日",
        "月租金：$1,500，每月 1 日前支付",
        "押金：$1,500，退房后 30 天内退还",
        "水电煤气费由租户自行承担",
        "不允许转租，养宠物需房东书面同意",
      ],
      risks: [
        "逾期付款可能产生滞纳金（通常为每日 $10）",
        "提前退租需支付 2 个月租金作为违约金",
        "押金退还条件未在合同中详细说明，建议与房东确认",
      ],
      disclaimer: "⚠️ 以上摘要仅供参考，不构成法律建议。重大合同请咨询专业律师。",
    }),
  };
  return mocks[toolType] || `【Mock 响应】toolType: ${toolType}\n\n此为测试模式下的模拟输出。`;
}

export async function callAI(
  messages: { role: string; content: string }[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<AIResponse> {
  const env = getEnv();

  if (env.mock) {
    return { content: getMockResponse("product_copy") };
  }

  if (!env.enabled || !env.apiKey) {
    throw new Error("AI service not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(`${env.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.apiKey}`,
      },
      body: JSON.stringify({
        model: env.model,
        messages,
        max_tokens: options?.maxTokens || 2000,
        temperature: options?.temperature ?? 0.7,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`AI API error: ${res.status} ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "",
      usage: { totalTokens: data.usage?.total_tokens },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

interface AIResponse {
  content: string;
  usage?: { totalTokens?: number };
}
