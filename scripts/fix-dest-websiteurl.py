#!/usr/bin/env python3
"""Simple update for websiteUrl in destination files"""

# Admin page updates
admin_path = "/Users/chq/xixiong-saas/_tmp_admin-dest.tsx"
with open(admin_path, "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # 1. Service interface
    if "interface Service { title: string; category: string; description: string }" in line:
        line = line.replace("description: string }", "description: string; websiteUrl?: string }")
    # 2. Load mapping
    if "services: (d.services || []).map((s: any) => ({ title: s.title, category: s.category, description: s.description }))" in line:
        line = line.replace("description: s.description }))", "description: s.description, websiteUrl: s.websiteUrl || '' }))")
    # 3. Form mapping
    if "services: (g.services || []).map((si: any) => ({ title: si.title, category: si.category, description: si.description }))" in line:
        line = line.replace("description: si.description }))", "description: si.description, websiteUrl: si.websiteUrl || '' }))")
    # 4. Save mapping
    if "services: form.services.map(s => ({ title: s.title, category: s.category, description: s.description }))" in line:
        line = line.replace("description: s.description }))", "description: s.description, websiteUrl: s.websiteUrl || undefined }))")
    # 5. addService default
    if '{ title: "", category: "仓储", description: "" }' in line:
        line = line.replace('description: "" }', 'description: "", websiteUrl: "" }')
    new_lines.append(line)

with open(admin_path, "w") as f:
    f.writelines(new_lines)
print("Admin page updated")

# Add websiteUrl input after description textarea in service form
with open(admin_path, "r") as f:
    content = f.read()

# Find the pattern and insert websiteUrl input after description textarea
search = 'placeholder="服务商描述..." />'
replacement = '''placeholder="服务商描述..." />
                <input value={s.websiteUrl || ""} onChange={e => {
                  const svcs = [...form.services];
                  svcs[i] = { ...svcs[i], websiteUrl: e.target.value };
                  setForm(f => ({ ...f, services: svcs }));
                }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="官网地址 (https://...)" />'''

if search in content:
    content = content.replace(search, replacement)
    with open(admin_path, "w") as f:
        f.write(content)
    print("Service form input added")
else:
    print("WARNING: Could not find service form textarea pattern")

# Public destination page
public_path = "/Users/chq/xixiong-saas/_tmp_public-dest.tsx"
with open(public_path, "r") as f:
    content = f.read()

# Make service titles clickable
# Find the service rendering section and add link
old = "{s.title}"
new = '{s.websiteUrl ? (<a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">{s.title}</a>) : s.title}'
if old in content:
    content = content.replace(old, new)
    with open(public_path, "w") as f:
        f.write(content)
    print("Public page: service titles made clickable")
else:
    print("WARNING: Could not find s.title in public page")
