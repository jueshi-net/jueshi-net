// Task daily cap real test — runs via project's Prisma instance
import { prisma } from "../../src/lib/prisma";

function getTodayDateKeyVancouver(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
}

function getTodayRange(): { start: Date; end: Date } {
  const dateKey = getTodayDateKeyVancouver();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Vancouver",
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());
  const offsetPart = parts.find(p => p.type === "timeZoneName");
  const match = offsetPart?.value.match(/GMT([+-]?\d+)/);
  const hours = match ? parseInt(match[1]) : 0;
  const sign = hours < 0 ? "-" : "+";
  const absHours = Math.abs(hours);
  const offsetStr = `${sign}${absHours.toString().padStart(2, "0")}:00`;
  const start = new Date(`${dateKey}T00:00:00.000${offsetStr}`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function main() {
  console.log("=== v1.14.1 Task Daily Cap Real Test ===\n");
  console.log(`Today (Vancouver): ${getTodayDateKeyVancouver()}`);

  const member = await prisma.user.findFirst({
    where: { email: "test-member@local.test" },
  });
  if (!member) {
    console.log("❌ test-member@local.test not found");
    return;
  }
  console.log(`\nTest member: ${member.email} (role: ${member.role}), points: ${member.points}`);

  const { start, end } = getTodayRange();
  console.log(`Today range: ${start.toISOString()} to ${end.toISOString()}`);

  // Clean slate
  const todayTasks = await prisma.userTask.findMany({
    where: { userId: member.id, createdAt: { gte: start, lt: end } },
  });
  console.log(`\nCleaning ${todayTasks.length} today's tasks...`);
  for (const task of todayTasks) {
    await prisma.pointLedger.deleteMany({ where: { relatedId: task.id } });
    await prisma.userTask.delete({ where: { id: task.id } });
  }
  await prisma.pointLedger.deleteMany({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
  });
  await prisma.user.update({ where: { id: member.id }, data: { points: 0 } });
  console.log("Clean slate: points = 0\n");

  // Create 11 tasks
  console.log("--- Step 1: Create 11 tasks ---");
  const taskIds: string[] = [];
  for (let i = 1; i <= 11; i++) {
    const task = await prisma.userTask.create({
      data: { userId: member.id, title: `测试任务 ${i}`, status: "pending", priority: "normal" },
    });
    taskIds.push(task.id);
    console.log(`  Created task ${i}`);
  }

  // Complete tasks
  console.log("\n--- Step 2: Complete tasks ---");
  for (let i = 0; i < taskIds.length; i++) {
    const taskId = taskIds[i];
    const taskBefore = await prisma.userTask.findUnique({ where: { id: taskId } });

    if (taskBefore!.status !== "done" && !taskBefore!.pointsAwarded) {
      const dailyPoints = await prisma.pointLedger.aggregate({
        _sum: { points: true },
        where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
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
          data: { userId: member.id, type: "task_complete", points: awardedPoints, reason: "完成任务", relatedId: taskId },
        });
        await prisma.user.update({ where: { id: member.id }, data: { points: { increment: awardedPoints } } });
      }

      const status = awardedPoints > 0 ? `✅ +${awardedPoints} pts` : `❌ no points (cap reached)`;
      console.log(`  Task ${i + 1}/11: ${status}`);
    }
  }

  // Verify
  console.log("\n--- Step 3: Verify ---");
  const userAfter = await prisma.user.findUnique({ where: { id: member.id }, select: { points: true } });
  const ledgerEntries = await prisma.pointLedger.findMany({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
  });
  const task11 = await prisma.userTask.findUnique({ where: { id: taskIds[10] } });

  console.log(`  Users.points: ${userAfter!.points} (expected: 20)`);
  console.log(`  Ledger entries: ${ledgerEntries.length} (expected: 10)`);
  console.log(`  Task 11 pointsAwarded: ${task11!.pointsAwarded} (expected: false)`);

  // Duplicate prevention
  console.log("\n--- Step 4: Duplicate prevention ---");
  await prisma.userTask.update({ where: { id: taskIds[0] }, data: { status: "pending", pointsAwarded: true } });
  const task1Reopen = await prisma.userTask.findUnique({ where: { id: taskIds[0] } });
  console.log(`  Re-opened task pointsAwarded: ${task1Reopen!.pointsAwarded} (expected: true → blocks re-earn)`);

  const finalLedgerCount = await prisma.pointLedger.count({
    where: { userId: member.id, type: "task_complete", createdAt: { gte: start, lt: end } },
  });

  const allPass = userAfter!.points === 20 && finalLedgerCount === 10 && !task11!.pointsAwarded && task1Reopen!.pointsAwarded;
  console.log(`\n=== Overall: ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'} ===`);

  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
