#!/usr/bin/env python3
"""Fix resend conditional in subscribe route"""
import os

path = "/Users/chq/xixiong-saas/src/app/api/subscribe/route.ts"
with open(path, "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if "await resend.emails.send({" in line:
        new_lines[-1] = line.replace("await resend.emails.send({", "if (resend) { await resend.emails.send({")
    # Find the closing }); of the send call and add closing brace
    if i > 40 and line.strip() == "});":
        # Check if previous lines contain resend.emails.send
        found = False
        for j in range(max(0, i-15), i):
            if "resend.emails.send" in lines[j]:
                found = True
                break
        if found:
            # Add closing brace after this line
            new_lines.append("    }\n")

with open(path, "w") as f:
    f.writelines(new_lines)

print("Fixed resend conditional")
