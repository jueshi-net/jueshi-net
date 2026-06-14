#!/usr/bin/env node

/**
 * Deploy Metadata Generator
 * 
 * Generates .deploy-meta.json for tracking deployment provenance.
 * This is critical for rsync-based deployments where .git HEAD
 * in the production directory does not reflect the actual deployed version.
 * 
 * Usage:
 *   # Local development (uses git HEAD)
 *   node scripts/generate-deploy-meta.mjs
 * 
 *   # Production rsync deployment (pass source commit explicitly)
 *   DEPLOY_COMMIT=$(git rev-parse HEAD) DEPLOY_BRANCH=main DEPLOY_METHOD=rsync \
 *     node scripts/generate-deploy-meta.mjs
 * 
 * Environment Variables (priority over git HEAD):
 *   DEPLOY_COMMIT  - The actual commit being deployed (required for rsync)
 *   DEPLOY_BRANCH  - The branch being deployed (default: git branch)
 *   DEPLOY_TAG     - The tag being deployed (if any)
 *   DEPLOY_METHOD  - Deployment method (default: rsync)
 * 
 * Output: .deploy-meta.json in project root
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const exec = (cmd) => {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: projectRoot }).trim();
  } catch {
    return null;
  }
};

const getGitInfo = () => {
  // Priority: environment variables > git HEAD
  // For rsync deployments, production .git HEAD is stale and unreliable.
  // Always pass DEPLOY_COMMIT from the deployment source.
  const commit = process.env.DEPLOY_COMMIT || exec('git rev-parse HEAD');
  const branch = process.env.DEPLOY_BRANCH || exec('git rev-parse --abbrev-ref HEAD');
  const tag = process.env.DEPLOY_TAG || exec('git describe --tags --exact-match 2>/dev/null');
  
  return { commit, branch, tag };
};

const getBuildInfo = () => {
  const buildIdPath = join(projectRoot, '.next', 'BUILD_ID');
  try {
    return readFileSync(buildIdPath, 'utf-8').trim();
  } catch {
    return null;
  }
};

const getNodeInfo = () => {
  const nodeVersion = exec('node -v');
  const npmVersion = exec('npm -v');
  return { nodeVersion, npmVersion };
};

const generateMeta = () => {
  const gitInfo = getGitInfo();
  const buildId = getBuildInfo();
  const nodeInfo = getNodeInfo();
  
  const meta = {
    commit: gitInfo.commit,
    branch: gitInfo.branch,
    tag: gitInfo.tag,
    buildId: buildId,
    deployedAt: new Date().toISOString(),
    deployMethod: process.env.DEPLOY_METHOD || 'rsync',
    nodeVersion: nodeInfo.nodeVersion,
    npmVersion: nodeInfo.npmVersion,
    // Explicitly exclude secrets, DATABASE_URL, tokens
    _security: 'This file must NOT contain secrets, DATABASE_URL, or tokens'
  };
  
  const outputPath = join(projectRoot, '.deploy-meta.json');
  writeFileSync(outputPath, JSON.stringify(meta, null, 2));
  
  console.log('✓ Generated .deploy-meta.json');
  console.log(`  Commit: ${meta.commit?.substring(0, 7) || 'unknown'}`);
  console.log(`  Branch: ${meta.branch || 'unknown'}`);
  console.log(`  Build ID: ${meta.buildId || 'unknown'}`);
  console.log(`  Deployed At: ${meta.deployedAt}`);
  
  return meta;
};

try {
  generateMeta();
} catch (err) {
  console.error('Failed to generate deploy metadata:', err);
  process.exit(1);
}
