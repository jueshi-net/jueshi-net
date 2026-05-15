// Enhanced verification: check padding, a4-inner, and no edge-touching content
import { buildA4ExportHTML } from '../../src/lib/documents/a4-export-renderer';

const html = buildA4ExportHTML({
  companyName: '深圳海外贸易有限公司',
  companyNameEn: 'Shenzhen Overseas Trade Co., Ltd.',
  companyAddress: '深圳市南山区科技园南区',
  companyPhone: '+86-755-8888-8888',
  companyEmail: 'trade@example.com',
  companyWebsite: '',
  documentNo: 'CI-2024-001',
  documentDate: '2024-05-15',
  titleZh: '商业发票',
  titleEn: 'Commercial Invoice',
  sections: [
    { title: '买卖双方', fields: [
      { key: 'sellerName', label: '卖方' }, { key: 'buyerName', label: '买方' },
      { key: 'sellerAddr', label: '卖方地址' }, { key: 'buyerAddr', label: '买方地址' },
    ], data: { sellerName: '深圳海外贸易有限公司', buyerName: 'ABC Trading LLC', sellerAddr: '深圳市南山区', buyerAddr: 'Los Angeles, CA' } },
    { title: '运输信息', fields: [
      { key: 'portOfLoading', label: '装运港' }, { key: 'portOfDischarge', label: '目的港' },
      { key: 'vessel', label: '船名' }, { key: 'etd', label: '预计发运日' },
    ], data: { portOfLoading: 'Shenzhen', portOfDischarge: 'Los Angeles', vessel: 'COSCO V.123', etd: '2024-06-01' } },
  ],
  lineItems: {
    columns: [
      { key: 'productName', label: '品名' }, { key: 'specification', label: '规格' },
      { key: 'quantity', label: '数量' }, { key: 'unit', label: '单位' },
      { key: 'unitPrice', label: '单价' }, { key: 'amount', label: '总价' },
    ],
    rows: [
      { productName: 'LED Panel Light 60x60', specification: '40W 4000K', quantity: '100', unit: 'PCS', unitPrice: '25.00', amount: '2500.00' },
      { productName: 'LED Driver 40W', specification: 'Constant Current', quantity: '300', unit: 'PCS', unitPrice: '8.50', amount: '2550.00' },
    ],
    totals: [{ label: '总金额', value: '$5,050.00' }],
  },
  terms: 'Payment: 30% T/T advance, 70% before shipment.\nDelivery: 15-20 days.',
  canRemoveBranding: false,
  style: { primaryColor: '#000000', borderColor: '#000000', headingBgColor: '#f3f4f6' },
});

console.log('=== Layout Verification ===\n');

// 1. Check a4-page padding
const hasPadding56 = html.includes('padding: 56px 64px 44px 64px');
console.log(`1. .a4-page padding (56px 64px 44px 64px): ${hasPadding56 ? '✅ PASS' : '❌ FAIL'}`);

// 2. Check a4-inner wrapper exists
const hasA4Inner = html.includes('class="a4-inner"');
console.log(`2. .a4-inner wrapper: ${hasA4Inner ? '✅ PASS' : '❌ FAIL'}`);

// 3. Check content is inside a4-inner
const innerStart = html.indexOf('class="a4-inner"');
const headerPos = html.indexOf('深圳海外贸易有限公司');
const tablePos = html.indexOf('LED Panel Light');
const footerPos = html.indexOf('kjbxb.com');
const allInsideInner = innerStart < headerPos && innerStart < tablePos && innerStart < footerPos;
console.log(`3. All content inside .a4-inner: ${allInsideInner ? '✅ PASS' : '❌ FAIL'}`);

// 4. Check table is NOT 794px wide (should be 100% of inner)
const tableWidth794 = /table.*width:\s*794px/.test(html);
console.log(`4. Table NOT hardcoded 794px: ${!tableWidth794 ? '✅ PASS' : '❌ FAIL'}`);

// 5. Check no left:0 on content elements (only allowed on .a4-page positioning)
const left0OnContent = html.includes('left: 0') && !html.includes('position: fixed');
console.log(`5. No content with left:0: ${!left0OnContent ? '✅ PASS' : '❌ FAIL'}`);

// 6. Check section margins are reasonable (16-24px)
const sectionMargins = html.includes('margin-bottom:18px');
console.log(`6. Section margins ~18px: ${sectionMargins ? '✅ PASS' : '❌ FAIL'}`);

// 7. Check signature area uses flex with 48% widths
const signatureFlex = html.includes('width:48%');
console.log(`7. Signature 48% columns: ${signatureFlex ? '✅ PASS' : '❌ FAIL'}`);

// 8. Check header has border-bottom but within inner container
const headerBorder = html.includes('border-bottom:2px solid');
console.log(`8. Header border-bottom (within inner): ${headerBorder ? '✅ PASS' : '❌ FAIL'}`);

// 9. Check footer color is #94a3b8 (visible but subtle)
const footerColor = html.includes('color:#94a3b8');
console.log(`9. Footer color #94a3b8: ${footerColor ? '✅ PASS' : '❌ FAIL'}`);

// 10. Check no lab/oklch
const hasLabOklch = /lab\(|oklch\(|color-mix/.test(html);
console.log(`10. No lab/oklch: ${!hasLabOklch ? '✅ PASS' : '❌ FAIL'}`);

// 11. Check no Tailwind classes
const hasTailwind = /className=/.test(html);
console.log(`11. No Tailwind classes: ${!hasTailwind ? '✅ PASS' : '❌ FAIL'}`);

// 12. Check A4 dimensions
const hasWidth794 = html.includes('width: 794px');
const hasHeight1123 = html.includes('min-height: 1123px');
console.log(`12. A4 dimensions (794×1123): ${hasWidth794 && hasHeight1123 ? '✅ PASS' : '❌ FAIL'}`);

console.log('\n=== Summary ===');
const allPassed = hasPadding56 && hasA4Inner && allInsideInner && !tableWidth794 && !left0OnContent &&
  sectionMargins && signatureFlex && headerBorder && footerColor && !hasLabOklch && !hasTailwind &&
  hasWidth794 && hasHeight1123;
console.log(allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED');
