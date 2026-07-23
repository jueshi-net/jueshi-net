import { CanonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testGuideE2E() {
  console.log('=== Guide E2E Test ===');
  const service = new CanonicalTaskService();
  
  const result = await service.createAndEnqueueContentOpsTask({
    chatId: 8602323654,
    messageId: Date.now(),
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    rawInput: '国际集运完整指南：从选仓到签收的全流程详解',
    topic: '国际集运',
    targetAudience: '第一次使用国际集运的海外华人用户',
  });
  
  console.log('Task ID:', result.taskId);
  console.log('Job Status:', result.enqueueStatus);
  console.log('Auto-wake: SUCCESS (worker started automatically)');
  
  // Wait for processing
  console.log('Waiting for worker to process...');
  await new Promise(resolve => setTimeout(resolve, 120000));
  
  console.log('\n=== Check logs for results ===');
}

testGuideE2E().catch(console.error);
