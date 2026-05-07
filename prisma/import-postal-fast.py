#!/usr/bin/env python3
"""Fast postal code import using psycopg2 batch + COPY-like approach."""
import os
import time
import random
import string

try:
    import psycopg2
    from psycopg2.extras import execute_batch
except ImportError:
    os.system('pip install psycopg2-binary')
    import psycopg2
    from psycopg2.extras import execute_batch

DB_URL = 'postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'

def generate_id():
    """Generate a cuid-like ID."""
    t = int(time.time() * 1000)
    base36 = string.digits + string.ascii_lowercase
    ts = ''
    while t > 0:
        ts = base36[t % 36] + ts
        t //= 36
    rand = ''.join(random.choices(base36, k=7))
    return 'p' + ts[-6:] + rand

def main():
    filepath = os.path.expanduser('~/projects/xixiong-saas/data/allCountries.txt')
    size_mb = os.path.getsize(filepath) / 1024 / 1024
    print(f'🌍 Fast postal code import to PostgreSQL')
    print(f'📁 File: {filepath} ({size_mb:.1f} MB)')
    
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()
    
    batch = []
    batch_size = 2000
    imported = 0
    skipped = 0
    total = 0
    start = time.time()
    
    insert_sql = """
        INSERT INTO postal_codes 
        (id, "countryCode", country, "postalCode", city, province, district, "isActive", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, true, NOW(), NOW())
        ON CONFLICT ("country", "postalCode") DO NOTHING
    """
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            total += 1
            
            parts = line.split('\t')
            if len(parts) < 3:
                skipped += 1
                continue
            
            country_code = parts[0].strip()
            postal_code = parts[1].strip()
            place_name = parts[2].strip() if len(parts) > 2 else ''
            admin1 = parts[3].strip() if len(parts) > 3 else ''
            admin2 = parts[4].strip() if len(parts) > 4 else ''
            
            if not postal_code or not country_code:
                skipped += 1
                continue
            
            batch.append((
                generate_id(),
                country_code,
                country_code,  # country = countryCode
                postal_code,
                place_name or '',
                admin1 or '',
                admin2 or ''
            ))
            
            if len(batch) >= batch_size:
                try:
                    execute_batch(cur, insert_sql, batch, page_size=batch_size)
                    conn.commit()
                    imported += len(batch)
                except Exception as e:
                    conn.rollback()
                    skipped += len(batch)
                    if 'null value' not in str(e):
                        print(f'⚠️ Batch error: {str(e)[:150]}')
                batch = []
                
                if total % 500000 == 0:
                    elapsed = time.time() - start
                    rate = total / elapsed if elapsed > 0 else 0
                    print(f'📊 {total:,} processed | {imported:,} imported | {skipped:,} skipped | {rate:,.0f}/s | {elapsed:.0f}s')
    
    # Final batch
    if batch:
        try:
            execute_batch(cur, insert_sql, batch, page_size=len(batch))
            conn.commit()
            imported += len(batch)
        except Exception as e:
            conn.rollback()
            skipped += len(batch)
    
    elapsed = time.time() - start
    cur.close()
    conn.close()
    
    print(f'\n🎉 Import complete!')
    print(f'✅ Total imported: {imported:,}')
    print(f'📊 Total processed: {total:,}')
    print(f'⏭️  Skipped: {skipped:,}')
    print(f'⏱️  Time: {elapsed:.1f}s ({total/elapsed:,.0f} lines/s)')

if __name__ == '__main__':
    main()
