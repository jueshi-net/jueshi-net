
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATABASE_URL = "postgresql://bxb_user:***@127.0.0.1:15432/xixiong_service_provider_preview?schema=public";

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  
  // Drop all tables and start fresh
  console.log('Dropping all existing tables...');
  await client.query(`DROP SCHEMA public CASCADE`);
  await client.query(`CREATE SCHEMA public`);
  console.log('Schema reset done.');
  
  const migrationDir = path.join(process.cwd(), 'prisma', 'migrations');
  const dirs = fs.readdirSync(migrationDir).filter(d => 
    fs.statSync(path.join(migrationDir, d)).isDirectory()
  ).sort();
  
  console.log('Found ' + dirs.length + ' migrations to apply');
  
  // Create _prisma_migrations table
  await client.query(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (id VARCHAR(36) PRIMARY KEY, checksum VARCHAR(64) NOT NULL, finished_at TIMESTAMPTZ, migration_name VARCHAR(255) NOT NULL, logs TEXT, rolled_back_at TIMESTAMPTZ, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), applied_steps_count INTEGER NOT NULL DEFAULT 0)`);
  
  let applied = 0, failed = 0;
  const failures = [];
  
  for (const dir of dirs) {
    const sqlPath = path.join(migrationDir, dir, 'migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(`INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, started_at, applied_steps_count) VALUES ($1, $2, now(), $3, now(), 1)`, [crypto.randomUUID(), 'manual', dir]);
      await client.query('COMMIT');
      applied++;
    } catch (e) {
      await client.query('ROLLBACK');
      failed++;
      failures.push({ dir, error: e.message.substring(0, 200) });
    }
  }
  
  console.log('Applied: ' + applied + ', Failed: ' + failed);
  if (failures.length > 0) {
    failures.forEach(f => console.log('  FAIL: ' + f.dir + ' - ' + f.error));
  }
  
  const tables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
  console.log('TABLE_COUNT=' + tables.rows.length);
  if (tables.rows.length > 0) {
    console.log('TABLES=' + tables.rows.map(t => t.tablename).join(','));
  }
  
  client.release();
  await pool.end();
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
