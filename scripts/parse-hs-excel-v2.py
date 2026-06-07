#!/usr/bin/env python3
"""
Parse ALL sheets from commercial HS-CIQ Excel file.
Fixed: substring matching for headers, lenient data extraction.
"""

import openpyxl
import json
import os
import warnings
warnings.filterwarnings('ignore')

file_path = os.path.expanduser("~/Desktop/2025.1.5【含分类章节】HS-CIQ代码对照表-爆米hs查询.xlsx")
output_path = os.path.expanduser("~/Desktop/hs_codes_ready_v2.json")

print("📖 Opening Excel file...")
wb = openpyxl.load_workbook(file_path, data_only=True)
print(f"Total sheets: {len(wb.sheetnames)}")

results = []
seen_codes = set()
sheet_stats = {}

# Substring matching for flexible column detection
def col_match(val, aliases):
    """Check if val contains any of the aliases (substring match)"""
    if val is None:
        return False
    v = str(val).strip().lower()
    for alias in aliases:
        if alias.lower() in v:
            return True
    return False

CODE_KEYS = ['商品编码', 'hs编码', '编码', '税则号', '海关编码', '税号', 'hscode']
NAME_KEYS = ['检验检疫名称', '中文名称', '商品名称', '品名', '商品中文名']
EN_KEYS = ['检验检疫英文名称', '英文名称', '商品英文名', 'english']
CATEGORY_KEYS = ['中文描述', '分类', '章节', '类别', '章名']
CIQ_KEYS = ['ciq代码', '13位检验检疫', '检验检疫代码', 'ciq']
NOTES_KEYS = ['备注', '说明', '申报要素', '规范申报']

def find_columns(header_row):
    cols = {}
    for idx, cell in enumerate(header_row):
        if cell is None:
            continue
        v = str(cell).strip()
        if col_match(v, CODE_KEYS):
            if 'code' not in cols:  # First match wins
                cols['code'] = idx
        if col_match(v, NAME_KEYS):
            if 'name' not in cols:
                cols['name'] = idx
        if col_match(v, EN_KEYS):
            if 'en' not in cols:
                cols['en'] = idx
        if col_match(v, CATEGORY_KEYS):
            if 'category' not in cols:
                cols['category'] = idx
        if col_match(v, CIQ_KEYS):
            if 'ciq' not in cols:
                cols['ciq'] = idx
        if col_match(v, NOTES_KEYS):
            if 'notes' not in cols:
                cols['notes'] = idx
    return cols

def extract_code(val):
    if val is None:
        return None
    s = str(val).strip()
    digits = ''.join(c for c in s if c.isdigit())
    if len(digits) >= 4 and len(digits) <= 13:
        return digits
    return None

SKIP_TERMS = ['跳转至', '上一章节', '下一章节', '友情提示', 
              '更多企业', '归类总则', '分类章节', 'Sheet1']

