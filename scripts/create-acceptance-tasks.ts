import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import { CanonicalTaskService } from '../src/lib/contentops/canonical-task-service';

const ACCEPTANCE_RUN_ID = `acceptance_${Date.now()}`;

async function createAcceptanceTasks() {
  const service = new CanonicalTaskService();
  
  // 1. Guide success task
  const guideTask = await service.createAndEnqueueContentOpsTask({
    chatId: 0,
    messageId: Date.now(),
    rawInput: 'Acceptance test: International shipping guide',
    contentType: 'guide',
    executionMode: 'review_required',
    targetEnvironment: 'staging',
    source: 'internal_runtime_acceptance',
    provider: 'deterministic_fixture',
    internalAuthorized: true,
  });
  console.log('Guide task:', guideTask.taskId);

  // 2. Checklist success task
  const checklistTask = await service.createAndEnqueueContentOpsTask({
    chatId: 0,
    messageId: Date.now() + 1,
    rawInput: 'Acceptance test: Canada immigration checklist',
    contentType: 'checklist',
    executionMode: 'review_required',
    targetEnvironment: 'staging',
    source: 'internal_runtime_acceptance',
    provider: 'deterministic_fixture',
    internalAuthorized: true,
  });
  console.log('Checklist task:', checklistTask.taskId);

  // 3. Topic success task
  const topicTask = await service.createAndEnqueueContentOpsTask({
    chatId: 0,
    messageId: Date.now() + 2,
    rawInput: 'Acceptance test: Essential apps for overseas Chinese',
    contentType: 'topic',
    executionMode: 'review_required',
    targetEnvironment: 'staging',
    source: 'internal_runtime_acceptance',
    provider: 'deterministic_fixture',
    internalAuthorized: true,
  });
  console.log('Topic task:', topicTask.taskId);

  // 4. Forced failure task
  const failureTask = await service.createAndEnqueueContentOpsTask({
    chatId: 0,
    messageId: Date.now() + 3,
    rawInput: 'FORCED_FAILURE: This task should fail',
    contentType: 'guide',
    executionMode: 'review_required',
    targetEnvironment: 'staging',
    source: 'internal_runtime_acceptance',
    provider: 'deterministic_fixture',
    internalAuthorized: true,
  });
  console.log('Failure task:', failureTask.taskId);

  console.log('\nACCEPTANCE_RUN_ID:', ACCEPTANCE_RUN_ID);
}

createAcceptanceTasks().catch(console.error);
