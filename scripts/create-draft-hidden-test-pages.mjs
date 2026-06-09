import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create draft page
  const draft = await prisma.landingPage.upsert({
    where: { slug: "test-draft-20" },
    create: { slug: "test-draft-20", title: "Draft Test", pageType: "landing", status: "draft" },
    update: { status: "draft" },
  });

  // Create hidden page
  const hidden = await prisma.landingPage.upsert({
    where: { slug: "test-hidden-20" },
    create: { slug: "test-hidden-20", title: "Hidden Test", pageType: "landing", status: "hidden" },
    update: { status: "hidden" },
  });

  console.log("Draft:", draft.slug, "status:", draft.status);
  console.log("Hidden:", hidden.slug, "status:", hidden.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
