// v1.20.42.7.04 运费计算器 CBM 公式验证测试

// 修复后的计算逻辑
function calculateShipping(rows, divisor) {
  let totalCtns = 0;
  let totalGW = 0;
  let totalVW = 0;
  let totalCBM = 0;
  const perRow = [];

  rows.forEach(row => {
    const l = parseFloat(row.length) || 0;
    const w = parseFloat(row.width) || 0;
    const h = parseFloat(row.height) || 0;
    const q = parseInt(row.quantity) || 0;
    const gw = parseFloat(row.actualWeight) || 0;

    // CBM calculation: cm to m³ conversion
    // Single piece CBM = L_cm × W_cm × H_cm / 1,000,000
    // Total CBM = Single CBM × quantity
    const singleCbm = (l * w * h) / 1000000;
    const cbm = singleCbm * q;
    
    // Volume weight calculation: cm³ to kg
    // VW = L_cm × W_cm × H_cm × quantity / divisor
    const volCm3 = l * w * h * q;
    const vw = volCm3 / divisor;

    totalCtns += q;
    totalGW += gw;
    totalVW += vw;
    totalCBM += cbm;

    perRow.push({ vw, cbm, singleCbm, gw, ctns: q, l, w, h, q });
  });

  const chargeableWeight = Math.max(totalGW, totalVW);

  return { totalCtns, totalGW, totalVW, totalCBM, chargeableWeight, perRow };
}

// 计算运费
function calculateFee(results, billingMode, pricePerKg, pricePerCbm, exchangeRate) {
  const ppk = parseFloat(pricePerKg) || 0;
  const ppcb = parseFloat(pricePerCbm) || 0;
  const rate = parseFloat(exchangeRate) || 1;

  let mainFee = 0;
  let mainFeeLabel = '';

  switch (billingMode) {
    case 'weight':
      mainFee = results.totalGW * ppk;
      mainFeeLabel = '按实重计费';
      break;
    case 'volume':
      mainFee = results.totalVW * ppk;
      mainFeeLabel = '按体积重计费';
      break;
    case 'higher':
      mainFee = results.chargeableWeight * ppk;
      mainFeeLabel = '二者取高计费';
      break;
    case 'cbm':
      mainFee = results.totalCBM * ppcb;
      mainFeeLabel = '按立方计费';
      break;
  }

  const convertedFee = mainFee * rate;

  return { mainFee, mainFeeLabel, convertedFee };
}

// 测试样例 A
console.log('=== 样例 A ===');
const rowsA = [
  { length: '50', width: '40', height: '30', quantity: '10', actualWeight: '80' }
];
const resultsA = calculateShipping(rowsA, 6000);
console.log('单件 CBM:', (resultsA.totalCBM / resultsA.totalCtns).toFixed(4), 'm³ (预期: 0.0600)');
console.log('总 CBM:', resultsA.totalCBM.toFixed(4), 'm³ (预期: 0.6000)');
console.log('体积重:', resultsA.totalVW.toFixed(1), 'kg (预期: 100.0)');
console.log('实重合计:', resultsA.totalGW.toFixed(1), 'kg (预期: 80.0)');
console.log('二者取高计费重:', resultsA.chargeableWeight.toFixed(1), 'kg (预期: 100.0)');

const feeA_weight = calculateFee(resultsA, 'weight', 20, 1000, 7.2);
console.log('按实际重量主运费:', feeA_weight.mainFee.toFixed(2), '(预期: 1600.00)');
console.log('按实际重量目标币种:', feeA_weight.convertedFee.toFixed(2), '(预期: 11520.00)');

const feeA_volume = calculateFee(resultsA, 'volume', 20, 1000, 7.2);
console.log('按体积重量主运费:', feeA_volume.mainFee.toFixed(2), '(预期: 2000.00)');
console.log('按体积重量目标币种:', feeA_volume.convertedFee.toFixed(2), '(预期: 14400.00)');

const feeA_higher = calculateFee(resultsA, 'higher', 20, 1000, 7.2);
console.log('二者取高主运费:', feeA_higher.mainFee.toFixed(2), '(预期: 2000.00)');
console.log('二者取高目标币种:', feeA_higher.convertedFee.toFixed(2), '(预期: 14400.00)');

const feeA_cbm = calculateFee(resultsA, 'cbm', 20, 1000, 7.2);
console.log('按立方主运费:', feeA_cbm.mainFee.toFixed(2), '(预期: 600.00)');
console.log('按立方目标币种:', feeA_cbm.convertedFee.toFixed(2), '(预期: 4320.00)');

console.log('\n=== 样例 B ===');
const rowsB = [
  { length: '100', width: '100', height: '100', quantity: '1', actualWeight: '50' }
];
const resultsB = calculateShipping(rowsB, 5000);
console.log('单件 CBM:', (resultsB.totalCBM / resultsB.totalCtns).toFixed(4), 'm³ (预期: 1.0000)');
console.log('总 CBM:', resultsB.totalCBM.toFixed(4), 'm³ (预期: 1.0000)');
console.log('体积重:', resultsB.totalVW.toFixed(1), 'kg (预期: 200.0)');
console.log('实重合计:', resultsB.totalGW.toFixed(1), 'kg (预期: 50.0)');
console.log('二者取高计费重:', resultsB.chargeableWeight.toFixed(1), 'kg (预期: 200.0)');

const feeB_higher = calculateFee(resultsB, 'higher', 10, 800, 1);
console.log('二者取高主运费:', feeB_higher.mainFee.toFixed(2), '(预期: 2000.00)');

