#!/usr/bin/env python3
"""Update destination-hero-client for websiteUrl"""

path = "/Users/chq/xixiong-saas/_tmp_dest-hero.tsx"
with open(path, "r") as f:
    content = f.read()

# 1. Update interface
content = content.replace(
    "services: { title: string; category: string; description: string }[];",
    "services: { title: string; category: string; description: string; websiteUrl?: string }[];"
)

# 2. Make service titles clickable
content = content.replace(
    "{svc.title}",
    '{svc.websiteUrl ? (<a href={svc.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-600 hover:underline">{svc.title}</a>) : svc.title}'
)

with open(path, "w") as f:
    f.write(content)

print("destination-hero-client.tsx updated")
