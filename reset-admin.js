const { createPrismaClient } = require('./node_modules/@prisma/client/extension.js');
const bcrypt = require('bcryptjs');

async function main() {
  // Use raw pg connection
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Check if admin user exists
    const { rows } = await pool.query(
      `SELECT id, email, name, role, LEFT(password, 10) as pwd_prefix FROM "users" WHERE email = $1`,
      ['admin@kjbxb.com']
    );
    
    if (rows.length > 0) {
      console.log('Admin user exists:', rows[0]);
      
      // Reset password
      const newHash = await bcrypt.hash('admin123456', 10);
      await pool.query(
        `UPDATE "users" SET password = $1 WHERE email = $2`,
        [newHash, 'admin@kjbxb.com']
      );
      console.log('Password reset to: admin123456');
      
      // Verify
      const { rows: verify } = await pool.query(
        `SELECT password FROM "users" WHERE email = $1`,
        ['admin@kjbxb.com']
      );
      const isValid = await bcrypt.compare('admin123456', verify[0].password);
      console.log('Password verification:', isValid ? 'SUCCESS' : 'FAILED');
      
      // Also check workspace
      const { rows: ws } = await pool.query(
        `SELECT id, name, slug FROM "workspaces" WHERE "ownerid" = $1`,
        [rows[0].id]
      );
      if (ws.length === 0) {
        console.log('Creating workspace...');
        await pool.query(
          `INSERT INTO "workspaces" (id, name, slug, "ownerid", createdat, updatedat) 
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [`ws-${rows[0].id.slice(0,8)}`, '管理员工作台', 'admin-ws', rows[0].id]
        );
        console.log('Workspace created');
      } else {
        console.log('Workspace exists:', ws[0]);
      }
      
    } else {
      console.log('Admin user not found, creating...');
      const id = 'admin-' + Date.now();
      const newHash = await bcrypt.hash('admin123456', 10);
      await pool.query(
        `INSERT INTO "users" (id, email, name, password, role, createdat, updatedat) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [id, 'admin@kjbxb.com', '管理员', newHash, 'admin']
      );
      console.log('Created admin user');
      
      await pool.query(
        `INSERT INTO "workspaces" (id, name, slug, "ownerid", createdat, updatedat) 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [`ws-${id.slice(0,8)}`, '管理员工作台', 'admin-ws', id]
      );
      console.log('Created workspace');
    }
    
    // List all users
    const { rows: allUsers } = await pool.query(`SELECT id, email, name, role FROM "users" ORDER BY createdat DESC LIMIT 5`);
    console.log('\nRecent users:');
    allUsers.forEach(u => console.log(`  ${u.email} | ${u.name} | ${u.role}`));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
