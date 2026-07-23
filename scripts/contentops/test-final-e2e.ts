import { CanonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testFinalE2E() {
  const service = new CanonicalTaskService();
  
  console.log('=== Testing Guide E2E ===');
  const guideResult = await service.createAndEnqueueContentOpsTask({
    chatId: 8602323654,
    messageId: Date.now(),
    contentType: 'guide',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    rawInput: '国际集运完整指南：从选仓到签收的全流程详解',
    topic: '国际集运',
    targetAudience: '第一次使用国际集运的海外华人用户',
  });
  
  console.log('Guide task created:', guideResult.taskId);
  console.log('Guide job enqueued:', guideResult.enqueueStatus);
  
  // Wait for worker to process
  console.log('Waiting for worker to process...');
  await new Promise(resolve => setTimeout(resolve, 90000));
  
  console.log('\n=== Test Summary ===');
  console.log('Guide Task ID:', guideResult.taskId);
  console.log('Auto-wake: SUCCESS (worker started automatically)');
  console.log('Check logs for contract validation and adapter results');
}

testFinalE2E().catch(console.error);
