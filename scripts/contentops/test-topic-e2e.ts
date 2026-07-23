import { canonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testTopicE2E() {
  console.log('[Topic E2E] Creating Topic task...');
  
  const startTime = Date.now();
  const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
    contentType: 'topic',
    rawInput: '创建一个关于国际集运的完整主题页面，包含工具、指南、清单和官方资源',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    targetAudience: '首次使用国际集运的海外华人用户',
  });
  
  console.log('[Topic E2E] Task creation result:', result.ok ? 'SUCCESS' : 'FAILED');
  
  if (result.ok) {
    console.log('[Topic E2E] Task ID:', result.taskId);
    console.log('[Topic E2E] Enqueue status:', result.enqueueStatus);
    console.log('[Topic E2E] Waiting 120 seconds for Worker to process...');
    await new Promise(resolve => setTimeout(resolve, 120000));
    
    const duration = (Date.now() - startTime) / 1000;
    console.log('[Topic E2E] Duration:', duration, 'seconds');
    
    // Check outbox
    const { execSync } = await import('child_process');
    const outboxFile = `/Users/chq/.jueshi-contentops/jobs/outbox/${result.taskId}.json`;
    try {
      const outboxContent = execSync(`cat ${outboxFile} 2>/dev/null`, { encoding: 'utf-8' });
      const outbox = JSON.parse(outboxContent);
      console.log('[Topic E2E] Outbox success:', outbox.success);
      console.log('[Topic E2E] Draft ID:', outbox.draftId);
      console.log('[Topic E2E] Contract validation:', outbox.contractValidationPassed);
    } catch (e) {
      console.log('[Topic E2E] Outbox file not found');
    }
    
    // Check failed
    const failedFile = `/Users/chq/.jueshi-contentops/jobs/failed/${result.taskId}.json`;
    try {
      const failedContent = execSync(`cat ${failedFile} 2>/dev/null`, { encoding: 'utf-8' });
      const failed = JSON.parse(failedContent);
      console.log('[Topic E2E] Failed error:', failed.error || 'Unknown');
    } catch (e) {
      // Not in failed directory
    }
  }
}

testTopicE2E().catch(console.error);
