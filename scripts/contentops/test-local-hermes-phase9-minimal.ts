#!/usr/bin/env tsx
/**
 * PHASE 9: Minimal Hermes JSON test
 * 
 * Test minimal JSON generation to verify Hermes Agent works
 */

// Set environment variables BEFORE importing the module
process.env.LOCAL_HERMES_ENABLED = 'true';
process.env.LOCAL_HERMES_PATH = '/Users/chq/.hermes/hermes-agent/venv/bin/hermes';

async function runMinimalTest() {
  // Dynamic import after setting env vars
  const { callLocalHermesAgent } = await import('./local-hermes-agent-client');

  console.log('=== PHASE 9: Minimal Hermes JSON test ===\n');

  const systemPrompt = 'You are a JSON generator. Return valid JSON only.';
  const prompt = 'Return: {"test": "value", "number": 42}';

  try {
    console.log('Calling local Hermes Agent with minimal prompt...');
    const startTime = Date.now();
    
    const response = await callLocalHermesAgent(prompt, systemPrompt);
    
    const duration = Date.now() - startTime;
    console.log(`\nCompleted in ${duration}ms\n`);
    console.log('Response:', response);

    // Try to parse JSON
    try {
      const json = JSON.parse(response);
      console.log('\n✅ JSON parsed successfully');
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
      return true;
    } catch (parseError: any) {
      console.error('\n❌ JSON parse failed:', parseError.message);
      return false;
    }
  } catch (error: any) {
    console.error('\n❌ PHASE 9 ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

runMinimalTest().then(success => {
  process.exit(success ? 0 : 1);
});
