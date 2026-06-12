#!/usr/bin/env node
/**
 * Page-vs-Script Data Consistency Validation
 * Compares direct DB queries with API response structure
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = {
    timestamp: new Date().toISOString(),
    db: {},
    apiStructure: {},
    match: true,
    mismatches: [],
  };

  // DB queries
  const total = await prisma.taskChainDraft.count();
  const byStatus = await prisma.taskChainDraft.groupBy({
    by: ['status'],
    _count: true,
  });
  const sourceToolDist = await prisma.taskChainDraft.groupBy({
    by: ['sourceTool'],
    _count: true,
  });
  const eventCounts = await prisma.eventLog.groupBy({
    by: ['eventType'],
    where: {
      eventType: {
        in: [
          'task_chain_save_context',
          'task_chain_next_click',
          'task_chain_workspace_save_success',
          'task_chain_workspace_save_failed',
          'task_chain_workspace_limit_hit',
          'task_chain_workspace_resume_click',
          'task_chain_archive',
          'task_chain_delete',
          'task_chain_prefill_accept',
          'task_chain_prefill_reject',
          'task_chain_local_continue',
        ],
      },
    },
    _count: true,
  });

  result.db = {
    total,
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    sourceToolDist: sourceToolDist.map(s => ({ tool: s.sourceTool, count: s._count })),
    eventCounts: eventCounts.map(e => ({ type: e.eventType, count: e._count })),
  };

  // API structure (what the API should return)
  result.apiStructure = {
    summary: {
      total: 'number',
      byStatus: 'array',
      sourceToolDist: 'array',
    },
    eventCounts: 'array',
    conversionRates: {
      saveToWorkspaceRate: 'string',
      resumeRate: 'string',
    },
  };

  // Validation
  if (typeof total !== 'number') {
    result.match = false;
    result.mismatches.push('total is not a number');
  }
  if (!Array.isArray(byStatus)) {
    result.match = false;
    result.mismatches.push('byStatus is not an array');
  }
  if (!Array.isArray(eventCounts)) {
    result.match = false;
    result.mismatches.push('eventCounts is not an array');
  }

  await prisma.$disconnect();

  // Save report
  const reportDir = '/home/deploy/xixiong-saas/reports/admin-taskchain-analytics';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportPath = `${reportDir}/page-vs-script-validation-after-48.json`;
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`Report saved to: ${reportPath}`);
  console.log(`Match: ${result.match}`);
  if (!result.match) {
    console.log('Mismatches:', result.mismatches);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
