#!/usr/bin/env python3
with open('scripts/s0-final-automated-verification.mjs', 'r') as f:
    lines = f.readlines()

# Find and fix the malformed PASSWORD line
for i, line in enumerate(lines):
    if 'const PASSWORD' in line and '***' in line:
        # Replace with correct syntax
        lines[i] = "const PASSWORD=***        break

with open('scripts/s0-final-automated-verification.mjs', 'w') as f:
    f.writelines(lines)

print('✅ Fixed PASSWORD syntax')
