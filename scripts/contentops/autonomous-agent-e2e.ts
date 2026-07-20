#!/usr/bin/env tsx
/**
 * ContentOps Autonomous Agent E2E 测试
 * 
 * 测试三个验收案例：
 * A: Guide → 后台等待审核
 * B: Checklist → 定时发布
 * C: Topic → 直接发布
 * 
 * 使用方式：
 * tsx scripts/contentops/autonomous-agent-e2e.ts
 */

import { createHmac } from 'crypto';

const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || '';
const BRIDGE_URL = 'http://127.0.0.1:3001';
const ENDPOINT = '/api/internal/contentops/drafts';

function computeSignature(method: string, path: string, body: string): string {
  const payload = `${method.toUpperCase()}:${path}:${body}`;
  return createHmac('sha256', BRIDGE_SECRET)
    .update(payload)
    .digest('hex');
}

async function bridgeRequest(action: string, data: any = {}): Promise<any> {
  const body = JSON.stringify({ action, ...data });
  const signature = computeSignature('POST', ENDPOINT, body);

  const response = await fetch(`${BRIDGE_URL}${ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ContentOps-Signature': signature,
    },
    body,
  });

  return {
    status: response.status,
    data: await response.json(),
  };
}

async function testGuideCase() {
  console.log('\n=== 案例 A: Guide → 后台等待审核 ===');
  
  // 创建任务
  const createResult = await bridgeRequest('create_task', {
    task: {
      id: `task_e2e_guide_${Date.now()}`,
      originalMessage: '写一篇第一次使用国际集运的完整操作指南',
      parsedIntent: {
        contentType: 'guide',
        executionMode: 'review_required',
        targetEnvironment: 'staging',
      },
      createdBy: 'e2e-test',
    },
  });

  console.log('任务创建:', createResult.status === 200 ? '✅' : '❌');
  console.log('任务 ID:', createResult.data.taskId);

  // 验证任务状态
  const getResult = await bridgeRequest('get_task', {
    taskId: createResult.data.taskId,
  });

  console.log('任务查询:', getResult.status === 200 ? '✅' : '❌');
  console.log('任务状态:', getResult.data.task?.status);

  return {
    taskId: createResult.data.taskId,
    status: getResult.data.task?.status,
  };
}

async function testChecklistCase() {
  console.log('\n=== 案例 B: Checklist → 定时发布 ===');
  
  // 创建任务
  const createResult = await bridgeRequest('create_task', {
    task: {
      id: `task_e2e_checklist_${Date.now()}`,
      originalMessage: '做一份新加坡留学生第一次租房检查清单，分成看房前、看房时、签约前和入住后，安排十分钟后发布到 staging',
      parsedIntent: {
        contentType: 'checklist',
        executionMode: 'schedule_when_validated',
        targetEnvironment: 'staging',
        scheduledTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      },
      createdBy: 'e2e-test',
    },
  });

  console.log('任务创建:', createResult.status === 200 ? '✅' : '❌');
  console.log('任务 ID:', createResult.data.taskId);

  // 创建调度
  const scheduleResult = await bridgeRequest('create_schedule', {
    taskId: createResult.data.taskId,
    scheduledAtUtc: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    scheduledTimezone: 'Asia/Shanghai',
    publishKey: `checklist_e2e_${Date.now()}`,
  });

  console.log('调度创建:', scheduleResult.status === 200 ? '✅' : '❌');
  console.log('调度 ID:', scheduleResult.data.scheduleId);

  // 列出调度
  const listResult = await bridgeRequest('list_schedules');
  console.log('调度列表:', listResult.status === 200 ? '✅' : '❌');
  console.log('调度数量:', listResult.data.schedules?.length);

  return {
    taskId: createResult.data.taskId,
    scheduleId: scheduleResult.data.scheduleId,
  };
}

async function testTopicCase() {
  console.log('\n=== 案例 C: Topic → 直接发布 ===');
  
  // 创建任务
  const createResult = await bridgeRequest('create_task', {
    task: {
      id: `task_e2e_topic_${Date.now()}`,
      originalMessage: '做一个新加坡海外华人常用政府与生活服务专题，包含工具、指南、清单和官方资源，检查通过后直接发布到 staging',
      parsedIntent: {
        contentType: 'topic',
        executionMode: 'publish_when_validated',
        targetEnvironment: 'staging',
      },
      createdBy: 'e2e-test',
    },
  });

  console.log('任务创建:', createResult.status === 200 ? '✅' : '❌');
  console.log('任务 ID:', createResult.data.taskId);

  // 验证任务状态
  const getResult = await bridgeRequest('get_task', {
    taskId: createResult.data.taskId,
  });

  console.log('任务查询:', getResult.status === 200 ? '✅' : '❌');
  console.log('任务状态:', getResult.data.task?.status);

  return {
    taskId: createResult.data.taskId,
    status: getResult.data.task?.status,
  };
}

async function testProductionBlock() {
  console.log('\n=== 安全测试: Production 阻断 ===');
  
  const result = await bridgeRequest('create_task', {
    task: {
      id: `task_e2e_prod_${Date.now()}`,
      originalMessage: '发布到 production',
      parsedIntent: {
        contentType: 'guide',
        executionMode: 'publish_when_validated',
        targetEnvironment: 'production',
      },
      createdBy: 'e2e-test',
    },
  });

  // 应该被拒绝或标记为不允许
  const blocked = result.status !== 200 || result.data.error?.includes('production');
  console.log('Production 阻断:', blocked ? '✅' : '❌');

  return { blocked };
}

async function main() {
  console.log('ContentOps Autonomous Agent E2E 测试');
  console.log('=====================================\n');

  if (!BRIDGE_SECRET) {
    console.error('Error: CONTENTOPS_BRIDGE_SECRET not configured');
    process.exit(1);
  }

  const results = {
    guide: await testGuideCase(),
    checklist: await testChecklistCase(),
    topic: await testTopicCase(),
    productionBlock: await testProductionBlock(),
  };

  console.log('\n=====================================');
  console.log('测试完成');
  console.log('Guide 任务:', results.guide.taskId);
  console.log('Checklist 任务:', results.checklist.taskId);
  console.log('Topic 任务:', results.topic.taskId);
  console.log('Production 阻断:', results.productionBlock.blocked ? '✅' : '❌');
}

main().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
