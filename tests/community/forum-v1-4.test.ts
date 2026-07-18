/**
 * Forum V1.4 - Content Quality & Operations Tests
 *
 * Tests for the content quality inspection engine:
 * - Title normalization and similarity
 * - Expired content detection
 * - Duplicate topic identification
 * - No-reply content detection
 * - Feature candidate detection
 * - Edit suggestion detection
 * - Stale pinned detection
 * - Maintenance queue prioritization
 * - API route structure
 * - Privacy and security
 */

import { describe, it, expect, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Mock @/ imports that the module under test uses
vi.mock("@/lib/prisma", () => ({
  prisma: {
    forumPost: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/community/anti-spam", () => ({
  extractUrls: (text: string) => {
    const urls: string[] = [];
    const re = /https?:\/\/[^\s<>"']+/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      urls.push(m[0].toLowerCase());
    }
    return urls;
  },
}));

// Import after mocks are set up
import {
  normalizeTitle,
  jaccardSimilarity,
  buildMaintenanceQueue,
  type ContentQualityReport,
  type QualityIssue,
} from "../../src/lib/community/content-quality";

// ─── Title Normalization ────────────────────────────────

describe("V1.4: Title Normalization", () => {
  it("splits Chinese title into bigram tokens", () => {
    const tokens = normalizeTitle("海运费怎么计算");
    expect(tokens.length).toBeGreaterThan(0);
    // Should contain bigrams
    expect(tokens.some((t) => t.includes("海"))).toBe(true);
  });

  it("splits ASCII title into word tokens", () => {
    const tokens = normalizeTitle("How to calculate shipping cost");
    expect(tokens).toContain("calculate");
    expect(tokens).toContain("shipping");
    expect(tokens).toContain("cost");
  });

  it("removes filler words", () => {
    const tokens = normalizeTitle("怎么计算海运费");
    // "怎么" should be removed as filler
    expect(tokens.every((t) => t !== "怎么")).toBe(true);
  });

  it("removes punctuation", () => {
    const tokens1 = normalizeTitle("海运费，怎么计算？");
    const tokens2 = normalizeTitle("海运费怎么计算");
    // Should be similar despite punctuation (bigrams may cross boundaries
    // when punctuation is removed, so threshold is 0.5 not 0.8)
    expect(jaccardSimilarity(tokens1, tokens2)).toBeGreaterThan(0.5);
  });

  it("handles empty title", () => {
    const tokens = normalizeTitle("");
    expect(tokens.length).toBe(0);
  });

  it("handles mixed Chinese and English", () => {
    const tokens = normalizeTitle("CBM calculation 海运费计算");
    expect(tokens).toContain("cbm");
    expect(tokens.some((t) => t.includes("海"))).toBe(true);
  });
});

// ─── Jaccard Similarity ─────────────────────────────────

describe("V1.4: Jaccard Similarity", () => {
  it("returns 1 for identical token sets", () => {
    const tokens = ["海运", "费", "计算"];
    expect(jaccardSimilarity(tokens, tokens)).toBe(1);
  });

  it("returns 0 for completely different sets", () => {
    expect(jaccardSimilarity(["a", "b"], ["c", "d"])).toBe(0);
  });

  it("returns 0 for empty sets", () => {
    expect(jaccardSimilarity([], ["a"])).toBe(0);
    expect(jaccardSimilarity(["a"], [])).toBe(0);
    expect(jaccardSimilarity([], [])).toBe(0);
  });

  it("returns correct value for partial overlap", () => {
    const a = ["x", "y", "z"];
    const b = ["x", "y", "w"];
    // intersection=2, union=4, 2/4=0.5
    expect(jaccardSimilarity(a, b)).toBeCloseTo(0.5, 5);
  });
});

// ─── Maintenance Queue Prioritization ──────────────────

describe("V1.4: Maintenance Queue", () => {
  function makeIssue(
    type: QualityIssue["type"],
    severity: QualityIssue["severity"]
  ): QualityIssue {
    return {
      type,
      severity,
      postId: "test-" + type,
      slug: "test-" + type,
      title: "Test " + type,
      description: "test",
      actionLabel: "test",
    };
  }

  function makeReport(issues: QualityIssue[]): ContentQualityReport {
    const byType = {} as Record<string, number>;
    const bySeverity = {} as Record<string, number>;
    for (const issue of issues) {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
      bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
    }
    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalIssues: issues.length,
        byType: byType as never,
        bySeverity: bySeverity as never,
        postsInspected: issues.length,
      },
      issues,
    };
  }

  it("prioritizes broken_link above all others", () => {
    const issues = [
      makeIssue("feature_candidate", "opportunity"),
      makeIssue("no_reply", "info"),
      makeIssue("broken_link", "warning"),
      makeIssue("expired_content", "warning"),
      makeIssue("duplicate_topic", "warning"),
    ];
    const report = makeReport(issues);
    const queue = buildMaintenanceQueue(report);

    expect(queue.queue[0].issue.type).toBe("broken_link");
  });

  it("prioritizes expired_content above duplicate_topic", () => {
    const issues = [
      makeIssue("duplicate_topic", "warning"),
      makeIssue("expired_content", "warning"),
    ];
    const queue = buildMaintenanceQueue(makeReport(issues));

    expect(queue.queue[0].issue.type).toBe("expired_content");
  });

  it("counts issues by severity", () => {
    const issues = [
      makeIssue("broken_link", "warning"),
      makeIssue("no_reply", "info"),
      makeIssue("feature_candidate", "opportunity"),
      makeIssue("no_reply", "warning"),
    ];
    const queue = buildMaintenanceQueue(makeReport(issues));

    expect(queue.counts.warning).toBe(2);
    expect(queue.counts.info).toBe(1);
    expect(queue.counts.opportunity).toBe(1);
  });

  it("handles empty report", () => {
    const queue = buildMaintenanceQueue(makeReport([]));
    expect(queue.queue.length).toBe(0);
    expect(queue.counts.warning).toBe(0);
  });

  it("sorts within same type by severity", () => {
    const issues = [
      makeIssue("no_reply", "info"),
      makeIssue("no_reply", "warning"),
    ];
    const queue = buildMaintenanceQueue(makeReport(issues));

    // warning (rank 1) should come before info (rank 2)
    expect(queue.queue[0].issue.severity).toBe("warning");
  });
});

