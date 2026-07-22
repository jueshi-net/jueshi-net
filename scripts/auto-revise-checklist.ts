import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'auto_revise_checklist',
      contentId: 'cmrvejkqu0000id5pwr63pm9v'
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
