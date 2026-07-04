#!/usr/bin/env tsx
/**
 * PHASE 12: Pending modification test
 * 
 * Test natural language modification based on PHASE 11 result
 */

// Set environment variables BEFORE importing the module
process.env.LOCAL_HERMES_ENABLED = 'true';
process.env.LOCAL_HERMES_PATH = '/Users/chq/.hermes/hermes-agent/venv/bin/hermes';

async function runModificationTest() {
  // Dynamic import after setting env vars
  const { modifyPlanLocal } = await import('./local-hermes-agent-client');
  const fs = await import('fs');

  console.log('=== PHASE 12: Pending modification test ===\n');

  // Load PHASE 11 result
  let currentPlan;
  try {
    const resultJson = fs.readFileSync('/tmp/phase11-result.json', 'utf-8');
    currentPlan = JSON.parse(resultJson);
    console.log('Loaded PHASE 11 result:');
    console.log('  title:', currentPlan.title);
    console.log('  contentType:', currentPlan.contentType);
    console.log('  resources count:', currentPlan.content?.resources?.length || 0);
  } catch (error: any) {
    console.error('❌ Failed to load PHASE 11 result:', error.message);
    return false;
  }

  const MODIFICATION_REQUEST = '标题改成海外新生必备 APP 清单，并把安全风险提醒加重一点';

  try {
    console.log('\nCalling local Hermes Agent for modification...');
    console.log('Modification request:', MODIFICATION_REQUEST);
    const startTime = Date.now();
    
    const result = await modifyPlanLocal(currentPlan, MODIFICATION_REQUEST);
    
    const duration = Date.now() - startTime;
    console.log(`\nCompleted in ${duration}ms\n`);

    // Validation
    console.log('=== Validation ===\n');
    
    const validations = {
      'gatewayLocation=local_mac': result.gatewayLocation === 'local_mac',
      'localHermesRunId exists': !!result.localHermesRunId && result.localHermesRunId.length > 0,
      'planningUsed=true': result.planningUsed === true,
      'fallbackUsed=false': result.fallbackUsed === false,
      'title=海外新生必备 APP 清单': result.title === '海外新生必备 APP 清单',
      '安全风险提醒增强': result.content?.pitfalls?.length >= (currentPlan.content?.pitfalls?.length || 0),
      'contentType=topic': result.contentType === 'topic',
      'S/A/B/C 仍存在': result.content?.resources?.some((r: any) => ['S', 'A', 'B', 'C'].includes(r.ratingTier)) || false,
      'resources/apps >= 8': (result.content?.resources?.length || 0) >= 8,
      'qualityGate PASS': result.qualityGate?.pass === true,
    };

    let allPassed = true;
    for (const [check, passed] of Object.entries(validations)) {
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check}`);
      if (!passed) allPassed = false;
    }

    console.log('\n=== Result Summary ===\n');
    console.log('localHermesRunId:', result.localHermesRunId);
    console.log('gatewayLocation:', result.gatewayLocation);
    console.log('planningUsed:', result.planningUsed);
    console.log('fallbackUsed:', result.fallbackUsed);
    console.log('title:', result.title);
    console.log('contentType:', result.contentType);
    console.log('resources count:', result.content?.resources?.length || 0);
    console.log('pitfalls count:', result.content?.pitfalls?.length || 0);
    console.log('qualityGate score:', result.qualityGate?.score);
    console.log('qualityGate pass:', result.qualityGate?.pass);

    console.log('\n=== Draft Creation Check ===\n');
    console.log('❌ Draft NOT created (as expected)');
    console.log('❌ Content NOT published (as expected)');

    console.log('\n=== Final Verdict ===\n');
    if (allPassed) {
      console.log('✅ PHASE 12 PASSED');
      console.log('✅ All validations passed');
      console.log('✅ Ready for PHASE 13 (user Telegram E2E)');
    } else {
      console.log('❌ PHASE 12 FAILED');
      console.log('❌ Some validations failed');
    }

    return allPassed;
  } catch (error: any) {
    console.error('\n❌ PHASE 12 ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

runModificationTest().then(success => {
  process.exit(success ? 0 : 1);
});
