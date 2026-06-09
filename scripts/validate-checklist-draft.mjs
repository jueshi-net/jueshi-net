#!/usr/bin/env node
/**
 * validate-checklist-draft.mjs
 * 校验清单 draft JSON 文件是否符合规范
 *
 * 用法: node scripts/validate-checklist-draft.mjs <json-file>
 */

import { readFileSync } from "node:fs";
import { basename } from "node:path";

const file = process.argv[2];
if (!file) {
  console.error("用法: node scripts/validate-checklist-draft.mjs <json-file>");
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(file, "utf-8"));
} catch (e) {
  console.error(`❌ ${basename(file)}: JSON 解析失败 — ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

// 1. status 必须是 draft
if (data.status !== "draft") {
  errors.push(`status 必须是 "draft"，当前为 "${data.status}"。Hermes 不允许生成 published 内容。`);
}

// 2. pageType 必须是 checklist
if (data.pageType !== "checklist") {
  errors.push(`pageType 必须是 "checklist"，当前为 "${data.pageType}"`);
}

// 3. title / slug / seoTitle / seoDescription 必填
for (const field of ["slug", "title", "seoTitle", "seoDescription"]) {
  if (!data[field]) errors.push(`${field} 必填`);
}

// 4. slug 格式检查
if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
  errors.push(`slug 格式错误: 只能包含小写字母、数字和连字符，当前为 "${data.slug}"`);
}

// 5. slug 不得以 test- 开头进入 published
if (data.slug && data.slug.startsWith("test-") && data.status === "published") {
  errors.push(`test- 前缀的 slug 不得为 published`);
}

// 6. publish_mode 不允许 published
if (data.publish_mode === "published") {
  errors.push(`publish_mode 不允许为 "published"，必须为 "draft"`);
}

// 7. heroSection 必填且结构校验
if (!data.heroSection || typeof data.heroSection !== "object") {
  errors.push("heroSection 必填且为对象");
} else {
  const hs = data.heroSection;
  for (const field of ["checklistType", "audience", "region", "scenario", "difficulty", "estimatedTime", "quickAnswer"]) {
    if (!hs[field]) errors.push(`heroSection.${field} 必填`);
  }

  // 8. sections 至少 3 个
  if (!Array.isArray(hs.sections) || hs.sections.length < 3) {
    errors.push(`sections 至少需要 3 个，当前 ${Array.isArray(hs.sections) ? hs.sections.length : 0} 个`);
  }

  // 9. checklistItems 总数至少 10 个
  const totalItems = Array.isArray(hs.sections)
    ? hs.sections.reduce((sum, s) => sum + (Array.isArray(s.items) ? s.items.length : 0), 0)
    : 0;
  if (totalItems < 10) {
    errors.push(`checklistItems 总数至少 10 个，当前 ${totalItems} 个`);
  }

  // 10. ChecklistItem 结构校验
  if (Array.isArray(hs.sections)) {
    for (const section of hs.sections) {
      if (!section.id || !section.title) {
        errors.push(`Section 缺少 id 或 title: ${JSON.stringify(section)}`);
      }
      if (Array.isArray(section.items)) {
        for (const item of section.items) {
          if (!item.id || !item.title) {
            errors.push(`ChecklistItem 缺少 id 或 title: ${JSON.stringify(item)}`);
          }
          if (typeof item.required !== "boolean") {
            warnings.push(`ChecklistItem "${item.title}" 缺少 required 布尔值`);
          }
          if (!["high", "medium", "low"].includes(item.priority)) {
            warnings.push(`ChecklistItem "${item.title}" priority 应为 high/medium/low，当前为 "${item.priority}"`);
          }
        }
      }
    }
  }

  // 11. avoidPitfalls 至少 5 条
  if (!Array.isArray(hs.avoidPitfalls) || hs.avoidPitfalls.length < 5) {
    errors.push(`avoidPitfalls 至少需要 5 条，当前 ${Array.isArray(hs.avoidPitfalls) ? hs.avoidPitfalls.length : 0} 条`);
  }

  // 12. nextSteps 至少 2 个
  if (!Array.isArray(hs.nextSteps) || hs.nextSteps.length < 2) {
    warnings.push(`nextSteps 建议至少 2 个，当前 ${Array.isArray(hs.nextSteps) ? hs.nextSteps.length : 0} 个`);
  }

  // 13. lastReviewedAt 必填
  if (!hs.lastReviewedAt) {
    errors.push("heroSection.lastReviewedAt 必填");
  }

  // 14. requiresHumanReview 必须为 true
  if (hs.requiresHumanReview !== true) {
    warnings.push("heroSection.requiresHumanReview 建议设为 true");
  }

  // 15. internalLinks 必须存在
  if (!hs.internalLinks || typeof hs.internalLinks !== "object") {
    errors.push("heroSection.internalLinks 必须存在");
  } else {
    if (!hs.internalLinks.backToTopic) warnings.push("internalLinks.backToTopic 建议填写所属专题链接");
    if (!Array.isArray(hs.internalLinks.relatedTools) || hs.internalLinks.relatedTools.length < 2) {
      warnings.push("internalLinks.relatedTools 建议至少 2 个");
    }
  }
}

// 16. faqItems 至少 5 个
if (!Array.isArray(data.faqItems) || data.faqItems.length < 5) {
  errors.push(`faqItems 至少需要 5 个，当前 ${Array.isArray(data.faqItems) ? data.faqItems.length : 0} 个`);
} else {
  for (const faq of data.faqItems) {
    if (!faq.question || !faq.answer) {
      errors.push(`FAQ 缺少 question 或 answer: ${JSON.stringify(faq)}`);
    }
  }
}

// 17. relatedTools 至少 3 个
if (!Array.isArray(data.relatedTools) || data.relatedTools.length < 3) {
  errors.push(`relatedTools 至少需要 3 个，当前 ${Array.isArray(data.relatedTools) ? data.relatedTools.length : 0} 个`);
}

// 18. officialLinks 至少 2 个，可为空 URL 但必须标记 needsReview
if (!Array.isArray(data.officialLinks) || data.officialLinks.length < 2) {
  errors.push(`officialLinks 至少需要 2 个占位，当前 ${Array.isArray(data.officialLinks) ? data.officialLinks.length : 0} 个`);
} else {
  const missingUrlReviews = data.officialLinks.filter(l => !l.url || l.url === "" || l.needsReview !== true);
  if (missingUrlReviews.length > 0) {
    warnings.push(`${missingUrlReviews.length} 个官方链接未标记 needsReview=true 或 URL 为空，需人工处理`);
  }
}

// 19. 高风险内容标记检查
let hasHumanReviewTag = false;
if (Array.isArray(data.heroSection?.sections)) {
  for (const section of data.heroSection.sections) {
    if (Array.isArray(section.items)) {
      for (const item of section.items) {
        if (item.warning && item.warning.includes("需人工核验")) {
          hasHumanReviewTag = true;
        }
      }
    }
  }
}
if (!hasHumanReviewTag) {
  warnings.push("未发现 [需人工核验] 标记，高风险内容建议添加");
}

// 输出结果
const name = basename(file);
if (errors.length > 0) {
  console.log(`\n❌ ${name} — ${errors.length} 个错误, ${warnings.length} 个警告\n`);
  for (const e of errors) console.log(`  ERROR: ${e}`);
  for (const w of warnings) console.log(`  WARN:  ${w}`);
  process.exit(1);
} else {
  console.log(`\n✅ ${name} — 校验通过 (${warnings.length} 个提示性警告)\n`);
  for (const w of warnings) console.log(`  WARN:  ${w}`);
  process.exit(0);
}
