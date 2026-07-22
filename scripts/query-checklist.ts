import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  const response = await stagingHelperClient.request({
    method: 'GET',
    pathname: '/api/internal/contentops/drafts?action=audit_contentops_task&taskId=task_1784651981732_cmselg',
    body: {}
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
