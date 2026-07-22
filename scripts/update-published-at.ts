import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  // Update publishedAt
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'update_content_metadata',
      contentId: 'cmrvejkqu0000id5pwr63pm9v',
      contentType: 'checklist',
      publishedAt: new Date().toISOString()
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
