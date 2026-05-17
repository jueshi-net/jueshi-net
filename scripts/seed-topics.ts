// scripts/seed-topics.ts
// Seed the topics CMS with the overseas-essential-apps data
// Idempotent: safe to run multiple times

import { config } from "dotenv";
import { resolve } from "path";

// Load env
config({ path: resolve(process.cwd(), ".env.production") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding topics CMS...");

  // Import apps data
  const { apps } = await import("../src/lib/topics/overseas-essential-apps");

  const topicSlug = "overseas-essential-apps";

  // Check if topic exists
  let topic = await prisma.topic.findUnique({
    where: { slug: topicSlug },
    include: { items: true },
  });

  if (topic) {
    console.log(`📝 Topic "${topicSlug}" already exists, updating...`);
    topic = await prisma.topic.update({
      where: { slug: topicSlug },
      data: {
        title: "出海之后必装 APP 评级推荐",
        subtitle: "S/A/B/C/D 评级，18 个海外生活必备 APP",
        summary: "刚出国不知道装什么？这 18 个 APP 帮你从通讯、社交、学习到工作全覆盖。每个 APP 都有国内类比和避坑提醒，少走弯路。",
        status: "published",
        templateType: "rating_list",
        coverEmoji: "📱",
        heroBadges: [
          { label: "18 个 APP", color: "blue" },
          { label: "S/A/B/C/D 评级", color: "amber" },
          { label: "避坑提醒", color: "red" },
        ],
        suitableFor: ["出海新人", "留学生", "海外华人", "跨境从业者"],
        tags: ["18 个 APP", "避坑提醒", "国内类比"],
        seoTitle: "出海之后必装 APP 评级推荐 — 海外百宝箱",
        seoDescription: "S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。每个 APP 都有国内类比、避坑提醒、适合人群。给刚出海新人的实用指南。",
        publishedAt: new Date(),
      },
    });
  } else {
    console.log(`✨ Creating topic "${topicSlug}"...`);
    topic = await prisma.topic.create({
      data: {
        slug: topicSlug,
        title: "出海之后必装 APP 评级推荐",
        subtitle: "S/A/B/C/D 评级，18 个海外生活必备 APP",
        summary: "刚出国不知道装什么？这 18 个 APP 帮你从通讯、社交、学习到工作全覆盖。每个 APP 都有国内类比和避坑提醒，少走弯路。",
        status: "published",
        templateType: "rating_list",
        coverEmoji: "📱",
        heroBadges: [
          { label: "18 个 APP", color: "blue" },
          { label: "S/A/B/C/D 评级", color: "amber" },
          { label: "避坑提醒", color: "red" },
        ],
        suitableFor: ["出海新人", "留学生", "海外华人", "跨境从业者"],
        tags: ["18 个 APP", "避坑提醒", "国内类比"],
        seoTitle: "出海之后必装 APP 评级推荐 — 海外百宝箱",
        seoDescription: "S/A/B/C/D 评级，18 个海外生活必备 APP 推荐。每个 APP 都有国内类比、避坑提醒、适合人群。给刚出海新人的实用指南。",
        publishedAt: new Date(),
      },
    });
  }

  console.log(`📋 Topic ID: ${topic.id}`);

  // Delete existing items and re-seed
  await prisma.topicItem.deleteMany({
    where: { topicId: topic.id },
  });

  console.log(`📦 Seeding ${apps.length} APP items...`);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    await prisma.topicItem.create({
      data: {
        topicId: topic.id,
        name: app.name,
        alias: app.alias,
        rating: app.rating,
        category: app.category,
        iconText: app.iconText,
        iconBg: app.iconBg,
        iconFg: app.iconFg,
        installPriority: app.installPriority,
        description: app.description,
        analogy: app.analogy,
        suitableFor: app.suitableFor,
        beginnerAdvice: app.beginnerAdvice,
        riskTip: app.warning,
        officialUrl: app.domain,
        isBeginnerFriendly: app.beginnerRecommended,
        sortOrder: i,
      },
    });
  }

  console.log("✅ Topics CMS seed complete!");
  console.log(`   Topic: ${topic.slug} (${topic.status})`);
  console.log(`   Items: ${apps.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