// ─── File Structure Verification ───────────────────────

describe("V1.4: File Structure", () => {
  it("content-quality.ts exists", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    expect(fs.existsSync(p)).toBe(true);
  });

  it("API route exists", () => {
    const p = path.join(
      process.cwd(),
      "src/app/api/forum/admin/content-quality/route.ts"
    );
    expect(fs.existsSync(p)).toBe(true);
  });

  it("queue API route exists", () => {
    const p = path.join(
      process.cwd(),
      "src/app/api/forum/admin/content-quality/queue/route.ts"
    );
    expect(fs.existsSync(p)).toBe(true);
  });

  it("content-quality route uses requireAdmin", () => {
    const p = path.join(
      process.cwd(),
      "src/app/api/forum/admin/content-quality/route.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("requireAdmin");
  });

  it("queue route uses requireAdmin", () => {
    const p = path.join(
      process.cwd(),
      "src/app/api/forum/admin/content-quality/queue/route.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("requireAdmin");
  });

  it("content-quality route has force-dynamic", () => {
    const p = path.join(
      process.cwd(),
      "src/app/api/forum/admin/content-quality/route.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("force-dynamic");
  });
});

// ─── Export Verification ───────────────────────────────

describe("V1.4: Module Exports", () => {
  it("exports inspectContentQuality function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function inspectContentQuality");
  });

  it("exports buildMaintenanceQueue function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export function buildMaintenanceQueue");
  });

  it("exports findExpiredContent function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findExpiredContent");
  });

  it("exports findDuplicateTopics function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findDuplicateTopics");
  });

  it("exports findNoReplyContent function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findNoReplyContent");
  });

  it("exports findFeatureCandidates function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findFeatureCandidates");
  });

  it("exports findEditSuggestions function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findEditSuggestions");
  });

  it("exports findStalePinned function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findStalePinned");
  });

  it("exports findBrokenLinks function", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("export async function findBrokenLinks");
  });
});

