#!/usr/bin/env node
/**
 * S0 Final Automated Verification - Password Fixer
 */
import fs from 'fs';

const filePath = 'scripts/s0-final-automated-verification.mjs';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the PASSWORD line
content = content.replace(
  /const PASSWORD=.*?\n.*?console\.error.*?\n.*?process\.exit.*?\n\}/s,
  `const PASSWORD=*** {
  console.error('ERROR: E2E_PASSWORD environment variable not set');
  process.exit(1);
}`
);

fs.writeFileSync(filePath, content);
console.log('✅ Fixed PASSWORD line');
