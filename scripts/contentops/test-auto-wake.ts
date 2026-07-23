import { CanonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testAutoWake() {
  const service = new CanonicalTaskService();
  
  const result = await service.createAndEnqueueContentOpsTask({
    chatId: 8602323654,
    messageId: Date.now(),
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    rawInput: '测试自动唤醒：国际集运新手指南',
    topic: '国际集运',
    targetAudience: '第一次使用国际集运的海外华人用户',
  });
  
  console.log('Task created:', JSON.stringify(result, null, 2));
}

testAutoWake().catch(console.error);
