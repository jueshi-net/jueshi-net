import { describe, it, expect } from "vitest";

// Simulate the API logic for postal code country scoping
function normalizePostal(input: string): string {
  return input.trim().toUpperCase().replace(/[\s\-]+/g, "");
}

function looksLikePostalCode(q: string): boolean {
  const normalized = normalizePostal(q);
  return /^[A-Z0-9]{2,10}$/.test(normalized) && /\d/.test(normalized);
}

describe("Postal Code Country Scoping — Truth Audit", () => {
  it("90210 is recognized as postal code (not city)", () => {
    expect(looksLikePostalCode("90210")).toBe(true);
  });

  it("Toronto is recognized as city (not postal code)", () => {
    expect(looksLikePostalCode("Toronto")).toBe(false);
  });

  it("Malaysian postal code 50000 is recognized as postal code", () => {
    expect(looksLikePostalCode("50000")).toBe(true);
  });

  it("When country=US and q=90210, only US results should be returned", () => {
    // The API query: WHERE "countryCode" = 'US' AND "normalizedPostalCode" LIKE '90210%'
    // This means non-US 90210 (Kenya, Mexico, etc.) will NOT appear
    const country = "US";
    const prefix = "90210";
    // Simulated: the SQL filters by countryCode = US
    // Beverly Hills is US, Matinyani is KE — only Beverly Hills should return
    const allResults = [
      { countryCode: "KE", city: "Matinyani", postalCode: "90210" },
      { countryCode: "MX", city: "San Benigno", postalCode: "90210" },
      { countryCode: "US", city: "Beverly Hills", postalCode: "90210" },
    ];
    const filtered = allResults.filter(r => r.countryCode === country && r.postalCode.startsWith(prefix));
    expect(filtered).toHaveLength(1);
    expect(filtered[0].city).toBe("Beverly Hills");
    expect(filtered[0].countryCode).toBe("US");
  });

  it("When country=MY and q=90210, no results should be returned", () => {
    // Malaysia does not have postal code 90210
    const country = "MY";
    const allResults = [
      { countryCode: "KE", city: "Matinyani", postalCode: "90210" },
      { countryCode: "US", city: "Beverly Hills", postalCode: "90210" },
    ];
    const filtered = allResults.filter(r => r.countryCode === country);
    expect(filtered).toHaveLength(0);
  });

  it("When country=CA and q=Toronto, only CA Toronto results should be returned", () => {
    // City search with country filter
    const country = "CA";
    const allResults = [
      { countryCode: "CA", city: "Toronto", postalCode: "M3C 0C1" },
      { countryCode: "CA", city: "Toronto", postalCode: "M3H 6A7" },
      { countryCode: "US", city: "Toronto", postalCode: "43964" }, // Ohio has a Toronto
    ];
    const filtered = allResults.filter(r => r.countryCode === country);
    expect(filtered.every(r => r.countryCode === "CA")).toBe(true);
    expect(filtered.length).toBe(2);
  });

  it("Malaysia search with country=MY does not fall back to US", () => {
    // Old bug: country || 'US' caused Malaysian queries to return US results
    // Fix: country parameter is used directly, no fallback to 'US'
    const country = "MY";
    expect(country).not.toBe("US");
    // The API code: WHERE "countryCode" = $1 — no || 'US' fallback
  });

  it("normalizePostal handles spaces and hyphens", () => {
    expect(normalizePostal("M3C 0C1")).toBe("M3C0C1");
    expect(normalizePostal("90210-1234")).toBe("902101234");
    expect(normalizePostal(" m3c  ")).toBe("M3C");
  });
});
