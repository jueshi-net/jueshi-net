const paths = [
  '/tools/hs-code',
  '/tools/exchange-rate',
  '/tools/postal-code',
  '/tools/address-formatter',
  '/tools/shipping-calculator',
  '/tools/documents/commercial-invoice',
  '/tools/documents/quotation',
  '/checklists/first-shipping-checklist',
  '/tools',
  '/checklists',
  '/topics',
  '/community',
  '/workspace',
  '/admin'
];

async function checkPath(path) {
  try {
    const response = await fetch(`https://jueshi.net${path}`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const status = response.status;
    const ok = status === 200 || status === 307 || status === 308;
    console.log(`${ok ? '✓' : '✗'} ${path} → ${status}`);
    return ok;
  } catch (error) {
    console.log(`✗ ${path} → ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== 回归路径验证 ===\n');
  let allPassed = true;
  for (const path of paths) {
    const passed = await checkPath(path);
    if (!passed) allPassed = false;
  }
  console.log(allPassed ? '\n✅ 所有路径验证通过' : '\n❌ 部分路径验证失败');
}

main();
