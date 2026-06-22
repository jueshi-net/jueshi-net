import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const coverageLib = fs.readFileSync(
  path.join(process.cwd(), "src/lib/postal-code-coverage-status.ts"),
  "utf-8"
);

describe("Postal Code Coverage — Data Audit", () => {
  it("Canada has full coverage", () => {
    expect(coverageLib).toContain("CA: { code: 'CA', status: 'full'");
    expect(coverageLib).toMatch(/CA.*901432/);
  });

  it("US has full coverage", () => {
    expect(coverageLib).toContain("US: { code: 'US', status: 'full'");
    expect(coverageLib).toMatch(/US.*41488/);
  });

  it("GB has full coverage (largest dataset)", () => {
    expect(coverageLib).toContain("GB: { code: 'GB', status: 'full'");
    expect(coverageLib).toMatch(/GB.*1820770/);
  });

  it("Malaysia has full coverage", () => {
    expect(coverageLib).toContain("MY: { code: 'MY', status: 'full'");
    expect(coverageLib).toMatch(/MY.*2757/);
  });

  it("Singapore has full coverage", () => {
    expect(coverageLib).toContain("SG: { code: 'SG', status: 'full'");
    expect(coverageLib).toMatch(/SG.*121135/);
  });

  it("Japan has full coverage", () => {
    expect(coverageLib).toContain("JP: { code: 'JP', status: 'full'");
    expect(coverageLib).toMatch(/JP.*142577/);
  });

  it("Australia has full coverage", () => {
    expect(coverageLib).toContain("AU: { code: 'AU', status: 'full'");
    expect(coverageLib).toMatch(/AU.*3171/);
  });

  it("New Zealand has full coverage", () => {
    expect(coverageLib).toContain("NZ: { code: 'NZ', status: 'full'");
    expect(coverageLib).toMatch(/NZ.*1737/);
  });

  it("Coverage icon returns correct emoji", () => {
    expect(coverageLib).toContain("case 'full': return '🟢'");
    expect(coverageLib).toContain("case 'partial': return '🟡'");
    expect(coverageLib).toContain("case 'none': return '⚫'");
  });

  it("Coverage label returns correct Chinese text", () => {
    expect(coverageLib).toContain("case 'full': return '已覆盖'");
    expect(coverageLib).toContain("case 'partial': return '部分覆盖'");
    expect(coverageLib).toContain("case 'none': return '暂未覆盖'");
  });

  it("Vietnam has no data", () => {
    expect(coverageLib).toContain("VN: { code: 'VN', status: 'none'");
  });

  it("Hong Kong has special status", () => {
    expect(coverageLib).toContain("HK: { code: 'HK', status: 'special'");
    expect(coverageLib).toContain("Hong Kong does not use postal codes");
  });
});
