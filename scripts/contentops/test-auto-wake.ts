import { canonicalTaskService } from '../../src/lib/contentops/canonical-task-service';

async function testAutoWake() {
  console.log('[Test] Creating test task...');
  
  const result = await canonicalTaskService.createAndEnqueueContentOpsTask({
    contentType: 'guide',
    rawInput: '测试自动唤醒：写一篇关于国际集运的简短指南',
    executionMode: 'draft_only',
    targetEnvironment: 'staging',
    targetAudience: '首次使用国际集运的海外华人用户',
  });
  
  console.log('[Test] Task creation result:', JSON.stringify(result, null, 2));
  
  if (result.ok) {
    console.log('[Test] Task ID:', result.taskId);
    console.log('[Test] Enqueue status:', result.enqueueStatus);
    console.log('[Test] Waiting 10 seconds for Worker to process...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check if Worker started
    const { execSync } = await import('child_process');
    try {
      const workerProcesses = execSync('ps aux | grep hermes-contentops-worker | grep -v grep', { encoding: 'utf-8' });
      console.log('[Test] Worker processes:', workerProcesses || 'None');
    } catch (e) {
      console.log('[Test] Worker processes: None');
    }
    
    // Check inbox
    const inboxFiles = execSync('ls /Users/chq/.jueshi-contentops/jobs/inbox/ 2>/dev/null || echo "empty"', { encoding: 'utf-8' });
    console.log('[Test] Inbox files:', inboxFiles);
    
    // Check processing
    const processingFiles = execSync('ls /Users/chq/.jueshi-contentops/jobs/processing/ 2>/dev/null || echo "empty"', { encoding: 'utf-8' });
    console.log('[Test] Processing files:', processingFiles);
    
    // Check completed
    const completedFiles = execSync('ls /Users/chq/.jueshi-contentops/jobs/completed/ 2>/dev/null || echo "empty"', { encoding: 'utf-8' });
    console.log('[Test] Completed files:', completedFiles);
  }
}

testAutoWake().catch(console.error);