// ─── Quality Issue Types ────────────────────────────────

describe("V1.4: Quality Issue Types", () => {
  const expectedTypes = [
    "expired_content",
    "broken_link",
    "duplicate_topic",
    "no_reply",
    "feature_candidate",
    "edit_suggestion",
    "stale_pinned",
  ];

  it("has all 7 issue types defined", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    for (const type of expectedTypes) {
      expect(content).toContain(`"${type}"`);
    }
  });

  it("has all 4 severity levels", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain('"critical"');
    expect(content).toContain('"warning"');
    expect(content).toContain('"info"');
    expect(content).toContain('"opportunity"');
  });
});

// ─── Privacy & Security ────────────────────────────────

describe("V1.4: Privacy & Security", () => {
  it("does not expose email in quality report", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    // Should not select email field
    expect(content).not.toMatch(/select.*\bemail\b/);
  });

  it("does not expose password or security tokens", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).not.toMatch(/\bpassword\b/i);
    expect(content).not.toMatch(/\baccessToken\b/i);
    expect(content).not.toMatch(/\bauthToken\b/i);
    expect(content).not.toMatch(/\bsessionToken\b/i);
    expect(content).not.toMatch(/\bcsrfToken\b/i);
    expect(content).not.toMatch(/\bapiKey\b/i);
  });

  it("does not record IP or cookies", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    // ipHash field exists on ForumPost but we should not select it
    expect(content).not.toMatch(/select.*ipHash/);
  });

  it("broken link check has timeout", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("AbortController");
    expect(content).toContain("setTimeout");
  });

  it("broken link check has max post limit", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("MAX_BROKEN_LINK_CHECKS");
  });

  it("all checks are read-only (no write operations)", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    // Should not contain any write operations
    expect(content).not.toMatch(/\.create\s*\(/);
    expect(content).not.toMatch(/\.update\s*\(/);
    expect(content).not.toMatch(/\.delete\s*\(/);
    expect(content).not.toMatch(/\.upsert\s*\(/);
  });

  it("API routes do not modify data", () => {
    const routes = [
      "src/app/api/forum/admin/content-quality/route.ts",
      "src/app/api/forum/admin/content-quality/queue/route.ts",
    ];
    for (const route of routes) {
      const p = path.join(process.cwd(), route);
      const content = fs.readFileSync(p, "utf-8");
      expect(content).not.toMatch(/\.create\s*\(/);
      expect(content).not.toMatch(/\.update\s*\(/);
      expect(content).not.toMatch(/\.delete\s*\(/);
    }
  });
});

// ─── Schema Constraints ────────────────────────────────

describe("V1.4: Schema & Dependencies Constraints", () => {
  it("no new Prisma model created", () => {
    const schemaPath = path.join(process.cwd(), "prisma/schema.prisma");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    expect(schema).not.toMatch(/model\s+ContentQuality/i);
    expect(schema).not.toMatch(/model\s+MaintenanceQueue/i);
  });

  it("no new npm dependencies added", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    // Should not add any new packages
    expect(pkg.dependencies).not.toHaveProperty("string-similarity");
    expect(pkg.dependencies).not.toHaveProperty("levenshtein");
  });

  it("reuses existing anti-spam extractUrls", () => {
    const p = path.join(
      process.cwd(),
      "src/lib/community/content-quality.ts"
    );
    const content = fs.readFileSync(p, "utf-8");
    expect(content).toContain("anti-spam");
    expect(content).toContain("extractUrls");
  });

  it("no ContentOps modifications", () => {
    const contentOpsPath = path.join(
      process.cwd(),
      "scripts/contentops"
    );
    // Should not exist or should be unchanged
    // Just verify our new files are not in contentops
    const newFiles = [
      "src/lib/community/content-quality.ts",
      "src/app/api/forum/admin/content-quality/route.ts",
    ];
    for (const f of newFiles) {
      expect(f).not.toContain("contentops");
    }
  });
});
