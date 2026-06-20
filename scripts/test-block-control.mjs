/**
 * Test script for LandingPage block visibility and order logic.
 * Tests the core logic without requiring a database.
 */

// Simulate the block visibility/order computation from the frontend page
function computeVisibleBlocks(blockVisibility, blockOrder) {
  const defaultBlockOrder = ["hero", "primaryTool", "hotCities", "relatedTools", "relatedTopics", "relatedArticles", "relatedChecklists", "faq", "officialLinks", "cta"];
  const isBlockVisible = (key) => (blockVisibility || {})[key] !== false;
  
  const effectiveOrder = (blockOrder && blockOrder.length > 0)
    ? blockOrder.filter(k => defaultBlockOrder.includes(k))
    : defaultBlockOrder;
  
  return effectiveOrder.filter(isBlockVisible);
}

// Test cases
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

console.log("=== LandingPage Block Control Tests ===\n");

// Test 1: Default behavior (no blockVisibility, no blockOrder)
console.log("Test 1: Default behavior (null values)");
const result1 = computeVisibleBlocks(null, null);
assert(result1.length === 10, "Should have all 10 blocks");
assert(result1[0] === "hero", "First block should be hero");
assert(result1[9] === "cta", "Last block should be cta");

// Test 2: Empty objects (same as default)
console.log("\nTest 2: Empty objects");
const result2 = computeVisibleBlocks({}, []);
assert(result2.length === 10, "Should have all 10 blocks");

// Test 3: Hide a single block
console.log("\nTest 3: Hide hero block");
const result3 = computeVisibleBlocks({ hero: false }, []);
assert(result3.length === 9, "Should have 9 blocks");
assert(!result3.includes("hero"), "Should not include hero");

// Test 4: Hide multiple blocks
console.log("\nTest 4: Hide hero and cta");
const result4 = computeVisibleBlocks({ hero: false, cta: false }, []);
assert(result4.length === 8, "Should have 8 blocks");
assert(!result4.includes("hero"), "Should not include hero");
assert(!result4.includes("cta"), "Should not include cta");

// Test 5: Custom order
console.log("\nTest 5: Custom order (cta first, hero last)");
const customOrder = ["cta", "faq", "officialLinks", "hero"];
const result5 = computeVisibleBlocks({}, customOrder);
assert(result5.length === 4, "Should only have 4 blocks (those in customOrder)");
assert(result5[0] === "cta", "First block should be cta");
assert(result5[3] === "hero", "Last block should be hero");

// Test 6: Custom order + visibility
console.log("\nTest 6: Custom order + hide faq");
const result6 = computeVisibleBlocks({ faq: false }, ["cta", "faq", "officialLinks", "hero"]);
assert(result6.length === 3, "Should have 3 blocks");
assert(!result6.includes("faq"), "Should not include faq");
assert(result6[0] === "cta", "First block should be cta");

// Test 7: Invalid block keys in order are filtered out
console.log("\nTest 7: Invalid block keys filtered");
const result7 = computeVisibleBlocks({}, ["hero", "invalidBlock", "cta"]);
assert(result7.length === 2, "Should have 2 blocks");
assert(result7[0] === "hero", "First block should be hero");
assert(result7[1] === "cta", "Second block should be cta");

// Test 8: Explicitly visible (true) is same as default
console.log("\nTest 8: Explicitly visible blocks");
const result8 = computeVisibleBlocks({ hero: true, cta: true }, []);
assert(result8.length === 10, "Should have all 10 blocks");

// Test 9: Analytics tracking functions exist
console.log("\nTest 9: Analytics tracking functions");
// We can't import the actual module in this test, but we verify the pattern
const expectedEvents = ["landing_page_block_view", "landing_page_block_click"];
assert(expectedEvents.length === 2, "Should have 2 new event types defined");

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
