#!/usr/bin/env node
/**
 * Address Parser Test Script
 * Tests 6 address samples: US, Canada, UK, Australia, New Zealand, China
 * 
 * Usage: node scripts/test-address-parser.mjs
 * Exit 0 = all pass, Exit 1 = any fail
 */

// Inline the parser logic (since we can't import TS directly without build)
// We'll use a simplified approach: import the compiled version or use tsx

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// We need to compile the TS file first, or use tsx
// Let's use tsx to run a small inline test
const testCode = `
import { parseAddress } from '${projectRoot}/src/lib/address-parser.ts';

interface TestCase {
  name: string;
  input: string;
  assertions: {
    field: string;
    check: (value: string) => boolean;
    description: string;
  }[];
}

const samples: TestCase[] = [
  {
    name: 'United States',
    input: \`John Smith
+1 650-555-0198
1600 Amphitheatre Parkway
Mountain View, CA 94043
United States\`,
    assertions: [
      { field: 'recipient', check: v => v === 'John Smith', description: 'recipient = John Smith' },
      { field: 'phone', check: v => v.includes('+1'), description: 'phone contains +1' },
      { field: 'country', check: v => v === 'United States', description: 'country = United States' },
      { field: 'province', check: v => v === 'CA', description: 'state = CA' },
      { field: 'city', check: v => v === 'Mountain View', description: 'city = Mountain View' },
      { field: 'postalCode', check: v => v === '94043', description: 'postalCode = 94043' },
    ],
  },
  {
    name: 'Canada',
    input: \`Emily Chen
+1 416-555-0134
290 Bremner Blvd
Toronto, ON M5H 2N2
Canada\`,
    assertions: [
      { field: 'country', check: v => v === 'Canada', description: 'country = Canada' },
      { field: 'province', check: v => v === 'ON', description: 'province = ON' },
      { field: 'city', check: v => v === 'Toronto', description: 'city = Toronto' },
      { field: 'postalCode', check: v => v === 'M5H 2N2', description: 'postalCode = M5H 2N2' },
    ],
  },
  {
    name: 'United Kingdom',
    input: \`Alex Brown
+44 20 5555 0199
10 Downing Street
London SW1A 1AA
United Kingdom\`,
    assertions: [
      { field: 'country', check: v => v === 'United Kingdom', description: 'country = United Kingdom' },
      { field: 'city', check: v => v === 'London', description: 'city = London' },
      { field: 'postalCode', check: v => v === 'SW1A 1AA', description: 'postalCode = SW1A 1AA' },
    ],
  },
  {
    name: 'Australia',
    input: \`Olivia White
+61 2 5550 1234
200 George Street
Sydney NSW 2000
Australia\`,
    assertions: [
      { field: 'country', check: v => v === 'Australia', description: 'country = Australia' },
      { field: 'province', check: v => v === 'NSW', description: 'state = NSW' },
      { field: 'city', check: v => v === 'Sydney', description: 'city = Sydney' },
      { field: 'postalCode', check: v => v === '2000', description: 'postalCode = 2000' },
    ],
  },
  {
    name: 'New Zealand',
    input: \`Liam Wilson
+64 9 555 0123
100 Queen Street
Auckland 1010
New Zealand\`,
    assertions: [
      { field: 'country', check: v => v === 'New Zealand', description: 'country = New Zealand' },
      { field: 'city', check: v => v === 'Auckland', description: 'city = Auckland' },
      { field: 'postalCode', check: v => v === '1010', description: 'postalCode = 1010' },
    ],
  },
  {
    name: 'China',
    input: \`张三
+86 138 0013 8000
中国 广东省 深圳市
南山区 科技园 科技南十二路 2 号
518000\`,
    assertions: [
      { field: 'recipient', check: v => v === '张三', description: 'recipient = 张三' },
      { field: 'phone', check: v => v.includes('+86'), description: 'phone contains +86' },
      { field: 'country', check: v => v === '中国', description: 'country = 中国' },
      { field: 'province', check: v => v.includes('广东'), description: 'province contains 广东' },
      { field: 'city', check: v => v.includes('深圳'), description: 'city contains 深圳' },
      { field: 'postalCode', check: v => v === '518000', description: 'postalCode = 518000' },
      { field: 'addressLine1', check: v => v.includes('南山区') || v.includes('科技南十二路'), description: 'addressLine1 contains 南山区 or 科技南十二路' },
    ],
  },
];

let totalPass = 0;
let totalFail = 0;
const failures: string[] = [];

for (const sample of samples) {
  console.log(\`\\n=== \${sample.name} ===\`);
  const result = parseAddress(sample.input);
  
  console.log(\`  recipient:    "\${result.recipient}"\`);
  console.log(\`  phone:        "\${result.phone}"\`);
  console.log(\`  country:      "\${result.country}"\`);
  console.log(\`  province:     "\${result.province}"\`);
  console.log(\`  city:         "\${result.city}"\`);
  console.log(\`  addressLine1: "\${result.addressLine1}"\`);
  console.log(\`  addressLine2: "\${result.addressLine2}"\`);
  console.log(\`  postalCode:   "\${result.postalCode}"\`);
  console.log(\`  confidence:   \${result.confidence}\`);
  console.log(\`  warnings:     \${JSON.stringify(result.warnings)}\`);
  
  let samplePass = 0;
  let sampleFail = 0;
  
  for (const assertion of sample.assertions) {
    const value = (result as any)[assertion.field] || '';
    const passed = assertion.check(value);
    if (passed) {
      samplePass++;
      totalPass++;
      console.log(\`  ✅ \${assertion.description}\`);
    } else {
      sampleFail++;
      totalFail++;
      const msg = \`[\${sample.name}] FAIL: \${assertion.description} (got "\${value}")\`;
      failures.push(msg);
      console.log(\`  ❌ \${msg}\`);
    }
  }
  
  console.log(\`  → \${samplePass}/\${samplePass + sampleFail} passed\`);
}

console.log(\`\\n${'='.repeat(60)}\`);
console.log(\`TOTAL: \${totalPass} passed, \${totalFail} failed\`);

if (failures.length > 0) {
  console.log(\`\\nFailures:\`);
  for (const f of failures) {
    console.log(\`  - \${f}\`);
  }
  process.exit(1);
} else {
  console.log(\`\\n✅ All tests passed!\`);
  process.exit(0);
}
`;

// Write the test to a temp file and run with tsx
import { writeFileSync, unlinkSync } from 'fs';
const tmpFile = resolve(projectRoot, '.test-address-parser-tmp.ts');
writeFileSync(tmpFile, testCode);

try {
  execSync(`npx tsx ${tmpFile}`, { stdio: 'inherit', cwd: projectRoot });
} finally {
  try { unlinkSync(tmpFile); } catch {}
}
