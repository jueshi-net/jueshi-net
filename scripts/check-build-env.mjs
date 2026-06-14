#!/usr/bin/env node

/**
 * Build Environment Guardrail
 * 
 * Prevents accidental production builds with NODE_ENV=development
 * which causes React hooks initialization errors during static generation.
 * 
 * Issue: When NODE_ENV=development, Next.js attempts to statically prerender
 * "use client" pages but React hooks (useState, useEffect) fail to initialize,
 * resulting in "Cannot read properties of null (reading 'useState')" errors.
 * 
 * Solution: Fail fast with a clear error message before the build starts.
 */

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv === 'development') {
  console.error('');
  console.error('╔════════════════════════════════════════════════════════════════╗');
  console.error('║  BUILD ENVIRONMENT ERROR                                     ║');
  console.error('╠════════════════════════════════════════════════════════════════╣');
  console.error('║  NODE_ENV=development is invalid for production build.       ║');
  console.error('║                                                              ║');
  console.error('║  This causes React hooks initialization failures during      ║');
  console.error('║  static page generation (useState null errors).              ║');
  console.error('║                                                              ║');
  console.error('║  SOLUTION:                                                   ║');
  console.error('║  1. Unset NODE_ENV:                                          ║');
  console.error('║     unset NODE_ENV                                           ║');
  console.error('║                                                              ║');
  console.error('║  2. Or use a clean shell without NODE_ENV:                   ║');
  console.error('║     env -i PATH=$PATH HOME=$HOME npm run build               ║');
  console.error('║                                                              ║');
  console.error('║  3. Or explicitly set to production (not recommended         ║');
  console.error('║     for local development):                                  ║');
  console.error('║     NODE_ENV=production npm run build                        ║');
  console.error('╚════════════════════════════════════════════════════════════════╝');
  console.error('');
  process.exit(1);
}

// If NODE_ENV is not set or is 'production', allow the build to proceed
if (!nodeEnv) {
  console.log('✓ NODE_ENV is unset (Next.js will set it automatically)');
} else if (nodeEnv === 'production') {
  console.log('✓ NODE_ENV=production (valid for build)');
} else {
  console.log(`✓ NODE_ENV=${nodeEnv} (proceeding with build)`);
}

process.exit(0);
