import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Postal Code P0 — Country Switch Clears Results", () => {
  const filePath = path.join(process.cwd(), "src/app/(public)/tools/postal-code/postal-code-client.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  it("selectCountry clears dbResults", () => {
    // The selectCountry function should clear dbResults
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    expect(selectCountryMatch).toBeTruthy();
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setDbResults([])");
  });

  it("selectCountry clears dbQuery", () => {
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setDbQuery('')");
  });

  it("selectCountry clears advancedCityResults", () => {
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setAdvancedCityResults([])");
  });

  it("selectCountry clears advancedRegionResults", () => {
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setAdvancedRegionResults([])");
  });

  it("selectCountry clears noMatchForCountry", () => {
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setNoMatchForCountry(false)");
  });

  it("selectCountry clears mainSearch", () => {
    const selectCountryMatch = content.match(/const selectCountry = useCallback[\s\S]*?\}, \[/);
    const fnBody = selectCountryMatch![0];
    expect(fnBody).toContain("setMainSearch('')");
  });
});

describe("Postal Code P0 — Country Scoping Truth", () => {
  it("API route uses country parameter directly (no fallback to US)", () => {
    const apiPath = path.join(process.cwd(), "src/app/api/postal-codes/search/route.ts");
    let c = "";
    if (fs.existsSync(apiPath)) {
      c = fs.readFileSync(apiPath, "utf-8");
    } else {
      const altPath = path.join(process.cwd(), "src/app/api/postal-codes/route.ts");
      if (fs.existsSync(altPath)) {
        c = fs.readFileSync(altPath, "utf-8");
      }
    }
    // Remove comments before checking
    const codeOnly = c.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(codeOnly).not.toContain("|| 'US'");
    expect(codeOnly).not.toContain('|| "US"');
  });

  it("no '全球' misleading text in postal code client", () => {
    const filePath = path.join(process.cwd(), "src/app/(public)/tools/postal-code/postal-code-client.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    // Should not have "全球 50+ 国家" misleading text
    expect(content).not.toContain("全球 50+ 国家");
    expect(content).not.toContain("全球50+国家");
  });
});