const feeB_cbm = calculateFee(resultsB, 'cbm', 10, 800, 1);
console.log('按立方主运费:', feeB_cbm.mainFee.toFixed(2), '(预期: 800.00)');

console.log('\n=== 样例 C ===');
const rowsC = [
  { length: '10', width: '10', height: '10', quantity: '1', actualWeight: '1' }
];
const resultsC = calculateShipping(rowsC, 5000);
console.log('单件 CBM:', (resultsC.totalCBM / resultsC.totalCtns).toFixed(4), 'm³ (预期: 0.0010)');
console.log('总 CBM:', resultsC.totalCBM.toFixed(4), 'm³ (预期: 0.0010)');
console.log('体积重:', resultsC.totalVW.toFixed(1), 'kg (预期: 0.2)');
console.log('实重合计:', resultsC.totalGW.toFixed(1), 'kg (预期: 1.0)');
console.log('二者取高计费重:', resultsC.chargeableWeight.toFixed(1), 'kg (预期: 1.0)');

const feeC_higher = calculateFee(resultsC, 'higher', 10, 800, 1);
console.log('二者取高主运费:', feeC_higher.mainFee.toFixed(2), '(预期: 10.00)');

const feeC_cbm = calculateFee(resultsC, 'cbm', 10, 800, 1);
console.log('按立方主运费:', feeC_cbm.mainFee.toFixed(2), '(预期: 0.80)');

console.log('\n=== 验证结果 ===');
let allPassed = true;

// 样例 A 验证
if (Math.abs((resultsA.totalCBM / resultsA.totalCtns) - 0.06) > 0.0001) { console.log('❌ 样例 A 单件 CBM 错误'); allPassed = false; }
if (Math.abs(resultsA.totalCBM - 0.6) > 0.0001) { console.log('❌ 样例 A 总 CBM 错误'); allPassed = false; }
if (Math.abs(resultsA.totalVW - 100) > 0.1) { console.log('❌ 样例 A 体积重错误'); allPassed = false; }
if (Math.abs(resultsA.totalGW - 80) > 0.1) { console.log('❌ 样例 A 实重合计错误'); allPassed = false; }
if (Math.abs(resultsA.chargeableWeight - 100) > 0.1) { console.log('❌ 样例 A 二者取高错误'); allPassed = false; }
if (Math.abs(feeA_weight.mainFee - 1600) > 0.01) { console.log('❌ 样例 A 按实际重量主运费错误'); allPassed = false; }
if (Math.abs(feeA_volume.mainFee - 2000) > 0.01) { console.log('❌ 样例 A 按体积重量主运费错误'); allPassed = false; }
if (Math.abs(feeA_higher.mainFee - 2000) > 0.01) { console.log('❌ 样例 A 二者取高主运费错误'); allPassed = false; }
if (Math.abs(feeA_higher.convertedFee - 14400) > 0.01) { console.log('❌ 样例 A 二者取高目标币种错误'); allPassed = false; }
if (Math.abs(feeA_cbm.mainFee - 600) > 0.01) { console.log('❌ 样例 A 按立方主运费错误'); allPassed = false; }
if (Math.abs(feeA_cbm.convertedFee - 4320) > 0.01) { console.log('❌ 样例 A 按立方目标币种错误'); allPassed = false; }

// 样例 B 验证
if (Math.abs((resultsB.totalCBM / resultsB.totalCtns) - 1) > 0.0001) { console.log('❌ 样例 B 单件 CBM 错误'); allPassed = false; }
if (Math.abs(resultsB.totalCBM - 1) > 0.0001) { console.log('❌ 样例 B 总 CBM 错误'); allPassed = false; }
if (Math.abs(resultsB.totalVW - 200) > 0.1) { console.log('❌ 样例 B 体积重错误'); allPassed = false; }
if (Math.abs(resultsB.totalGW - 50) > 0.1) { console.log('❌ 样例 B 实重合计错误'); allPassed = false; }
if (Math.abs(feeB_higher.mainFee - 2000) > 0.01) { console.log('❌ 样例 B 二者取高主运费错误'); allPassed = false; }
if (Math.abs(feeB_cbm.mainFee - 800) > 0.01) { console.log('❌ 样例 B 按立方主运费错误'); allPassed = false; }

// 样例 C 验证
if (Math.abs((resultsC.totalCBM / resultsC.totalCtns) - 0.001) > 0.0001) { console.log('❌ 样例 C 单件 CBM 错误'); allPassed = false; }
if (Math.abs(resultsC.totalCBM - 0.001) > 0.0001) { console.log('❌ 样例 C 总 CBM 错误'); allPassed = false; }
if (Math.abs(resultsC.totalVW - 0.2) > 0.01) { console.log('❌ 样例 C 体积重错误'); allPassed = false; }
if (Math.abs(resultsC.totalGW - 1) > 0.1) { console.log('❌ 样例 C 实重合计错误'); allPassed = false; }
if (Math.abs(feeC_higher.mainFee - 10) > 0.01) { console.log('❌ 样例 C 二者取高主运费错误'); allPassed = false; }
if (Math.abs(feeC_cbm.mainFee - 0.8) > 0.01) { console.log('❌ 样例 C 按立方主运费错误'); allPassed = false; }

if (allPassed) {
  console.log('✅ 所有测试通过！');
} else {
  console.log('❌ 部分测试失败');
  process.exit(1);
}
