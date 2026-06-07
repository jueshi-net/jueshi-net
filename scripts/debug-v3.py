#!/usr/bin/env python3
"""Simple count test for chapter sheets"""
import openpyxl
import warnings
warnings.filterwarnings('ignore')

file_path = "/Users/chq/Desktop/2025.1.5【含分类章节】HS-CIQ代码对照表-爆米hs查询.xlsx"
wb = openpyxl.load_workbook(file_path, data_only=True)

sheets = ['1.1', '11.61', '11.62', '15.72', '16.84', '20.94']

for sn in sheets:
    ws = wb[sn]
    rows = list(ws.iter_rows(values_only=True))
    print(f"\n=== {sn}: {len(rows)} rows ===")
    
    # Manually check rows 2-5 (after header at row 1)
    for i in range(2, min(6, len(rows))):
        row = rows[i]
        if not row or len(row) < 4:
            print(f"  Row {i}: SKIP (too short)")
            continue
        
        raw_code = row[0]
        raw_name = row[3]
        
        code_str = str(raw_code).strip()
        digits = ''.join(c for c in code_str if c.isdigit())
        
        name_str = str(raw_name).strip() if raw_name else ''
        
        print(f"  Row {i}: raw_code={raw_code!r}, digits={digits}, raw_name={name_str[:40]!r}")

wb.close()