def process_sheet(ws, sheet_name):
    count = 0
    rows = list(ws.iter_rows(values_only=True))
    
    if len(rows) < 2:
        return 0
    
    # Find header row in first 5 rows
    header_idx = None
    col_map = {}
    
    for i in range(min(5, len(rows))):
        row = rows[i]
        if not row:
            continue
        cols = find_columns(row)
        if 'code' in cols:
            header_idx = i
            col_map = cols
            break
    
    if header_idx is None:
        # Fallback: try row 1 (0-indexed) as header
        cols = find_columns(rows[1] if len(rows) > 1 else [])
        if 'code' in cols:
            header_idx = 1
            col_map = cols
        else:
            return 0
    
    # Process data rows
    for row in rows[header_idx + 1:]:
        if not row:
            continue
        
        code_idx = col_map.get('code')
        name_idx = col_map.get('name')
        
        if code_idx is None or name_idx is None:
            continue
        if code_idx >= len(row) or name_idx >= len(row):
            continue
        
        # Extract code
        code = extract_code(row[code_idx])
        if not code:
            continue
        
        # Extract name
        name = str(row[name_idx]).strip() if row[name_idx] is not None else ''
        if not name or name == 'None':
            continue
        
        # Skip navigation rows
        if any(skip in name for skip in SKIP_TERMS):
            continue
        
        # DO NOT deduplicate - keep ALL rows (same code with different CIQ = different regulatory category)
        # Only skip empty names and nav rows
        if code in seen_codes:
            # Same code, different CIQ - still keep it but mark duplicate
            pass
        seen_codes.add(code)
        
        # Optional fields
        en_idx = col_map.get('en')
        desc_en = ''
        if en_idx is not None and en_idx < len(row) and row[en_idx] is not None:
            desc_en = str(row[en_idx]).strip()
            if desc_en == 'None':
                desc_en = ''
        
        cat_idx = col_map.get('category')
        category = ''
        if cat_idx is not None and cat_idx < len(row) and row[cat_idx] is not None:
            category = str(row[cat_idx]).strip()
            if category == 'None':
                category = ''
        
        ciq_idx = col_map.get('ciq')
        ciq = ''
        if ciq_idx is not None and ciq_idx < len(row) and row[ciq_idx] is not None:
            ciq = str(row[ciq_idx]).strip()
            if ciq == 'None':
                ciq = ''
        
        # Build notes
        notes = ''
        if ciq:
            notes = f"CIQ: {ciq}"
        
        # Level
        level = len(code)
        if level <= 4: level = 4
        elif level <= 6: level = 6
        elif level <= 8: level = 8
        elif level <= 10: level = 10
        else: level = 13
        
        # Category fallback
        if not category:
            category = f"第{int(code[:2])}章"
        
        results.append({
            "code": code,
            "level": level,
            "description": name,
            "descriptionEn": desc_en if desc_en else name,
            "category": category,
            "taxRate": None,
            "notes": notes,
        })
        count += 1
    
    return count

# Process ALL sheets
for sheet_name in wb.sheetnames:
    ws = wb[sheet_name]
    cnt = process_sheet(ws, sheet_name)
    sheet_stats[sheet_name] = cnt
    if cnt > 0:
        print(f"  {sheet_name}: {cnt} records")

print(f"\n✅ Total unique records: {len(results)}")

# Sheet summary (sorted by count desc)
print(f"\n📊 Sheet extraction summary ({len(wb.sheetnames)} sheets processed):")
total = 0
sheets_with_data = {k: v for k, v in sheet_stats.items() if v > 0}
print(f"   Sheets with data: {len(sheets_with_data)}")
for name, cnt in sorted(sheets_with_data.items(), key=lambda x: -x[1])[:20]:
    print(f"   {name}: {cnt}")
    total += cnt
remaining = sum(1 for v in sheets_with_data.values() if v > 0) - 20
if remaining > 0:
    remaining_total = total - sum(list(sheets_with_data.values())[:20])
    print(f"   ... and {remaining} more sheets: {sum(list(sheets_with_data.values())[20:])}")
print(f"   Grand total: {total}")

# Save
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

file_size = os.path.getsize(output_path)
print(f"\n💾 Saved to {output_path}")
print(f"   Size: {file_size / 1024 / 1024:.1f} MB")
print(f"   Records: {len(results)}")

# Self-check
check_terms = ["床垫", "相框", "鼠标", "保温杯", "挖掘机", "大衣", "连衣裙", 
               "咖啡", "手机", "保温瓶", "螺丝", "椅子", "钢笔", "袜子", "帽子"]
print(f"\n🔍 Self-check:")
for term in check_terms:
    found = [r for r in results if term in r.get('description', '')]
    if found:
        print(f"  ✅ '{term}': {len(found)} records")
        for fi in found[:1]:
            print(f"     {fi['code']} | {fi['description'][:60]}")
    else:
        print(f"  ❌ '{term}': NOT FOUND")

wb.close()
