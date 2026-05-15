// scripts/ops/downgrade-expired-members.ts
// Check for expired member trial users and downgrade them back to "user".
// Run via cron: 0 */6 * * * (every 6 hours) or daily.
// Usage: npx tsx scripts/ops/downgrade-expired-members.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Checking for expired member trials...`);

  // Find users whose role is member/memberUntil has passed and is not admin
  const expired = await prisma.user.findMany({
    where: {
      role: "member",
      memberUntil: { not: null, lte: now },
    },
    select: { id: true, email: true, memberUntil: true },
  });

  if (expired.length === 0) {
    console.log("No expired member trials found.");
    return;
  }

  console.log(`Found ${expired.length} expired member(s):`);
  expired.forEach((u) => {
    console.log(`  - ${u.email} (expired: ${u.memberUntil?.toISOString()})`);
  });

  // Downgrade all expired members
  const result = await prisma.user.updateMany({
    where: {
      id: { in: expired.map((u) => u.id) },
    },
    data: {
      role: "user",
      memberUntil: null,
    },
  });

  console.log(`Downgraded ${result.count} user(s) to role=user`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
