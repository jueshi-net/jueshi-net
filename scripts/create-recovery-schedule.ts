import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  // Create recovery schedule
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'create_schedule',
      taskId: 'task_1784651981732_cmselg',
      contentId: 'cmrvejkqu0000id5pwr63pm9v',
      recoveryMode: 'manual_recovery_after_integrity_repair',
      scheduledAt: new Date().toISOString()
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
