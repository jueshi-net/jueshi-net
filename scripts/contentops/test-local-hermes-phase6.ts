#!/usr/bin/env tsx
/**
 * PHASE 6: Local Mac Hermes Agent dry-run test
 * 
 * Test reference_rewrite content planning on local Mac
 * No draft creation, no production impact
 */

// Set environment variables BEFORE importing the module
process.env.LOCAL_HERMES_ENABLED = 'true';
process.env.LOCAL_HERMES_PATH = '/Users/chq/.hermes/hermes-agent/venv/bin/hermes';

const TEST_INPUT = `参考下面这段竞品资料，帮我改写成我们自己的内容，不要照搬，适合海外华人和留学生：

很多刚到海外的人都会下载一些常用 APP，例如地图导航、翻译、打车、外卖、银行、租房、二手交易、社交和本地生活服务。不同国家常用的软件不一样，比如北美常用 Google Maps、Uber、DoorDash、Facebook Marketplace，英国和澳洲也会用本地银行、交通和租房平台。留学生刚出国时，最容易遇到的问题是不会找路线、不知道怎么买电话卡、不熟悉当地支付方式、找房信息真假难辨、不了解二手交易风险。建议出国前先把常用 APP 下载好，并准备好邮箱、手机号、支付方式和身份验证材料。不同 APP 涉及隐私和银行卡信息，使用时要注意官方渠道下载，不要随便点陌生链接。对于刚到海外的用户，最好按照"出行、支付、住宿、吃饭、学习、社交、安全"几个场景来整理自己的手机工具箱。`;

async function runPhase6Test() {
  // Dynamic import after setting env vars
  const { analyzeAndPlanLocal } = await import('./local-hermes-agent-client');
  type LocalHermesRunResult = import('./local-hermes-agent-client').LocalHermesRunResult;

  console.log('=== PHASE 6: Local Mac Hermes Agent dry-run test ===\n');
  console.log('Input mode: reference_rewrite');
  console.log('Test input length:', TEST_INPUT.length, 'chars\n');

  try {
    console.log('Calling local Hermes Agent...');
    const startTime = Date.now();
    
    const result: LocalHermesRunResult = await analyzeAndPlanLocal(TEST_INPUT, 'reference_rewrite');
    
    const duration = Date.now() - startTime;
    console.log(`\nCompleted in ${duration}ms\n`);

    // Validation
    console.log('=== Validation ===\n');
    
    const validations = {
      'gatewayLocation=local_mac': result.gatewayLocation === 'local_mac',
      'localHermesRunId exists': !!result.localHermesRunId && result.localHermesRunId.length > 0,
      'planningUsed=true': result.planningUsed === true,
      'fallbackUsed=false': result.fallbackUsed === false,
      'inputMode=reference_rewrite': result.inputMode === 'reference_rewrite',
      'contentType=topic': result.contentType === 'topic',
      'schemaType=topic': result.schemaType === 'topic',
      'title 合格': result.title.length > 0 && result.title.length <= 24,
      'S/A/B/C 存在': result.content?.resources?.some((r: any) => ['S', 'A', 'B', 'C'].includes(r.ratingTier)) || false,
      'resources/apps >= 8': (result.content?.resources?.length || 0) >= 8,
      'scenarioMap exists': !!result.content?.scenarioMap,
      'comparisonTable exists': !!result.content?.comparisonTable,
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
    console.log('inputMode:', result.inputMode);
    console.log('contentType:', result.contentType);
    console.log('schemaType:', result.schemaType);
    console.log('title:', result.title);
    console.log('resources count:', result.content?.resources?.length || 0);
    console.log('qualityGate score:', result.qualityGate?.score);
    console.log('qualityGate pass:', result.qualityGate?.pass);

    console.log('\n=== Draft Creation Check ===\n');
    console.log('❌ Draft NOT created (as expected)');
    console.log('❌ Content NOT published (as expected)');

    console.log('\n=== Final Verdict ===\n');
    if (allPassed) {
      console.log('✅ PHASE 6 PASSED');
      console.log('✅ All validations passed');
      console.log('✅ Ready for PHASE 7');
    } else {
      console.log('❌ PHASE 6 FAILED');
      console.log('❌ Some validations failed');
    }

    // Save result for PHASE 7
    const fs = await import('fs');
    fs.writeFileSync('/tmp/phase6-result.json', JSON.stringify(result, null, 2));
    console.log('\nResult saved to /tmp/phase6-result.json for PHASE 7');

    return allPassed;
  } catch (error: any) {
    console.error('\n❌ PHASE 6 ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

runPhase6Test().then(success => {
  process.exit(success ? 0 : 1);
});
