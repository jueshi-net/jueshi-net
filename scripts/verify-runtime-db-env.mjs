#!/usr/bin/env node
/**
 * Runtime DB Environment Guard Script
 * 
 * Verifies that DATABASE_URL is correctly configured and Prisma can connect.
 * Used after deployment to prevent P1000/28P01 regressions.
 * 
 * Usage: node scripts/verify-runtime-db-env.mjs
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - One or more checks failed
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const result = {
  timestamp: new Date().toISOString(),
  checks: {},
  passed: true,
  errors: [],
};

function maskPassword(url) {
  try {
    const match = url.match(/:\/\/([^:]+):([^@]+)@/);
    if (!match) return { masked: 'N/A', length: 0 };
    const user = match[1];
    const pwd = match[2];
    const first = pwd[0] || '';
    const last = pwd[pwd.length - 1] || '';
    const masked = pwd.length > 2 ? `${first}${'*'.repeat(Math.min(pwd.length - 2, 6))}${last}` : '**';
    return {
      user,
      masked,
      length: pwd.length,
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      hasUnencodedAt: pwd.includes('@'),
    };
  } catch {
    return { masked: 'PARSE_ERROR', length: 0 };
  }
}

function parseUrl(url) {
  try {
    // Remove query string for URL parsing (may contain unencoded chars)
    const cleanUrl = url.split('?')[0];
    const match = cleanUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) return null;
    return {
      user: match[1],
      host: match[3],
      port: parseInt(match[4], 10),
      db: match[5],
      hasQueryString: url.includes('?'),
      queryString: url.includes('?') ? url.split('?')[1] : null,
    };
  } catch {
    return null;
  }
}

// Check 1: DATABASE_URL exists
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  result.checks.envExists = { passed: false, error: 'DATABASE_URL is not set' };
  result.passed = false;
  result.errors.push('DATABASE_URL is not set');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
result.checks.envExists = { passed: true };

// Check 2: Parse DATABASE_URL
const parsed = parseUrl(dbUrl);
if (!parsed) {
  result.checks.urlParse = { passed: false, error: 'DATABASE_URL format invalid' };
  result.passed = false;
  result.errors.push('DATABASE_URL format invalid');
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}
result.checks.urlParse = { passed: true };

// Check 3: URL summary
const pwdInfo = maskPassword(dbUrl);
result.checks.urlSummary = {
  passed: true,
  summary: {
    user: parsed.user,
    host: parsed.host,
    port: parsed.port,
    db: parsed.db,
    passwordLength: pwdInfo.length,
    passwordMasked: pwdInfo.masked,
    hasQueryString: parsed.hasQueryString,
    queryString: parsed.queryString,
    hasSpecialChars: pwdInfo.hasSpecialChars,
    hasUnencodedAt: pwdInfo.hasUnencodedAt,
  },
};

// Check 4: No ?schema=public
if (parsed.hasQueryString && parsed.queryString && parsed.queryString.includes('schema=public')) {
  result.checks.noSchemaPublic = { passed: false, error: 'DATABASE_URL contains ?schema=public (incompatible with adapter-pg)' };
  result.passed = false;
  result.errors.push('DATABASE_URL contains ?schema=public');
} else {
  result.checks.noSchemaPublic = { passed: true };
}

// Check 5: No unencoded @ in password
if (pwdInfo.hasUnencodedAt) {
  result.checks.noUnencodedAt = { passed: false, error: 'Password contains unencoded @' };
  result.passed = false;
  result.errors.push('Password contains unencoded @');
} else {
  result.checks.noUnencodedAt = { passed: true };
}

// Check 6: No old password fragments
const oldFragments = ['@Secure', 'oldpass', 'bxb_prod@'];
const hasOldFragment = oldFragments.some(f => dbUrl.includes(f) && !dbUrl.startsWith('postgresql://'));
if (hasOldFragment) {
  result.checks.noOldFragments = { passed: false, error: 'DATABASE_URL contains old password fragment' };
  result.passed = false;
  result.errors.push('DATABASE_URL contains old password fragment');
} else {
  result.checks.noOldFragments = { passed: true };
}

// Check 7: Host/port/db correctness
if (parsed.host !== '127.0.0.1') {
  result.checks.hostCorrect = { passed: false, error: `Host is ${parsed.host}, expected 127.0.0.1` };
  result.passed = false;
  result.errors.push(`Host is ${parsed.host}, expected 127.0.0.1`);
} else {
  result.checks.hostCorrect = { passed: true };
}

if (parsed.port !== 5432) {
  result.checks.portCorrect = { passed: false, error: `Port is ${parsed.port}, expected 5432` };
  result.passed = false;
  result.errors.push(`Port is ${parsed.port}, expected 5432`);
} else {
  result.checks.portCorrect = { passed: true };
}

if (parsed.db !== 'bxb_prod') {
  result.checks.dbCorrect = { passed: false, error: `DB is ${parsed.db}, expected bxb_prod` };
  result.passed = false;
  result.errors.push(`DB is ${parsed.db}, expected bxb_prod`);
} else {
  result.checks.dbCorrect = { passed: true };
}

// Check 8: Prisma connection
if (result.passed) {
  try {
    const adapter = new PrismaPg({ connectionString: dbUrl });
    const prisma = new PrismaClient({ adapter });
    
    // SELECT 1
    const selectResult = await prisma.$queryRaw`SELECT 1 as test`;
    result.checks.prismaSelect1 = { passed: true, result: selectResult };
    
    // TaskChainDraft count
    const taskChainCount = await prisma.taskChainDraft.count();
    result.checks.taskChainDraftCount = { passed: true, count: taskChainCount };
    
    // EventLog count
    const eventLogCount = await prisma.eventLog.count();
    result.checks.eventLogCount = { passed: true, count: eventLogCount };
    
    // DocumentHistory count
    const docHistoryCount = await prisma.documentHistory.count();
    result.checks.documentHistoryCount = { passed: true, count: docHistoryCount };
    
    await prisma.$disconnect();
  } catch (err) {
    result.checks.prismaConnection = { passed: false, error: err.message, code: err.code };
    result.passed = false;
    result.errors.push(`Prisma connection failed: ${err.code || err.message}`);
  }
}

// Output
console.log(JSON.stringify(result, null, 2));
process.exit(result.passed ? 0 : 1);
