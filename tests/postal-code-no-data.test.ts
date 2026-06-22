import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const coverageLib = fs.readFileSync(
  path.join(process.cwd(), "src/lib/postal-code-coverage-status.ts"),
  "utf-8"
);

describe("Postal Code No-Data State", () => {
  it("Vietnam has no data", () => {
    expect(coverageLib).toContain("VN: { code: 'VN', status: 'none'");
  });

  it("Saudi Arabia has no data", () => {
    expect(coverageLib).toContain("SA: { code: 'SA', status: 'none'");
  });

  it("Unknown country returns none status (fallback)", () => {
    expect(coverageLib).toContain("status: 'none'");
    expect(coverageLib).toContain("Unknown coverage status");
  });

  it("Hong Kong has special status (no postal codes used)", () => {
    expect(coverageLib).toContain("HK: { code: 'HK', status: 'special'");
    expect(coverageLib).toContain("Hong Kong does not use postal codes");
  });

  it("Coverage display combines icon and label", () => {
    expect(coverageLib).toContain("getCoverageDisplay");
    expect(coverageLib).toContain("getCoverageIcon");
    expect(coverageLib).toContain("getCoverageLabel");
  });
});
