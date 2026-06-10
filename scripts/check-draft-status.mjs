import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import 'dotenv/config';

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const p = new PrismaClient({ adapter });

(async () => {
  const drafts = await p.landingPage.findMany({
    where: { slug: { contains: "checklist" } },
    select: { slug: true, status: true, requiresHumanReview: true, officialLinks: true, relatedTools: true }
  });
  for (const d of drafts) {
    console.log("---");
    console.log("slug:", d.slug);
    console.log("status:", d.status);
    console.log("requiresHumanReview:", d.requiresHumanReview);
    const links = d.officialLinks || [];
    const needsReviewCount = links.filter(l => l.needsReview !== false).length;
    console.log("officialLinks needsReview>0:", needsReviewCount, "/", links.length);
    console.log("relatedTools:", d.relatedTools ? d.relatedTools.length : 0);
    // Check if invoice is in relatedTools
    const hasInvoice = (d.relatedTools || []).some(t => t.includes("invoice") && !t.includes("commercial-invoice"));
    if (hasInvoice) console.log("  WARNING: legacy /tools/invoice still in relatedTools");
  }
  await p.$disconnect();
})()
