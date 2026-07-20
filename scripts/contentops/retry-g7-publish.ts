#!/usr/bin/env tsx
/**
 * Retry G7 publish after soft 404 fix
 * This script directly calls Draft Manager to retry publishing
 */

import { publishDraft } from '../../src/lib/contentops/draft-manager';

async function main() {
  console.log('=== G7 Publish Retry ===');
  
  const draftId = 'draft_1784518499762_yycfq';
  const approvedVersion = 2;
  
  console.log(`Draft ID: ${draftId}`);
  console.log(`Approved Version: v${approvedVersion}`);
  console.log('');
  
  try {
    const result = await publishDraft(draftId, {
      expectedVersion: approvedVersion,
      publishedBy: 'contentops-bot-retry',
      publishSource: 'telegram',
    });
    
    if (result.success) {
      console.log('✅ Publish successful!');
      console.log('');
      console.log('Publish Record:');
      console.log(JSON.stringify(result.publishRecord, null, 2));
      console.log('');
      console.log(`Guide ID: ${result.publishRecord?.contentId}`);
      console.log(`Published URL: ${result.publishRecord?.publishedUrl}`);
      console.log(`Publish Key: ${result.publishRecord?.publishKey}`);
    } else {
      console.log('❌ Publish failed!');
      console.log(`Error: ${result.error}`);
      console.log(`Error Code: ${result.errorCode}`);
    }
  } catch (error: any) {
    console.error('❌ Exception:', error.message);
    console.error(error.stack);
  }
}

main();
