#!/usr/bin/env python3
"""Add websiteUrl input to admin service form + update public destination page"""

# Admin page
path = "/Users/chq/xixiong-saas/_tmp_admin-dest.tsx"
with open(path, "r") as f:
    content = f.read()

# Find the description textarea and add websiteUrl input after it
old_text = 'placeholder="50-80字描述..." />'
new_text = '''placeholder="50-80字描述..." />
                <input value={s.websiteUrl || ""} onChange={e => {
                  const svcs = [...form.services];
                  svcs[i] = { ...svcs[i], websiteUrl: e.target.value };
                  setForm({ ...form, services: svcs });
                }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="官网地址 (https://...)" />'''

if old_text in content:
    content = content.replace(old_text, new_text)
    with open(path, "w") as f:
        f.write(content)
    print("Admin: websiteUrl input added")
else:
    print("Admin: pattern not found")
    # Debug: show what's around "50-80"
    idx = content.find("50-80")
    if idx > 0:
        print(f"Found at index {idx}: {content[idx-20:idx+60]}")

# Public page
pub_path = "/Users/chq/xixiong-saas/_tmp_public-dest.tsx"
with open(pub_path, "r") as f:
    content = f.read()

# Find service title rendering and make it clickable
# Look for the service map section
old_title = "{s.title}"
new_title = '{s.websiteUrl ? (<a href={s.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">{s.title}</a>) : s.title}'

if old_title in content:
    content = content.replace(old_title, new_title)
    with open(pub_path, "w") as f:
        f.write(content)
    print("Public: service titles made clickable")
else:
    print("Public: s.title not found")
    # Debug
    idx = content.find("s.title")
    if idx > 0:
        print(f"Found at {idx}: {content[idx-30:idx+50]}")
