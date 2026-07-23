#!/usr/bin/env tsx
/**
 * Internal Test Transport for ContentOps Smoke Tests
 * 
 * This transport:
 * - Is consumed by the running Notification Dispatcher
 * - Executes schema, idempotency, and registry logic
 * - Does NOT call user's Telegram chat
 * - Writes send results to independent test-sink audit
 * 
 * Usage: Set notification chatId to "internal-test-sink"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOME_DIR = os.homedir();
const TEST_SINK_DIR = path.join(HOME_DIR, '.jueshi-contentops/test-sink');
const TEST_AUDIT_LOG = path.join(TEST_SINK_DIR, 'audit.log');

// Ensure test sink directory exists
if (!fs.existsSync(TEST_SINK_DIR)) {
  fs.mkdirSync(TEST_SINK_DIR, { recursive: true });
}

export interface TestTransportResult {
  success: boolean;
  messageId?: number;
  error?: string;
  sinkRecord: {
    timestamp: string;
    notificationId: string;
    chatId: string;
    terminalStatus: string;
    backendContentId?: string;
    contentType: string;
    title?: string;
  };
}

/**
 * Internal Test Transport
 * Simulates Telegram send but writes to test sink instead
 */
export async function sendToTestSink(
  notification: any
): Promise<TestTransportResult> {
  const timestamp = new Date().toISOString();
  
  const sinkRecord = {
    timestamp,
    notificationId: notification.notificationId,
    chatId: notification.chatId,
    terminalStatus: notification.terminalStatus,
    backendContentId: notification.backendContentId,
    contentType: notification.contentType,
    title: notification.title,
  };

  // Write to audit log
  const auditEntry = JSON.stringify(sinkRecord) + '\n';
  fs.appendFileSync(TEST_AUDIT_LOG, auditEntry);

  // Simulate successful send
  return {
    success: true,
    messageId: Math.floor(Math.random() * 10000), // Simulated message ID
    sinkRecord,
  };
}

/**
 * Check if chatId is internal test sink
 */
export function isInternalTestSink(chatId: string | number): boolean {
  return chatId === 'internal-test-sink' || chatId === 'INTERNAL_TEST_SINK';
}

/**
 * Get test sink audit records
 */
export function getTestSinkRecords(): any[] {
  if (!fs.existsSync(TEST_AUDIT_LOG)) {
    return [];
  }
  
  const content = fs.readFileSync(TEST_AUDIT_LOG, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

/**
 * Check if notification was sent to test sink
 */
export function wasSentToTestSink(notificationId: string): boolean {
  const records = getTestSinkRecords();
  return records.some(r => r.notificationId === notificationId);
}

// CLI mode: send a notification to test sink
if (require.main === module) {
  const notificationFile = process.argv[2];
  
  if (!notificationFile) {
    console.error('Usage: internal-test-transport.ts <notification-file>');
    process.exit(1);
  }

  const notification = JSON.parse(fs.readFileSync(notificationFile, 'utf-8'));
  
  sendToTestSink(notification).then(result => {
    console.log(JSON.stringify(result, null, 2));
  }).catch(err => {
    console.error('Test transport failed:', err);
    process.exit(1);
  });
}
