import { CanonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testDraftMode() {
  const service = new CanonicalTaskService();
  
  const result = await service.createAndEnqueueContentOpsTask({
    chatId: 8602323654,
    messageId: Date.now(),
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    rawInput: '测试草稿模式：国际集运完整指南，需要详细步骤',
    topic: '国际集运完整指南',
    targetAudience: '第一次使用国际集运的海外华人用户',
  });
  
  console.log('Task created:', JSON.stringify(result, null, 2));
}

testDraftMode().catch(console.error);
