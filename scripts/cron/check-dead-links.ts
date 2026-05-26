// 生产环境死链自动巡检机制
// 用法: npx tsx scripts/cron/check-dead-links.ts [--prod] [--dry-run]
// 推荐: 每周执行一次 (crontab: 0 3 * * 0)

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import axios from "axios";
import fs from "fs";
import path from "path";

const FAIL_THRESHOLD = 3; // 连续失败次数阈值

function getDbUrl(): string {
  if (process.argv.includes("--prod")) {
    return (
      process.env.DATABASE_URL ||
      "postgresql://bxb_user:Bxb2024!Prod@Secure@127.0.0.1:5432/bxb_prod?schema=public"
    );
  }
  return (
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
  );
}

interface CheckResult {
  id: string;
  name: string;
  url: string;
  status: "OK" | "FAIL";
  httpStatus: number | null;
  error?: string;
  previousFailCount: number;
  newFailCount: number;
  action: "NONE" | "DEACTIVATE"; // 是否自动下架
}

async function checkUrl(
  url: string,
  timeoutMs = 8000
): Promise<{ httpStatus: number | null; error?: string }> {
  try {
    const resp = await axios.head(url, {
      timeout: timeoutMs,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JueshiBot/1.0; +https://jueshi.net)",
      },
    });
    return { httpStatus: resp.status };
  } catch (err: any) {
    return {
      httpStatus: err.response?.status || null,
      error: err.code || err.message,
    };
  }
}

async function main() {
  const isProd = process.argv.includes("--prod");
  const dryRun = process.argv.includes("--dry-run");
  const dbUrl = getDbUrl();

  console.log(`🔗 死链巡检启动`);
  console.log(`   数据库: ${isProd ? "生产库 (bxb_prod)" : "Neon 开发库"}`);
  console.log(`   模式: ${dryRun ? "DRY RUN (不写库)" : "LIVE (自动下架)"}`);
  console.log("");

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  // 查询所有活跃的资源
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    select: { id: true, name: true, url: true, checkFailCount: true },
    orderBy: { updatedAt: "asc" },
  });

  console.log(`📋 待检查: ${resources.length} 个活跃链接\n`);

  const results: CheckResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const check = await checkUrl(r.url);
    const isFail = check.httpStatus === null || check.httpStatus >= 400;

    const result: CheckResult = {
      id: r.id,
      name: r.name,
      url: r.url,
      status: isFail ? "FAIL" : "OK",
      httpStatus: check.httpStatus,
      error: check.error,
      previousFailCount: r.checkFailCount,
      newFailCount: isFail ? r.checkFailCount + 1 : 0,
      action: "NONE",
    };

    // 连续失败超过阈值 → 自动下架
    if (isFail && result.newFailCount >= FAIL_THRESHOLD) {
      result.action = "DEACTIVATE";
    }

    results.push(result);

    // 输出进度
    const icon = result.status === "OK" ? "✅" : "❌";
    const actionMark = result.action === "DEACTIVATE" ? " 🚫→下架" : "";
    const failInfo = isFail
      ? ` (连续失败 ${result.newFailCount}/${FAIL_THRESHOLD})`
      : "";
    console.log(
      `  [${i + 1}/${resources.length}] ${icon} ${r.name}: HTTP ${check.httpStatus || check.error}${failInfo}${actionMark}`
    );

    // 小延迟避免对目标服务器造成压力
    await new Promise((r) => setTimeout(r, 100));
  }

  // 执行下架操作
  const deactivated = results.filter((r) => r.action === "DEACTIVATE");

  if (deactivated.length > 0) {
    console.log(`\n🚨 发现 ${deactivated.length} 个死链，执行自动下架...\n`);

    for (const d of deactivated) {
      if (dryRun) {
        console.log(`  [DRY RUN] 将下架: ${d.name} (${d.url})`);
      } else {
        await prisma.resource.update({
          where: { id: d.id },
          data: {
            isActive: false,
            checkFailCount: d.newFailCount,
            lastChecked: new Date(),
          },
        });
        console.log(`  🚫 已下架: ${d.name} (${d.url})`);
      }
    }
  } else {
    console.log("\n✅ 无死链，所有链接正常");
  }

  // 更新成功链接的计数器
  const okLinks = results.filter((r) => r.status === "OK" && r.previousFailCount > 0);
  if (okLinks.length > 0 && !dryRun) {
    console.log(`\n🔄 重置 ${okLinks.length} 个已恢复链接的失败计数`);
    for (const o of okLinks) {
      await prisma.resource.update({
        where: { id: o.id },
        data: {
          checkFailCount: 0,
          lastChecked: new Date(),
        },
      });
    }
  }

  // 更新所有链接的最后检查时间
  if (!dryRun) {
    await prisma.resource.updateMany({
      where: { isActive: true },
      data: { lastChecked: new Date() },
    });
  }

  // 写入巡检报告
  const reportDir = path.join(__dirname, "../../logs");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    total: resources.length,
    ok: results.filter((r) => r.status === "OK").length,
    failed: results.filter((r) => r.status === "FAIL").length,
    deactivated: deactivated.length,
    dryRun,
    elapsed: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
    details: results.map((r) => ({
      name: r.name,
      url: r.url,
      status: r.status,
      httpStatus: r.httpStatus,
      error: r.error,
      failCount: r.newFailCount,
      action: r.action,
    })),
  };

  const reportPath = path.join(reportDir, `dead-link-check-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\n📄 巡检报告: ${reportPath}`);

  // 汇总
  console.log("\n" + "═".repeat(50));
  console.log("📊 巡检汇总");
  console.log("═".repeat(50));
  console.log(`✅ 正常: ${report.ok}`);
  console.log(`❌ 失败: ${report.failed}`);
  console.log(`🚫 下架: ${report.deactivated}`);
  console.log(`⏱️  耗时: ${report.elapsed}`);

  await prisma.$disconnect();

  // 如果有死链，返回非零退出码（方便 cron 通知）
  if (report.deactivated > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("死链巡检异常:", err);
  process.exit(1);
});
