import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  // Query updated Checklist status
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'audit_contentops_task',
      taskId: 'task_1784651981732_cmselg',
      contentId: 'cmrvejkqu0000id5pwr63pm9v'
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
