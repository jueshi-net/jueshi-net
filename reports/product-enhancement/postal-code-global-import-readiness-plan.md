# Postal Code Global Import Readiness Plan

**Date**: 2026-06-15  
**Status**: DRAFT — Awaiting user approval  
**Scope**: Import missing country data into postal_codes table

---

## 1. Current State

| Metric | Value |
|---|---|
| Total records | 3,794,541 |
| Countries in DB | 116 |
| Countries in SUPPORTED | 51 |
| Supported with data | 43 |
| Supported without data | 8 |
| Data source | GeoNames (100%) |

---

## 2. Missing Countries Requiring Import

### Priority 1 — User-Requested + Major Trade Partners

| Code | Country | GeoNames File | Est. Records | Schema Compatible |
|---|---|---|---|---|
| **VN** | Vietnam | VN.zip | ~11,000 | ✅ Yes |
| **TW** | Taiwan | TW.zip | ~8,000 | ✅ Yes |
| **HK** | Hong Kong | HK.zip | ~100 | ✅ Yes (fix existing 1 record) |
| **SA** | Saudi Arabia | SA.zip | ~4,500 | ✅ Yes |

### Priority 2 — Supported but Missing

| Code | Country | GeoNames File | Est. Records |
|---|---|---|---|
| GR | Greece | GR.zip | ~5,000 |
| IL | Israel | IL.zip | ~1,200 |
| ZA | South Africa | ZA.zip | ~4,000 |
| EG | Egypt | EG.zip | ~3,500 |
| NG | Nigeria | NG.zip | ~2,500 |

### Priority 3 — DB Exists, Add to SUPPORTED

71 countries already have data. Just need to add to SUPPORTED_COUNTRIES list.

---

## 3. Data Source: GeoNames

**URL**: https://download.geonames.org/export/zip/  
**License**: Creative Commons Attribution 4.0  
**Format**: ZIP containing TSV file `{CC}.txt`

### TSV Schema (GeoNames)

| Column | Field | Maps To |
|---|---|---|
| 1 | country code | countryCode |
| 2 | postal code | postalCode |
| 3 | place name | city |
| 4 | admin name 1 | province |
| 5 | admin code 1 | adminCode1 |
| 6 | admin name 2 | district |
| 7 | admin code 2 | adminCode2 |
| 8 | admin name 3 | (unused) |
| 9 | admin code 3 | (unused) |
| 10 | latitude | latitude |
| 11 | longitude | longitude |
| 12 | accuracy | accuracy |

### Field Mapping to Our Schema

```
GeoNames → postal_codes
─────────────────────────
country code    → "countryCode"
postal code     → "postalCode" + "normalizedPostalCode"
place name      → city
admin name 1    → province
admin code 1    → "adminCode1"
admin name 2    → district
admin code 2    → "adminCode2"
latitude        → latitude
longitude       → longitude
accuracy        → accuracy
(country code)  → country (ISO name lookup)
—               → source = 'GeoNames'
—               → "sourceUrl" = 'https://download.geonames.org/export/zip/'
—               → "sourceVersion" = download date
—               → "isActive" = true
```

---

## 4. Import Strategy

### Approach: Insert-Only with Dedup

```sql
INSERT INTO postal_codes (...)
SELECT ...
FROM import_staging
WHERE NOT EXISTS (
  SELECT 1 FROM postal_codes
  WHERE "countryCode" = import_staging."countryCode"
  AND "normalizedPostalCode" = import_staging."normalizedPostalCode"
  AND city = import_staging.city
)
```

### Why Not Upsert?
- Avoids accidentally overwriting existing data
- Preserves any manually curated records
- Clear audit trail

### Dedup Key
`countryCode + normalizedPostalCode + city`

---

## 5. Import Script Design

### Phase 1: Download
```bash
# Download GeoNames ZIP
curl -o VN.zip https://download.geonames.org/export/zip/VN.zip
unzip VN.zip  # Extracts VN.txt
```

