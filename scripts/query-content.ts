import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  // Query Content table directly via Bridge API
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'query_content',
      contentId: 'cmrvejkqu0000id5pwr63pm9v'
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
