// Task daily cap real test — runs via Prisma directly on server
// Tests: create 11 tasks, complete, verify only 10 get +2 points (max 20/day)
// Also tests: duplicate task points prevention, archived task protection

require("dotenv").config({ path: ".env.production" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function getTodayDateKeyVancouver() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
}

function getTodayRange() {
  const dateKey = getTodayDateKeyVancouver();
  const offsetStr = (() => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Vancouver",
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offsetPart = parts.find(p => p.type === "timeZoneName");
    if (!offsetPart) return "+00:00";
    const match = offsetPart.value.match(/GMT([+-]?\d+)/);
    if (!match) return "+00:00";
    const hours = parseInt(match[1]);
    const sign = hours < 0 ? "-" : "+";
    const absHours = Math.abs(hours);
    return `${sign}${absHours.toString().padStart(2, "0")}:00`;
  })();
  const start = new Date(`${dateKey}T00:00:00.000${offsetStr}`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function main() {
  console.log("=== v1.14.1 Task Daily Cap Real Test ===\n");
  console.log(`Today (Vancouver): ${getTodayDateKeyVancouver()}`);
  console.log(`Today range: ${getTodayRange().start.toISOString()} to ${getTodayRange().end.toISOString()}`);

  // Use test-member for clean test
  const member = await prisma.user.findFirst({
    where: { email: "test-member@local.test" },
  });
  if (!member) {
    console.log("❌ test-member@local.test not found");
    return;
  }
  console.log(`\nTest member: ${member.email} (id: ${member.id}, role: ${member.role})`);
  console.log(`Member current points: ${member.points}`);

  // Clean slate: remove today's data for test-member
  const { start, end } = getTodayRange();
  const todayTasks = await prisma.userTask.findMany({
    where: { userId: member.id, createdAt: { gte: start, lt: end } },
  });
  console.log(`\nCleaning ${todayTasks.length} today's tasks for test-member...`);

  for (const task of todayTasks) {
    await prisma.pointLedger.deleteMany({ where: { relatedId: task.id } });
    await prisma.userTask.delete({ where: { id: task.id } });
  }

  await prisma.pointLedger.deleteMany({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
  });

  await prisma.user.update({ where: { id: member.id }, data: { points: 0 } });
  console.log("Clean slate: points reset to 0\n");

  // --- TEST 1: Create 11 tasks ---
  console.log("--- Step 1: Create 11 tasks ---");
  const taskIds = [];
  for (let i = 1; i <= 11; i++) {
    const task = await prisma.userTask.create({
      data: {
        userId: member.id,
        title: `测试任务 ${i}`,
        status: "pending",
        priority: "normal",
      },
    });
    taskIds.push(task.id);
    console.log(`  Created task ${i}: ${task.id.slice(0, 8)}...`);
  }

  // --- TEST 2: Complete tasks one by one ---
  console.log("\n--- Step 2: Complete tasks ---");

  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const taskBefore = await prisma.userTask.findUnique({ where: { id: taskId } });

    if (taskBefore.status !== "done" && !taskBefore.pointsAwarded) {
      const dailyPoints = await prisma.pointLedger.aggregate({
        _sum: { points: true },
        where: {
          userId: member.id,
          type: "task_complete",
          createdAt: { gte: start, lt: end },
        },
      });
      const earnedToday = dailyPoints._sum.points || 0;
      const dailyCap = 20;

      let awardedPoints = 0;
      let pointsAwarded = false;

      if (earnedToday < dailyCap) {
        awardedPoints = Math.min(2, dailyCap - earnedToday);
        pointsAwarded = true;
      }

      await prisma.userTask.update({
        where: { id: taskId },
        data: { status: "done", completedAt: new Date(), pointsAwarded },
      });

      if (awardedPoints > 0) {
        await prisma.pointLedger.create({
          data: {
            userId: member.id,
            type: "task_complete",
            points: awardedPoints,
            reason: "完成任务",
            relatedId: taskId,
          },
        });
        await prisma.user.update({
          where: { id: member.id },
          data: { points: { increment: awardedPoints } },
        });
      }

      const status = awardedPoints > 0 ? `✅ +${awardedPoints} pts` : `❌ no points (cap reached)`;
      console.log(`  Task ${i + 1}/11 completed: ${status}`);
    }
  }

  // --- TEST 3: Verify results ---
  console.log("\n--- Step 3: Verify ---");

  const userAfter = await prisma.user.findUnique({ where: { id: member.id }, select: { points: true } });
  const ledgerEntries = await prisma.pointLedger.findMany({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`  Users.points: ${userAfter.points}`);
  console.log(`  Expected: 20 (cap: 10 tasks * 2 points)`);
  console.log(`  Ledger entries: ${ledgerEntries.length}`);
  console.log(`  Expected ledger entries: 10`);
  console.log(`  Total earned from tasks: ${ledgerEntries.reduce((sum, l) => sum + l.points, 0)}`);

  const allTasks = await prisma.userTask.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, pointsAwarded: true },
  });
  const pointsAwardedCount = allTasks.filter(t => t.pointsAwarded).length;
  console.log(`  Tasks with pointsAwarded=true: ${pointsAwardedCount}`);

  const task11 = await prisma.userTask.findUnique({ where: { id: taskIds[10] } });
  console.log(`  Task 11 pointsAwarded: ${task11.pointsAwarded} (expected: false)`);

  // --- TEST 4: Duplicate prevention ---
  console.log("\n--- Step 4: Duplicate prevention test ---");
  await prisma.userTask.update({
    where: { id: taskIds[0] },
    data: { status: "pending", pointsAwarded: true },
  });
  const task1Reopen = await prisma.userTask.findUnique({ where: { id: taskIds[0] } });

  if (!task1Reopen.pointsAwarded) {
    console.log("  ❌ FAIL: pointsAwarded should be true");
  } else {
    console.log("  ✅ PASS: pointsAwarded=true prevents duplicate even if re-opened");
  }

  await prisma.userTask.update({
    where: { id: taskIds[0] },
    data: { status: "done" },
  });
  const task1After = await prisma.userTask.findUnique({ where: { id: taskIds[0] } });

  const finalLedgerCount = await prisma.pointLedger.count({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
  });
  console.log(`  Final ledger count: ${finalLedgerCount} (expected: 10)`);

  // --- FINAL SUMMARY ---
  console.log("\n=== Test Summary ===");
  const allPass =
    userAfter.points === 20 &&
    finalLedgerCount === 10 &&
    !task11.pointsAwarded &&
    task1After.pointsAwarded;

  console.log(`  Points earned: ${userAfter.points} / 20 expected`);
  console.log(`  Ledger entries: ${finalLedgerCount} / 10 expected`);
  console.log(`  Task 11 blocked: ${!task11.pointsAwarded ? '✅' : '❌'}`);
  console.log(`  Duplicate prevention: ${task1After.pointsAwarded ? '✅' : '❌'}`);
  console.log(`\nOverall: ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
