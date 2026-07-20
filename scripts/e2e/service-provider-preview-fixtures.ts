/**
 * E2E Fixture Script for Service Provider Preview.
 *
 * Idempotent: running multiple times does NOT create duplicates.
 * All data uses E2E_SERVICE_PROVIDER_ prefix for identification.
 *
 * Usage:
 *   npx tsx scripts/e2e/service-provider-preview-fixtures.ts
 *   npx tsx scripts/e2e/service-provider-preview-fixtures.ts --cleanup
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });
const PREFIX = "E2E_SERVICE_PROVIDER_";

async function main() {
  const cleanup = process.argv.includes("--cleanup");

  if (cleanup) {
    console.log("=== Cleaning up E2E data ===");
    // Delete in dependency order
    await prisma.providerInquiry.deleteMany({ where: { message: { startsWith: PREFIX } } });
    await prisma.providerReport.deleteMany({ where: { reason: { startsWith: PREFIX } } });
    await prisma.providerFavorite.deleteMany({ where: { provider: { displayName: { startsWith: PREFIX } } } });
    await prisma.providerVerification.deleteMany({ where: { provider: { displayName: { startsWith: PREFIX } } } });
    await prisma.providerService.deleteMany({ where: { title: { startsWith: PREFIX } } });
    await prisma.providerMember.deleteMany({ where: { provider: { displayName: { startsWith: PREFIX } } } });
    await prisma.serviceProvider.deleteMany({ where: { displayName: { startsWith: PREFIX } } });
    await prisma.serviceCategory.deleteMany({ where: { name: { startsWith: PREFIX } } });
    console.log("Cleanup complete.");
    return;
  }

  console.log("=== Creating E2E fixtures ===");

  // 1. Find or create a test user (owner)
  let owner = await prisma.user.findFirst({ where: { email: "e2e-sp-owner@test.jueshi.net" } });
  if (!owner) {
    owner = await prisma.user.create({
      data: { email: "e2e-sp-owner@test.jueshi.net", name: "E2E SP Owner", role: "user" },
    });
    console.log("Created owner user:", owner.id);
  }

  // 2. Find or create editor member user
  let editor = await prisma.user.findFirst({ where: { email: "e2e-sp-editor@test.jueshi.net" } });
  if (!editor) {
    editor = await prisma.user.create({
      data: { email: "e2e-sp-editor@test.jueshi.net", name: "E2E SP Editor", role: "user" },
    });
    console.log("Created editor user:", editor.id);
  }

  // 3. Create 3 service categories (idempotent)
  const categories = [];
  for (const cat of [
    { name: PREFIX + "国际物流", slug: "e2e-logistics" },
    { name: PREFIX + "报关清关", slug: "e2e-customs" },
    { name: PREFIX + "跨境电商", slug: "e2e-ecommerce" },
  ]) {
    let c = await prisma.serviceCategory.findUnique({ where: { slug: cat.slug } });
    if (!c) {
      c = await prisma.serviceCategory.create({ data: cat });
      console.log("Created category:", c.name);
    }
    categories.push(c);
  }

  // 4. Create 1 organization provider (idempotent by slug)
  let orgProvider = await prisma.serviceProvider.findUnique({ where: { slug: "e2e-org-provider" } });
  if (!orgProvider) {
    orgProvider = await prisma.serviceProvider.create({
      data: {
        ownerUserId: owner.id,
        providerType: "organization",
        displayName: PREFIX + "测试物流公司",
        slug: "e2e-org-provider",
        description: "E2E test organization provider",
        languages: ["zh", "en"],
        countries: ["CN", "US"],
        cities: ["Shenzhen", "Los Angeles"],
        status: "approved",
        verificationStatus: "verified",
        claimedAt: new Date(),
        approvedAt: new Date(),
      },
    });
    console.log("Created organization provider:", orgProvider.id);

    // Add owner as OWNER member
    await prisma.providerMember.create({
      data: { providerId: orgProvider.id, userId: owner.id, role: "OWNER", status: "active", acceptedAt: new Date() },
    });

    // Add editor as EDITOR member
    await prisma.providerMember.create({
      data: { providerId: orgProvider.id, userId: editor.id, role: "EDITOR", status: "active", acceptedAt: new Date() },
    });
  }

  // 5. Create 1 professional provider (idempotent by slug)
  let proProvider = await prisma.serviceProvider.findUnique({ where: { slug: "e2e-pro-provider" } });
  if (!proProvider) {
    proProvider = await prisma.serviceProvider.create({
      data: {
        ownerUserId: owner.id,
        providerType: "professional",
        displayName: PREFIX + "测试专业顾问",
        slug: "e2e-pro-provider",
        description: "E2E test professional provider",
        languages: ["zh", "en"],
        status: "approved",
        verificationStatus: "verified",
        claimedAt: new Date(),
        approvedAt: new Date(),
      },
    });
    console.log("Created professional provider:", proProvider.id);
  }

  // 6. Create 3 service items for org provider (idempotent by slug)
  for (let i = 0; i < 3; i++) {
    const slug = `e2e-service-${i + 1}`;
    let service = await prisma.providerService.findUnique({ where: { slug } });
    if (!service) {
      service = await prisma.providerService.create({
        data: {
          providerId: orgProvider.id,
          categoryId: categories[i % categories.length].id,
          title: PREFIX + `测试服务${i + 1}`,
          slug,
          summary: `E2E test service ${i + 1}`,
          priceMode: "quote",
          currency: "USD",
          status: "published",
          publishedAt: new Date(),
        },
      });
      console.log("Created service:", service.id);
    }
  }

  // 7. Create 1 inquiry (idempotent by message prefix)
  const existingInquiry = await prisma.providerInquiry.findFirst({
    where: { providerId: orgProvider.id, message: { startsWith: PREFIX + "测试咨询" } },
  });
  if (!existingInquiry) {
    await prisma.providerInquiry.create({
      data: {
        requesterUserId: editor.id,
        providerId: orgProvider.id,
        serviceId: null,
        sourceType: "direct",
        message: PREFIX + "测试咨询 - 这是一条E2E测试咨询",
        status: "new",
      },
    });
    console.log("Created inquiry");
  }

  // 8. Create 1 pending verification (idempotent)
  const existingVerif = await prisma.providerVerification.findFirst({
    where: { providerId: orgProvider.id, type: "business" },
  });
  if (!existingVerif) {
    await prisma.providerVerification.create({
      data: {
        providerId: orgProvider.id,
        type: "business",
        status: "pending",
      },
    });
    console.log("Created pending verification");
  }

  console.log("\n=== E2E fixtures complete ===");
  console.log("Summary:");
  console.log("  Users: 2 (owner + editor)");
  console.log("  Categories: 3");
  console.log("  Providers: 2 (1 org + 1 professional)");
  console.log("  Services: 3");
  console.log("  Members: 2 (1 OWNER + 1 EDITOR)");
  console.log("  Inquiries: 1");
  console.log("  Verifications: 1 (pending)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
