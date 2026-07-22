import { stagingHelperClient } from '../src/lib/contentops/staging-helper-client';

async function main() {
  // Publish Checklist
  const response = await stagingHelperClient.request({
    method: 'POST',
    pathname: '/api/internal/contentops/drafts',
    body: {
      action: 'update_content_status',
      contentId: 'cmrvejkqu0000id5pwr63pm9v',
      newStatus: 'published',
      auditEvent: {
        event: 'PUBLISHED_AFTER_INTEGRITY_REPAIR',
        reason: 'quality_gate_passed_after_auto_revision',
        performedBy: 'contentops-autonomous-agent'
      }
    }
  });
  
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
