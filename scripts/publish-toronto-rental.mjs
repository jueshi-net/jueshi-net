import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config';
import { readFileSync } from 'fs';

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const slug = "toronto-rental-viewing-checklist";
const draftFile = process.argv[2];

(async () => {
  try {
    const current = await p.landingPage.findUnique({ where: { slug } });
    if (!current) {
      console.error("NOT FOUND in DB:", slug);
      process.exit(1);
    }
    console.log("Current DB state:");
    console.log("  status:", current.status);
    console.log("  pageType:", current.pageType);
    console.log("  publishedAt:", current.publishedAt);

    if (draftFile) {
      const data = JSON.parse(readFileSync(draftFile, 'utf-8'));
      console.log("\n📝 Syncing content from draft file...");
      
      await p.landingPage.update({
        where: { slug },
        data: {
          title: data.title,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          pageType: "checklist",
          heroSection: JSON.parse(JSON.stringify(data.heroSection)),
          faqItems: JSON.parse(JSON.stringify(data.faqItems || [])),
          officialLinks: JSON.parse(JSON.stringify(data.officialLinks || [])),
          ctaConfig: JSON.parse(JSON.stringify(data.ctaConfig || { text: "开始使用工具", url: "/tools" })),
          relatedTools: data.relatedTools || [],
          relatedTopics: data.relatedTopics || [],
          relatedArticles: data.relatedArticles || [],
        }
      });
      console.log("✅ Content synced from draft file");
    }

    const now = new Date();
    await p.landingPage.update({
      where: { slug },
      data: {
        status: "published",
        publishedAt: now,
      }
    });

    const updated = await p.landingPage.findUnique({ where: { slug } });
    console.log("\nFinal DB state:");
    console.log("  status:", updated.status);
    console.log("  publishedAt:", updated.publishedAt.toISOString());
    console.log("  relatedTools:", updated.relatedTools);
    console.log("  officialLinks:", JSON.stringify(updated.officialLinks));
    
    await p.$disconnect();
    console.log("\n✅ Publish complete");
  } catch (err) {
    console.error("ERROR:", err.message);
    await p.$disconnect();
    process.exit(1);
  }
})()