### Phase 2: Staging Table
```sql
CREATE TEMP TABLE import_staging (
  "countryCode" TEXT,
  "postalCode" TEXT,
  "normalizedPostalCode" TEXT,
  city TEXT,
  province TEXT,
  "adminCode1" TEXT,
  district TEXT,
  "adminCode2" TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  accuracy INTEGER,
  country TEXT,
  source TEXT DEFAULT 'GeoNames',
  "sourceUrl" TEXT DEFAULT 'https://download.geonames.org/export/zip/',
  "sourceVersion" TEXT,
  "isActive" BOOLEAN DEFAULT true
);
```

### Phase 3: Load TSV → Staging
Parse TSV, normalize postal codes, look up country name.

### Phase 4: Insert with Dedup
```sql
INSERT INTO postal_codes (...)
SELECT ... FROM import_staging s
WHERE NOT EXISTS (
  SELECT 1 FROM postal_codes p
  WHERE p."countryCode" = s."countryCode"
  AND p."normalizedPostalCode" = s."normalizedPostalCode"
  AND p.city = s.city
);
```

### Phase 5: Verify
```sql
SELECT "countryCode", COUNT(*) 
FROM postal_codes 
WHERE "countryCode" = 'VN' AND "isActive" = true;
```

---

## 6. Safety Measures

### Pre-Import Backup
```bash
# Full table backup
pg_dump "$DATABASE_URL" -t postal_codes -f postal_codes_backup_$(date +%Y%m%d).sql

# Or per-country backup
pg_dump "$DATABASE_URL" -t postal_codes --where='"countryCode" IN (''VN'',''TW'',''HK'')' \
  -f postal_codes_vn_tw_hk_backup.sql
```

### Rollback Plan
```sql
-- Delete only imported records (by source version)
DELETE FROM postal_codes 
WHERE "countryCode" = 'VN' 
AND "sourceVersion" = '2026-06-15';

-- Or full country rollback
DELETE FROM postal_codes WHERE "countryCode" = 'VN';
```

### Import Verification Checklist
- [ ] Record count matches GeoNames file line count
- [ ] Sample queries return expected results
- [ ] Province/city fields populated
- [ ] No duplicate postal codes
- [ ] API returns results for test queries
- [ ] Frontend displays results correctly

---

## 7. Batch Import Plan

### Batch A — Critical (4 countries)
| Country | File | Est. Records | Risk |
|---|---|---|---|
| VN | VN.zip | ~11,000 | Low |
| TW | TW.zip | ~8,000 | Low |
| HK | HK.zip | ~100 | Low (fix existing) |
| SA | SA.zip | ~4,500 | Low |

**Total**: ~23,600 records  
**Time**: ~5 minutes  
**Rollback**: DELETE by countryCode + sourceVersion

### Batch B — Supported Missing (5 countries)
| Country | File | Est. Records |
|---|---|---|
| GR | GR.zip | ~5,000 |
| IL | IL.zip | ~1,200 |
| ZA | ZA.zip | ~4,000 |
| EG | EG.zip | ~3,500 |
| NG | NG.zip | ~2,500 |

**Total**: ~16,200 records

### Batch C — Add to SUPPORTED (71 countries)
No import needed. Just update SUPPORTED_COUNTRIES in code.

---

## 8. Frontend Updates Required

### After Import
1. Add imported countries to SUPPORTED_COUNTRIES (if not already there)
2. Add timezone mappings for new countries
3. Add Chinese embassy URLs for new countries
4. Add quick-fill example postal codes
5. Remove "暂未覆盖" warning for newly covered countries

### Coverage Badges
Consider adding coverage status indicators:
- 🟢 Full coverage (1000+ records)
- 🟡 Partial coverage (100-999 records)
- 🔴 Minimal coverage (<100 records)

---

## 9. Questions for User Approval

1. **Shall we proceed with Batch A import?** (VN, TW, HK, SA)
2. **Should we also do Batch B?** (GR, IL, ZA, EG, NG)
3. **Should we add all 71 DB-only countries to SUPPORTED?** Or select specific ones?
4. **Should we set up automated monthly sync from GeoNames?**
5. **For ID (Indonesia) with no province data — should we find supplementary source?**

---

## 10. No Migration Required

✅ All imports use existing schema  
✅ No new columns needed  
✅ No Prisma schema changes  
✅ No `prisma db push` required  

---

*End of Import Readiness Plan*
