import { CanonicalTaskService } from '../../src/lib/contentops/canonical-task-service';
const service = new CanonicalTaskService();
service.createAndEnqueueContentOpsTask({
  chatId: 8602323654,
  messageId: Date.now(),
  contentType: 'guide',
  executionMode: 'draft_only',
  targetEnvironment: 'staging',
  rawInput: '快速测试：国际集运指南',
  topic: '国际集运',
  targetAudience: '海外华人',
}).then(r => console.log('Task:', r.taskId)).catch(console.error);
