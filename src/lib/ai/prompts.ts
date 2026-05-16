// src/lib/ai/prompts.ts — Structured prompts for AI tools
// Each prompt returns a system prompt and user prompt

export type ToolType = "product_copy" | "translate_polish" | "document_summary";

interface ProductCopyInput {
  productName: string;
  sellingPoints: string;
  platform: string; // Amazon / TikTok / Shopify / 小红书 / 通用
  language: string; // 中文 / 英文 / 中英双语
}

interface TranslatePolishInput {
  text: string;
  targetLang: string; // 中文 / 英文
  style: string; // 正式 / 自然 / 商务 / 礼貌 / 简洁
}

interface DocumentSummaryInput {
  text: string;
  docType: string; // 租房合同 / 工作邮件 / 学校通知 / 商务合同 / 其他
}

export function getProductCopyPrompt(input: ProductCopyInput) {
  const systemPrompt = `你是一个专业的跨境电商文案专家。请根据用户输入生成商品文案。

要求：
1. 以 JSON 格式输出，包含以下字段：title, bullets(数组，5条), videoScript, seoKeywords(数组)
2. 标题要简洁有力，符合${input.platform}平台风格
3. 五点描述突出卖点，不夸大，不使用"最好""第一"等违规词
4. 视频脚本约 30-60 秒，包含开头钩子、核心展示、行动号召
5. SEO 关键词 5-8 个，用${input.language}输出
6. 不要输出除 JSON 外的任何内容
7. 语言：${input.language}

注意：
- 不保证疗效或治疗效果
- 不生成明显违规的广告词
- 数据类描述注明"约""大约"等`;

  const userPrompt = `商品名称：${input.productName}
商品卖点：${input.sellingPoints}
目标平台：${input.platform}
语言：${input.language}

请生成完整的商品文案。`;

  return { systemPrompt, userPrompt };
}

export function getTranslatePolishPrompt(input: TranslatePolishInput) {
  const systemPrompt = `你是一个专业的翻译和润色专家。

要求：
1. 以 JSON 格式输出，包含字段：translated(翻译结果), polished(润色版本), notes(重点表达说明)
2. translated 是准确翻译，保留原意
3. polished 是按照"${input.style}"风格润色后的版本
4. notes 说明重要的表达方式、文化差异、语气选择
5. 不要输出除 JSON 外的任何内容
6. 润色风格：${input.style}

注意：
- 保留原意，不虚构事实
- 不添加原文没有的信息
- 保持专业准确`;

  const userPrompt = `原文：
${input.text}

目标语言：${input.targetLang}
风格：${input.style}

请翻译并润色。`;

  return { systemPrompt, userPrompt };
}

export function getDocumentSummaryPrompt(input: DocumentSummaryInput) {
  const systemPrompt = `你是一个专业的文档分析和摘要助手。你可以帮助用户理解各类文档内容。

要求：
1. 以 JSON 格式输出，包含字段：summary(中文摘要), keyPoints(数组，重点条款), risks(数组，风险提醒), disclaimer
2. 摘要用简洁中文，不超过 300 字
3. 重点条款列出 5-8 条关键信息
4. 风险提醒列出用户需要注意的潜在问题
5. disclaimer 固定为："⚠️ 以上摘要仅供参考，不构成法律建议。重要文件请咨询专业律师。"
6. 不要输出除 JSON 外的任何内容
7. 文档类型：${input.docType}

注意：
- 仅做摘要分析，不提供法律意见
- 如发现明显不公平条款，在风险中提醒
- 不确定的内容注明"需确认"`;

  const userPrompt = `文档类型：${input.docType}

文档内容：
${input.text}

请分析并生成摘要。`;

  return { systemPrompt, userPrompt };
}
