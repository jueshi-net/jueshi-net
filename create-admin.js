const { createPrismaClient } = require('./node_modules/.prisma/client/extension.js');

// Prisma 7 uses a factory pattern
const { PrismaClient } = require('@prisma/client');

async function main() {
  // Prisma 7 requires an options object
  const prisma = new PrismaClient({});
  
  try {
    // Check existing admin users
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (admins.length > 0) {
      console.log('Existing admin users:');
      admins.forEach(u => console.log(`  - ${u.email} (${u.name})`));
    } else {
      console.log('No admin users found.');
      console.log('Creating default admin...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@kjbxb.com',
          name: '管理员',
          password: hashedPassword,
          role: 'admin',
        }
      });
      
      console.log(`Created admin user: ${admin.email}`);
      console.log('Password: admin123456');
      
      // Create workspace
      await prisma.workspace.create({
        data: {
          ownerId: admin.id,
          name: '管理员工作台',
          slug: 'admin-ws',
        }
      });
      console.log('Created workspace for admin');
    }
    
    // Also list all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('\nAll users:');
    allUsers.forEach(u => console.log(`  - ${u.email} | ${u.name} | role: ${u.role}`));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
