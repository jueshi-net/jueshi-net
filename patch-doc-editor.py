import sys

fpath = "/home/deploy/xixiong-saas/src/app/(public)/tools/documents/[type]/page.tsx"
with open(fpath, "r") as f:
    src = f.read()
print(f"Read {len(src)} chars")

# P1
src = src.replace(
    "import { useParams, useRouter } from 'next/navigation';",
    "import { useParams, useRouter, useSearchParams } from 'next/navigation';"
)
print("P1: useSearchParams")

# P2
src = src.replace(
    "const router = useRouter();",
    "const router = useRouter();\n  const searchParams = useSearchParams();"
)
print("P2: searchParams hook")

# P3
src = src.replace(
    "const [exporting, setExporting] = useState(false);",
    "const [exporting, setExporting] = useState(false);\n  const [saving, setSaving] = useState(false);"
)
print("P3: saving state")

with open(fpath, "w") as f:
    f.write(src)
print("Phase 1 patches written")
