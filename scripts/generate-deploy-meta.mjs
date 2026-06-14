#!/usr/bin/env node

/**
 * Deploy Metadata Generator
 * 
 * Generates .deploy-meta.json for tracking deployment provenance.
 * This is critical for rsync-based deployments where .git HEAD
 * in the production directory does not reflect the actual deployed version.
 * 
 * Usage: node scripts/generate-deploy-meta.mjs
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
  const commit = exec('git rev-parse HEAD');
  const branch = exec('git rev-parse --abbrev-ref HEAD');
  const tag = exec('git describe --tags --exact-match 2>/dev/null');
  
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
    deployMethod: 'rsync',
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
