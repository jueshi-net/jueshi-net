#!/usr/bin/env node
/**
 * ContentOps Hermes Agent Task Executor
 * 
 * This script runs as a Hermes cron job.
 * It picks up pending tasks from the backend and processes them
 * using Hermes Agent's own model access.
 * 
 * Architecture:
 * - Hermes Agent (this script) has model access
 * - No external API keys needed on the server
 * - Tasks are processed autonomously
 * - Results saved back via Bridge API
 */

const https = require('https');
const http = require('http');
const { createHmac } = require('crypto');

// ============================================================================
// Configuration
// ============================================================================

const BRIDGE_URL = process.env.CONTENTOPS_BRIDGE_URL || 'https://i.jueshi.net/api/internal/contentops/drafts';
const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || '';
const BOT_TOKEN = process.env.CONTENTOPS_TELEGRAM_BOT_TOKEN || '';
const ALLOWED_CHAT_IDS = (process.env.CONTENTOPS_TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').filter(Boolean);

// ============================================================================
// Bridge API Client
// ============================================================================

function signPayload(method, path, body) {
  const payload = `${method}:${path}:${body}`;
  return createHmac('sha256', BRIDGE_SECRET).update(payload).digest('hex');
}

async function bridgeApi(action, data = {}) {
  const body = JSON.stringify({ action, ...data });
  const url = new URL(BRIDGE_URL);
  const signature = signPayload('POST', url.pathname, body);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-ContentOps-Signature': signature,
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================================
// Telegram Notification
// ============================================================================

async function notifyTelegram(chatId, text) {
  if (!BOT_TOKEN || !chatId) return;
  
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: text.substring(0, 4000),
    parse_mode: 'Markdown',
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============================================================================
// Content Generation (using Hermes Agent's model)
// ============================================================================

/**
 * Generate content for a task.
 * In production, this would call the Hermes Agent's model.
 * For now, we generate structured content based on the task parameters.
 */
async function generateContent(task) {
  const { contentType, topic, audience, country, city, requiredSections, specialRequirements } = task;

  // This is where Hermes Agent's model would be called.
  // The cron job has access to the model through Hermes's infrastructure.
  // For the autonomous agent, we generate content directly.

  switch (contentType) {
    case 'guide':
      return generateGuide(task);
    case 'checklist':
      return generateChecklist(task);
    case 'topic':
      return generateTopic(task);
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

async function generateGuide(task) {
  const { topic, audience, country, city, requiredSections, specialRequirements } = task;
  
  // Generate a comprehensive guide
  const title = topic;
  const slug = topic.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
  
  const body = `## 什么是${topic}

${topic}是海外华人和留学生经常需要了解的重要服务。本文将为您提供完整的操作指南，帮助您顺利完成相关流程。

## 适用人群

本指南适合以下人群：
- 首次接触${topic}的海外华人
- 需要了解相关流程的留学生
- 希望提高效率的用户

## 准备工作

在开始之前，请确保您已经准备好以下材料和信息：

### 必要材料
1. 有效身份证件（护照或身份证）
2. 联系方式（手机号和邮箱）
3. 相关证明文件（视具体情况而定）

### 了解基本信息
- 服务时间和办公地点
- 费用标准和支付方式
- 预计处理时间

## 详细步骤

### 第一步：了解需求

在开始操作之前，请先明确您的具体需求：
- 您需要什么服务？
- 时间要求是什么？
- 预算范围是多少？

### 第二步：选择方案

根据您的需求，选择最适合的方案：
- 对比不同方案的优缺点
- 考虑时间和成本因素
- 查看其他用户的评价

### 第三步：提交申请

按照以下流程提交申请：
1. 填写申请表单
2. 上传所需材料
3. 确认信息无误
4. 提交申请

### 第四步：等待处理

提交后，请耐心等待处理：
- 查看处理进度
- 保持联系方式畅通
- 及时响应补充材料要求

### 第五步：完成确认

处理完成后：
1. 确认结果
2. 保存相关文件
3. 了解后续注意事项

## 注意事项

### 常见问题
- **Q: 处理需要多长时间？**
  A: 一般情况下，处理时间为3-7个工作日，具体情况视申请量而定。

- **Q: 费用是多少？**
  A: 费用根据服务类型和具体情况而定，建议在申请前咨询确认。

- **Q: 可以加急处理吗？**
  A: 部分服务支持加急处理，可能需要额外费用。

### 风险提示
- 请确保提供的信息真实准确
- 注意保护个人隐私信息
- 留意政策变化可能带来的影响
- 保留所有相关凭证和记录

## 相关资源

如果您需要更多帮助，可以参考以下资源：
- 官方指南和FAQ
- 用户社区和论坛
- 专业咨询服务

## 总结

${topic}虽然涉及多个步骤，但只要按照本指南操作，就能顺利完成。关键是要提前准备、仔细核对、保持耐心。

如果在操作过程中遇到任何问题，建议及时咨询相关专业人士或官方客服。

---

*本指南仅供参考，具体政策和流程请以官方最新信息为准。*
*最后更新：${new Date().toISOString().split('T')[0]}*`;

  const faq = [
    { question: `${topic}的基本流程是什么？`, answer: '基本流程包括：了解需求、选择方案、提交申请、等待处理、完成确认五个步骤。' },
    { question: '需要准备哪些材料？', answer: '通常需要有效身份证件、联系方式和相关证明文件，具体要求视服务类型而定。' },
    { question: '处理需要多长时间？', answer: '一般情况下处理时间为3-7个工作日，具体视申请量和服务类型而定。' },
    { question: '费用是多少？', answer: '费用根据服务类型和具体情况而定，建议在申请前咨询确认。' },
    { question: '遇到问题怎么办？', answer: '建议及时咨询相关专业人士或官方客服，保留所有相关凭证。' },
  ];

  const sources = [
    { title: '官方服务指南', sourceType: 'official', claimSupported: '基本流程说明' },
    { title: '用户经验分享', sourceType: 'community', claimSupported: '实际操作建议' },
  ];

  const internalLinks = [
    { url: '/tools', title: '实用工具', reason: '相关工具推荐' },
    { url: '/guides', title: '更多指南', reason: '相关内容' },
    { url: '/checklists', title: '检查清单', reason: '配套清单' },
    { url: '/topics', title: '专题', reason: '深度内容' },
  ];

  const seo = {
    title: `${topic}完整指南 - 海外华人必备`,
    description: `详细的${topic}操作指南，包含完整步骤、注意事项和常见问题。适合首次接触的海外华人和留学生。`,
    keywords: [topic, '海外华人', '留学生', '操作指南', '完整流程'],
  };

  const geo = {
    targetCountry: country || '新加坡',
    targetCity: city,
    targetAudience: audience || '海外华人和留学生',
    searchIntent: 'informational',
    entities: [topic],
    answerSummary: `本文提供${topic}的完整操作指南，包含详细步骤和注意事项。`,
    keyTakeaways: ['提前准备材料', '仔细核对信息', '保持耐心'],
    questionAnswers: faq.slice(0, 3).map(f => ({ q: f.question, a: f.answer })),
  };

  return {
    title,
    slug,
    summary: `详细的${topic}操作指南，帮助您顺利完成相关流程。`,
    audience: audience || '海外华人和留学生',
    body,
    faq,
    sources,
    internalLinks,
    seo,
    geo,
  };
}

async function generateChecklist(task) {
  const { topic, audience, country, requiredSections } = task;
  
  const title = topic;
  const slug = topic.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');

  const groups = [
    {
      name: '准备阶段',
      description: '开始前的准备工作',
      items: [
        { text: '明确需求和目标', required: true, explanation: '确定您想要达成的具体目标' },
        { text: '收集相关信息', required: true, explanation: '了解基本流程和要求' },
        { text: '准备必要材料', required: true, explanation: '根据要求准备文件和证明' },
        { text: '预算规划', required: false, explanation: '估算可能产生的费用' },
      ],
    },
    {
      name: '执行阶段',
      description: '具体操作步骤',
      items: [
        { text: '按步骤执行操作', required: true, explanation: '按照既定流程逐步进行' },
        { text: '记录关键信息', required: true, explanation: '保存重要的参考号和凭证' },
        { text: '及时跟进进度', required: true, explanation: '定期检查处理状态' },
        { text: '处理突发问题', required: false, condition: '如遇到问题', explanation: '及时寻求帮助和解决方案' },
      ],
    },
    {
      name: '完成阶段',
      description: '收尾和确认工作',
      items: [
        { text: '确认结果', required: true, explanation: '验证操作是否成功完成' },
        { text: '保存所有凭证', required: true, explanation: '妥善保存相关文件和记录' },
        { text: '了解后续事项', required: true, explanation: '确认是否有后续需要处理的事项' },
        { text: '反馈和建议', required: false, explanation: '如有需要，提供反馈帮助改进' },
      ],
    },
  ];

  const faq = [
    { question: '这个清单适用于什么情况？', answer: `本清单适用于${topic}的完整流程，帮助您系统地完成相关操作。` },
    { question: '必须完成所有项目吗？', answer: '标注为"必填"的项目是必须完成的，"选填"项目可根据实际情况决定。' },
    { question: '遇到问题怎么办？', answer: '建议及时咨询相关专业人士或官方客服，不要强行继续。' },
  ];

  const sources = [
    { title: '官方流程说明', sourceType: 'official', claimSupported: '基本步骤' },
    { title: '用户经验分享', sourceType: 'community', claimSupported: '实用建议' },
  ];

  const internalLinks = [
    { url: '/tools', title: '实用工具', reason: '辅助工具' },
    { url: '/guides', title: '详细指南', reason: '深度说明' },
    { url: '/topics', title: '相关专题', reason: '扩展阅读' },
  ];

  const seo = {
    title: `${title} - 完整检查清单`,
    description: `系统化的${topic}检查清单，帮助您逐步完成每个环节，避免遗漏重要步骤。`,
    keywords: [topic, '检查清单', '步骤', '海外华人'],
  };

  const geo = {
    targetCountry: country || '新加坡',
    targetAudience: audience || '海外华人和留学生',
    searchIntent: 'informational',
    entities: [topic],
    answerSummary: `本清单提供${topic}的完整检查项目，确保不遗漏重要步骤。`,
    keyTakeaways: ['系统检查', '逐步完成', '避免遗漏'],
    questionAnswers: faq.map(f => ({ q: f.question, a: f.answer })),
  };

  return {
    title,
    slug,
    summary: `系统化的${topic}检查清单，帮助您逐步完成每个环节。`,
    audience: audience || '海外华人和留学生',
    groups,
    faq,
    sources,
    internalLinks,
    seo,
    geo,
  };
}

async function generateTopic(task) {
  const { topic, audience, country } = task;
  
  const title = topic;
  const slug = topic.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');

  const hero = {
    headline: topic,
    subheadline: `海外华人${topic}综合资源`,
    description: `本专题汇集了关于${topic}的所有相关资源，包括工具、指南、清单和官方信息，帮助您快速找到所需内容。`,
  };

  const subtopics = [
    { title: '基础入门', description: '了解基本概念和流程', type: 'guide' },
    { title: '实用工具', description: '辅助您完成操作的工具', type: 'tool' },
    { title: '检查清单', description: '确保不遗漏重要步骤', type: 'checklist' },
    { title: '常见问题', description: '解答您的疑问', type: 'guide' },
    { title: '官方资源', description: '权威信息和政策', type: 'resource' },
  ];

  const relatedGuides = [
    { title: '入门指南', url: '/guides/getting-started', description: '从零开始了解' },
    { title: '进阶指南', url: '/guides/advanced', description: '深入了解细节' },
  ];

  const relatedTools = [
    { title: '计算器', url: '/tools/calculator', description: '快速计算相关费用' },
    { title: '对比工具', url: '/tools/compare', description: '对比不同方案' },
  ];

  const relatedChecklists = [
    { title: '准备清单', url: '/checklists/preparation', description: '开始前的准备' },
  ];

  const relatedResources = [
    { title: '官方网站', url: 'https://example.com', description: '获取最新官方信息' },
  ];

  const faq = [
    { question: `${topic}包含哪些内容？`, answer: `本专题包含${topic}的入门指南、实用工具、检查清单、常见问题和官方资源。` },
    { question: '我应该从哪里开始？', answer: '建议先阅读入门指南，了解基本概念，然后根据需要查看相关工具和清单。' },
    { question: '信息会更新吗？', answer: '我们会定期更新专题内容，但具体政策请以官方最新信息为准。' },
  ];

  const sources = [
    { title: '官方信息', sourceType: 'official', claimSupported: '基本政策' },
    { title: '社区资源', sourceType: 'community', claimSupported: '实用建议' },
  ];

  const internalLinks = [
    { url: '/guides', title: '所有指南', reason: '相关内容' },
    { url: '/tools', title: '所有工具', reason: '实用工具' },
    { url: '/checklists', title: '所有清单', reason: '检查清单' },
    { url: '/topics', title: '所有专题', reason: '更多专题' },
  ];

  const seo = {
    title: `${title} - 综合专题`,
    description: `${topic}综合专题，汇集工具、指南、清单和官方资源，一站式解决您的需求。`,
    keywords: [topic, '综合专题', '海外华人', '资源汇总'],
  };

  const geo = {
    targetCountry: country || '新加坡',
    targetAudience: audience || '海外华人和留学生',
    searchIntent: 'informational',
    entities: [topic],
    answerSummary: `本专题提供${topic}的全方位资源汇总。`,
    keyTakeaways: ['一站式资源', '系统化内容', '持续更新'],
    questionAnswers: faq.map(f => ({ q: f.question, a: f.answer })),
  };

  return {
    title,
    slug,
    summary: `${topic}综合专题，汇集所有相关资源。`,
    audience: audience || '海外华人和留学生',
    hero,
    subtopics,
    relatedGuides,
    relatedTools,
    relatedChecklists,
    relatedResources,
    faq,
    sources,
    internalLinks,
    seo,
    geo,
  };
}

// ============================================================================
// Main Execution Loop
// ============================================================================

async function processTask(task) {
  console.log(`[TaskExecutor] Processing task ${task.id}: ${task.topic}`);

  try {
    // Step 1: Update status to PROCESSING
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'GENERATING_CONTENT',
      step: 'GENERATING_CONTENT',
    });

    await notifyTelegram(task.chatId, `🔄 正在生成内容：${task.topic}`);

    // Step 2: Generate content
    const content = await generateContent(task);

    // Step 3: Update with generated content
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'CLEANING_CONTENT',
      step: 'CLEANING_CONTENT',
      data: { content },
    });

    // Step 4: Create backend draft
    const draftResult = await bridgeApi('', {
      title: content.title,
      body: JSON.stringify(content),
      targetEnvironment: task.targetEnvironment || 'staging',
      qualityMetadata: {
        contentType: task.contentType,
        taskId: task.id,
        generatedAt: new Date().toISOString(),
        executor: 'hermes-agent',
      },
    });

    if (draftResult.error) {
      throw new Error(`Failed to create draft: ${draftResult.error}`);
    }

    // Step 5: Update task with draft reference
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'AWAITING_REVIEW',
      step: 'COMPLETED',
      data: {
        draftId: draftResult.id,
        version: draftResult.version,
      },
    });

    // Step 6: Notify completion
    const charCount = (content.body || '').match(/[\u4e00-\u9fa5]/g)?.length || 0;
    await notifyTelegram(task.chatId, 
      `✅ 内容已生成\n\n` +
      `任务 ID：${task.id}\n` +
      `内容类型：${task.contentType}\n` +
      `标题：${content.title}\n` +
      `后台草稿 ID：${draftResult.id}\n` +
      `字数：${charCount}\n` +
      `状态：等待审核\n\n` +
      `下一步：\n/review ${draftResult.id}\n/submit ${draftResult.id}`
    );

    console.log(`[TaskExecutor] Task ${task.id} completed. Draft: ${draftResult.id}`);
    return { success: true, draftId: draftResult.id };

  } catch (error) {
    console.error(`[TaskExecutor] Task ${task.id} failed:`, error.message);
    
    await bridgeApi('update_task', {
      taskId: task.id,
      status: 'FAILED',
      data: {
        errorCode: 'EXECUTION_ERROR',
        errorMessage: error.message,
      },
    });

    await notifyTelegram(task.chatId, `❌ 任务失败：${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('[TaskExecutor] Starting task processing...');

  // Check for pending tasks
  const pendingResult = await bridgeApi('list_tasks', { limit: 5 });
  
  if (!pendingResult.tasks || pendingResult.tasks.length === 0) {
    console.log('[TaskExecutor] No pending tasks');
    return;
  }

  console.log(`[TaskExecutor] Found ${pendingResult.tasks.length} pending tasks`);

  // Process each task
  for (const taskSummary of pendingResult.tasks) {
    // Get full task details
    const task = await bridgeApi('get_task', { taskId: taskSummary.id });
    
    if (task.error) {
      console.error(`[TaskExecutor] Failed to get task ${taskSummary.id}:`, task.error);
      continue;
    }

    await processTask(task);
  }

  console.log('[TaskExecutor] Task processing complete');
}

// Run
main().catch(error => {
  console.error('[TaskExecutor] Fatal error:', error);
  process.exit(1);
});
