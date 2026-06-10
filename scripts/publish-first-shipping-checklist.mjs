import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config';
import { readFileSync } from 'fs';

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

const slug = "first-shipping-checklist";
const draftFile = process.argv[2];

(async () => {
  try {
    // Check current state
    const current = await p.landingPage.findUnique({ where: { slug } });
    if (!current) {
      console.error("NOT FOUND in DB:", slug);
      process.exit(1);
    }
    console.log("Current DB state:");
    console.log("  status:", current.status);
    console.log("  pageType:", current.pageType);
    console.log("  publishedAt:", current.publishedAt);
    console.log("  relatedTools:", current.relatedTools);
    
    // If draft file provided, sync content from it
    if (draftFile) {
      const data = JSON.parse(readFileSync(draftFile, 'utf-8'));
      console.log("\n📝 Syncing content from draft file...");
      
      const heroSectionStr = JSON.stringify(data.heroSection);
      const faqItemsStr = JSON.stringify(data.faqItems || []);
      const officialLinksStr = JSON.stringify(data.officialLinks || []);
      const ctaConfigStr = JSON.stringify(data.ctaConfig || { text: "开始使用工具", url: "/tools" });
      const relatedTools = data.relatedTools || [];
      const relatedTopics = data.relatedTopics || [];
      const relatedArticles = data.relatedArticles || [];
      
      await p.landingPage.update({
        where: { slug },
        data: {
          title: data.title,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          pageType: "checklist",
          heroSection: JSON.parse(heroSectionStr),
          faqItems: JSON.parse(faqItemsStr),
          officialLinks: JSON.parse(officialLinksStr),
          ctaConfig: JSON.parse(ctaConfigStr),
          relatedTools,
          relatedTopics,
          relatedArticles,
          status: "published",
          publishedAt: new Date(),
        }
      });
      
      console.log("✅ Content synced from draft file");
    }
    
    // Publish
    const now = new Date();
    await p.landingPage.update({
      where: { slug },
      data: {
        status: "published",
        publishedAt: now,
      }
    });
    
    // Verify
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
