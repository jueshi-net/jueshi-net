/**
 * Runtime Closure Fixture Setup
 *
 * Creates all 7 isolated test accounts with proper provider memberships
 * and test providers in various states for admin testing.
 *
 * All accounts use E2E_SERVICE_PROVIDER_ prefix.
 * Password is NOT output in reports.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/runtime-closure-fixtures.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const TEST_PASSWORD = "E2E_TestPass_2026!";
const PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);

const PREFIX = "E2E_SERVICE_PROVIDER_";

async function main() {
  console.log("=== Runtime Closure Fixture Setup ===\n");

  // ─── 1. Create/Update Users ───
  const userSpecs = [
    { email: "e2e-sp-owner@test.jueshi.net", name: PREFIX + "Owner", role: "user" },
    { email: "e2e-sp-admin@test.jueshi.net", name: PREFIX + "Admin", role: "user" },
    { email: "e2e-sp-editor@test.jueshi.net", name: PREFIX + "Editor", role: "user" },
    { email: "e2e-sp-viewer@test.jueshi.net", name: PREFIX + "Viewer", role: "user" },
    { email: "e2e-sp-platform-admin@test.jueshi.net", name: PREFIX + "PlatformAdmin", role: "admin" },
    { email: "e2e-sp-ordinary@test.jueshi.net", name: PREFIX + "Ordinary", role: "user" },
    { email: "e2e-sp-unrelated@test.jueshi.net", name: PREFIX + "Unrelated", role: "user" },
  ];

  const users = {};
  for (const spec of userSpecs) {
    let user = await prisma.user.findUnique({ where: { email: spec.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: spec.email, name: spec.name, role: spec.role, password: PASSWORD_HASH },
      });
      console.log(`Created user: ${spec.email} (${spec.role})`);
    } else {
      // Update password and role to ensure consistency
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: spec.name, role: spec.role, password: PASSWORD_HASH },
      });
      console.log(`Updated user: ${spec.email} (${spec.role})`);
    }
    users[spec.email] = user;
  }

  // ─── 2. Ensure Main Provider (e2e-org-provider) ───
  let mainProvider = await prisma.serviceProvider.findUnique({ where: { slug: "e2e-org-provider" } });
  if (!mainProvider) {
    mainProvider = await prisma.serviceProvider.create({
      data: {
        ownerUserId: users["e2e-sp-owner@test.jueshi.net"].id,
        providerType: "organization",
        displayName: PREFIX + "测试物流公司",
        slug: "e2e-org-provider",
        description: "E2E test organization provider",
        status: "approved",
        verificationStatus: "verified",
        languages: ["zh", "en"],
        countries: ["CN", "US"],
        cities: ["Shenzhen", "Los Angeles"],
        contactPreference: "service_request",
      },
    });
    console.log("Created main provider: e2e-org-provider");
  } else {
    mainProvider = await prisma.serviceProvider.update({
      where: { id: mainProvider.id },
      data: { status: "approved", verificationStatus: "verified" },
    });
    console.log("Updated main provider: e2e-org-provider -> approved");
  }

  // ─── 3. Set up memberships for main provider ───
  const membershipSpecs = [
    { email: "e2e-sp-owner@test.jueshi.net", role: "OWNER" },
    { email: "e2e-sp-admin@test.jueshi.net", role: "ADMIN" },
    { email: "e2e-sp-editor@test.jueshi.net", role: "EDITOR" },
    { email: "e2e-sp-viewer@test.jueshi.net", role: "VIEWER" },
  ];

  for (const spec of membershipSpecs) {
    const userId = users[spec.email].id;
    let member = await prisma.providerMember.findUnique({
      where: { providerId_userId: { providerId: mainProvider.id, userId } },
    });
    if (!member) {
      member = await prisma.providerMember.create({
        data: { providerId: mainProvider.id, userId, role: spec.role, status: "active" },
      });
      console.log(`  Added member: ${spec.email} -> ${spec.role}`);
    } else {
      member = await prisma.providerMember.update({
        where: { id: member.id },
        data: { role: spec.role, status: "active" },
      });
      console.log(`  Updated member: ${spec.email} -> ${spec.role}`);
    }
  }

  // ─── 4. Create unrelated provider ───
  let unrelatedProvider = await prisma.serviceProvider.findUnique({ where: { slug: "e2e-unrelated-provider" } });
  if (!unrelatedProvider) {
    unrelatedProvider = await prisma.serviceProvider.create({
      data: {
        ownerUserId: users["e2e-sp-unrelated@test.jueshi.net"].id,
        providerType: "organization",
        displayName: PREFIX + "测试无关公司",
        slug: "e2e-unrelated-provider",
        description: "E2E unrelated provider for cross-provider testing",
        status: "approved",
        verificationStatus: "verified",
        languages: ["zh"],
        countries: ["CN"],
        cities: ["Beijing"],
        contactPreference: "service_request",
      },
    });
    console.log("Created unrelated provider: e2e-unrelated-provider");
  }

  // ─── 5. Create test providers in various states for admin testing ───
  const testProviders = [
    { slug: "e2e-pending-approve", name: PREFIX + "待批准", status: "pending_review" },
    { slug: "e2e-pending-reject", name: PREFIX + "待驳回", status: "pending_review" },
    { slug: "e2e-approved-suspend", name: PREFIX + "待暂停", status: "approved" },
  ];

  for (const spec of testProviders) {
    let provider = await prisma.serviceProvider.findUnique({ where: { slug: spec.slug } });
    if (!provider) {
      provider = await prisma.serviceProvider.create({
        data: {
          ownerUserId: users["e2e-sp-owner@test.jueshi.net"].id,
          providerType: "organization",
          displayName: spec.name,
          slug: spec.slug,
          description: "E2E test provider for admin operations",
          status: spec.status,
          verificationStatus: spec.status === "approved" ? "verified" : "pending",
          languages: ["zh"],
          countries: ["CN"],
          cities: ["Shanghai"],
          contactPreference: "service_request",
        },
      });
      console.log(`Created test provider: ${spec.slug} (${spec.status})`);
    } else {
      provider = await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: { status: spec.status, verificationStatus: spec.status === "approved" ? "verified" : "pending", rejectionReason: null },
      });
      console.log(`Reset test provider: ${spec.slug} -> ${spec.status}`);
    }
  }

  // ─── 6. Ensure services exist ───
  const existingServices = await prisma.providerService.findMany({
    where: { providerId: mainProvider.id },
  });
  if (existingServices.length === 0) {
    const categories = await prisma.serviceCategory.findMany();
    for (let i = 0; i < 3 && i < categories.length; i++) {
      await prisma.providerService.create({
        data: {
          providerId: mainProvider.id,
          categoryId: categories[i].id,
          title: PREFIX + `测试服务${i + 1}`,
          slug: `e2e-service-${i + 1}`,
          summary: `E2E test service ${i + 1}`,
          description: `E2E test service ${i + 1} description`,
          status: "published",
          priceMode: "quote",
          deliveryMode: "online",
          languages: ["zh", "en"],
          serviceCountries: ["CN", "US"],
          serviceCities: ["Shenzhen"],
        },
      });
    }
    console.log("Created 3 services for main provider");
  } else {
    console.log(`Main provider already has ${existingServices.length} services`);
  }

  // ─── Summary ───
  console.log("\n=== Fixture Summary ===");
  console.log("Users created/updated: " + userSpecs.length);
  console.log("Main provider: " + mainProvider.slug + " (approved)");
  console.log("Unrelated provider: " + unrelatedProvider.slug + " (approved)");
  console.log("Test providers: " + testProviders.map(t => t.slug + "(" + t.status + ")").join(", "));
  console.log("\nAll accounts use password: [HIDDEN - not output in report]");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
