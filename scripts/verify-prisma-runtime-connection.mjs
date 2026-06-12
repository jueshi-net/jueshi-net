#!/usr/bin/env node
/**
 * Prisma Runtime Connection Verification Script
 * 
 * This script verifies that Prisma can connect to the database
 * using the same initialization method as the Next.js runtime.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

console.log('=== Prisma Runtime Connection Verification ===\n');

// Check environment variables
console.log('1. Environment Variables Check:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (match) {
    const [, user, pass, host, port, db] = match;
    console.log(`   Username: ${user}`);
    console.log(`   Password length: ${pass.length}`);
    console.log(`   Password prefix: ${pass.substring(0, 3)}***`);
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Database: ${db}`);
  }
}
console.log('');

// Initialize Prisma with adapter
console.log('2. Prisma Client Initialization:');
try {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('   ERROR: DATABASE_URL is not set');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });

  console.log('   ✓ PrismaClient initialized successfully');
  console.log('');

  // Test connection
  console.log('3. Connection Test:');
  await prisma.$connect();
  console.log('   ✓ Connected to database');
  console.log('');

  // Test queries
  console.log('4. Query Tests:');
  
  // SELECT 1
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log(`   ✓ SELECT 1: ${JSON.stringify(result)}`);
  
  // TaskChainDraft count
  const taskChainCount = await prisma.taskChainDraft.count();
  console.log(`   ✓ TaskChainDraft count: ${taskChainCount}`);
  
  // EventLog count
  const eventLogCount = await prisma.eventLog.count();
  console.log(`   ✓ EventLog count: ${eventLogCount}`);
  
  // DocumentHistory count
  const documentHistoryCount = await prisma.documentHistory.count();
  console.log(`   ✓ DocumentHistory count: ${documentHistoryCount}`);
  
  console.log('');
  console.log('=== All Tests Passed ===');
  
  await prisma.$disconnect();
  process.exit(0);
} catch (error) {
  console.error('   ✗ Error:', error.message);
  console.error('');
  console.error('Error details:');
  console.error(error);
  process.exit(1);
}
