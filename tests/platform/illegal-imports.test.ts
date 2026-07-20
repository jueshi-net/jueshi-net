import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import * as path from "path";

/**
 * Module dependency boundary tests.
 *
 * Verifies the dependency red lines from the spec:
 *   - platform/ does NOT import from any business module (src/modules/*)
 *   - No file outside service-provider/public imports from
 *     service-provider/domain, /infrastructure, /internal
 *   - service-provider module only imports from platform + public UI
 */

const ROOT = process.cwd();

function grepInSrc(pattern: string, opts: string[] = []): string[] {
  try {
    const cmd = `grep -rn "${pattern}" src/ --include="*.ts" --include="*.tsx" ${opts.join(" ")}`;
    const out = execSync(cmd, { cwd: ROOT, encoding: "utf-8", stdio: "pipe" });
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return []; // grep returns non-zero when no matches
  }
}

describe("Module Dependency Boundaries", () => {
  describe("platform kernel has no business-module imports", () => {
    it("src/platform/ does not import from src/modules/", () => {
      const hits = grepInSrc("from ['\"]@/modules/", [], ).filter((l) =>
        l.startsWith("src/platform/")
      );
      expect(hits).toEqual([]);
    });

    it("src/platform/ does not import from src/lib/community/", () => {
      const hits = grepInSrc("from ['\"]@/lib/community/").filter((l) =>
        l.startsWith("src/platform/")
      );
      expect(hits).toEqual([]);
    });
  });

  describe("service-provider internal directories are encapsulated", () => {
    it("no file outside service-provider/public imports from service-provider/domain", () => {
      const hits = grepInSrc(
        "from ['\"]@/modules/service-provider/domain"
      ).filter((l) => !l.includes("service-provider/public/"));
      expect(hits).toEqual([]);
    });

    it("no file outside service-provider/public imports from service-provider/infrastructure", () => {
      const hits = grepInSrc(
        "from ['\"]@/modules/service-provider/infrastructure"
      ).filter((l) => !l.includes("service-provider/public/"));
      expect(hits).toEqual([]);
    });

    it("no file outside service-provider/public imports from service-provider/internal", () => {
      const hits = grepInSrc(
        "from ['\"]@/modules/service-provider/internal"
      ).filter((l) => !l.includes("service-provider/public/"));
      expect(hits).toEqual([]);
    });

    it("no file outside service-provider imports from service-provider/application", () => {
      const hits = grepInSrc(
        "from ['\"]@/modules/service-provider/application"
      ).filter((l) => !l.includes("service-provider/public/"));
      expect(hits).toEqual([]);
    });
  });

  describe("service-provider module only depends on platform + design-system", () => {
    it("service-provider does NOT import from community module", () => {
      const hits = grepInSrc("from ['\"]@/lib/community/").filter((l) =>
        l.startsWith("src/modules/service-provider/")
      );
      expect(hits).toEqual([]);
    });

    it("service-provider does NOT import from workspace internals", () => {
      const hits = grepInSrc("from ['\"]@/components/workspace/").filter((l) =>
        l.startsWith("src/modules/service-provider/")
      );
      expect(hits).toEqual([]);
    });
  });

  describe("platform kernel files exist", () => {
    it("module registry exists", () => {
      const hits = grepInSrc("export function defineModule");
      expect(hits.some((l) => l.startsWith("src/platform/modules/"))).toBe(true);
    });

    it("feature flags exist", () => {
      const hits = grepInSrc("export function isFeatureEnabled");
      expect(hits.some((l) => l.startsWith("src/platform/feature-flags/"))).toBe(true);
    });

    it("capability API exists", () => {
      const hits = grepInSrc("export function can\\b");
      expect(hits.some((l) => l.startsWith("src/platform/permissions/"))).toBe(true);
    });

    it("block registry exists", () => {
      const hits = grepInSrc("export function registerBlock");
      expect(hits.some((l) => l.startsWith("src/platform/blocks/"))).toBe(true);
    });

    it("action registry exists", () => {
      const hits = grepInSrc("function executeAction");
      expect(hits.some((l) => l.startsWith("src/platform/actions/"))).toBe(true);
    });

    it("event contract exists", () => {
      const hits = grepInSrc("export function publishEvent");
      expect(hits.some((l) => l.startsWith("src/platform/events/"))).toBe(true);
    });
  });
});
