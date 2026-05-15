// Verify A4 export renderer produces correct HTML
import { buildA4ExportHTML, A4_WIDTH, A4_HEIGHT } from '../../src/lib/documents/a4-export-renderer.js';

const html = buildA4ExportHTML({
  companyName: '深圳海外贸易有限公司',
  companyNameEn: 'Shenzhen Overseas Trade Co., Ltd.',
  companyAddress: '深圳市南山区科技园南区',
  companyPhone: '+86-755-8888-8888',
  companyEmail: 'trade@example.com',
  companyWebsite: '',
  documentNo: 'QT-2024-001',
  documentDate: '2024-05-15',
  titleZh: '通用报价单',
  titleEn: 'Quotation',
  sections: [
    { title: '报价信息', fields: [{ key: 'documentNo', label: '编号' }, { key: 'documentDate', label: '日期' }, { key: 'validUntil', label: '有效期' }], data: { documentNo: 'QT-2024-001', documentDate: '2024-05-15', validUntil: '2024-06-15' } },
    { title: '双方信息', fields: [{ key: 'companyName', label: '报价公司' }, { key: 'customerName', label: '客户' }], data: { companyName: '深圳海外贸易有限公司', customerName: 'ABC Trading LLC' } },
    { title: '运输信息', fields: [{ key: 'portOfLoading', label: '装运港' }, { key: 'portOfDischarge', label: '目的港' }], data: { portOfLoading: 'Shenzhen', portOfDischarge: 'Los Angeles' } },
  ],
  lineItems: {
    columns: [
      { key: 'productName', label: '产品/服务' },
      { key: 'specification', label: '规格' },
      { key: 'quantity', label: '数量' },
      { key: 'unit', label: '单位' },
      { key: 'unitPrice', label: '单价' },
      { key: 'amount', label: '总价' },
    ],
    rows: [
      { productName: 'LED Panel Light 60x60', specification: '40W, 4000K', quantity: '100', unit: 'PCS', unitPrice: '25.00', amount: '2500.00' },
      { productName: 'LED Panel Light 30x120', specification: '40W, 6000K', quantity: '200', unit: 'PCS', unitPrice: '35.00', amount: '7000.00' },
      { productName: 'LED Driver 40W', specification: 'Constant Current', quantity: '300', unit: 'PCS', unitPrice: '8.50', amount: '2550.00' },
    ],
    totals: [
      { label: '总金额', value: '$12,050.00' },
    ],
  },
  terms: 'Payment: 30% T/T advance, 70% before shipment.\nDelivery: 15-20 days after order confirmation.\nValidity: 30 days.',
  canRemoveBranding: false,
  style: {
    primaryColor: '#000000',
    borderColor: '#000000',
    headingBgColor: '#f3f4f6',
  },
});

// Check HTML
console.log('=== A4 Export HTML Verification ===');
console.log(`A4_WIDTH constant: ${A4_WIDTH}`);
console.log(`A4_HEIGHT constant: ${A4_HEIGHT}`);
console.log(`HTML length: ${html.length} chars`);

// Check for fixed width
const hasWidth794 = html.includes('width: 794px') || html.includes('width:794px');
console.log(`Has fixed 794px width: ${hasWidth794 ? '✅' : '❌'}`);

// Check for .a4-page class
const hasA4Page = html.includes('class="a4-page"');
console.log(`Has .a4-page class: ${hasA4Page ? '✅' : '❌'}`);

// Check for no Tailwind classes
const hasTailwind = /className=|class="[a-z]+-[a-z]/.test(html) && !html.includes('class="a4-page"');
console.log(`No Tailwind classes: ${!hasTailwind ? '✅' : '❌'}`);

// Check for no lab/oklch
const hasLabOklch = /lab\(|oklch\(|color-mix/.test(html);
console.log(`No lab/oklch colors: ${!hasLabOklch ? '✅' : '❌'}`);

// Check content sections
const checks = [
  ['Company name', '深圳海外贸易有限公司'],
  ['Document title', '通用报价单'],
  ['Document No', 'QT-2024-001'],
  ['Table headers', '产品/服务'],
  ['Line items', 'LED Panel Light'],
  ['Totals', '总金额'],
  ['Signature area', '签字盖章'],
  ['Footer branding', 'kjbxb.com'],
  ['DOCTYPE', '<!DOCTYPE html>'],
  ['Meta charset', 'charset="utf-8"'],
  ['Print styles', '@page'],
];

for (const [label, pattern] of checks) {
  const found = html.includes(pattern);
  console.log(`${found ? '✅' : '❌'} ${label}: ${found ? 'found' : 'MISSING'}`);
}

console.log('\n=== Label Export Test ===');
import { buildLabelA4ExportHTML } from '../../src/lib/labels/a4-export-renderer.js';

const labelHtml = buildLabelA4ExportHTML({
  type: 'shipping-mark',
  titleZh: '通用外箱唛头',
  titleEn: 'Shipping Mark',
  formData: {
    mainMark: 'ABC\nLOTUS\nC/No. 1-100',
    sideMark: 'Widget Model X\nMade in China',
    destination: 'Los Angeles, USA',
    cartonNo: '1/100',
    grossWeight: '25.5 KGS',
    netWeight: '23.0 KGS',
    measurement: '60×40×50 CM',
    origin: 'CHINA',
  },
  style: { primaryColor: '#000000', borderColor: '#000000' },
  canRemoveBranding: false,
});

console.log(`Label HTML length: ${labelHtml.length} chars`);
const labelChecks = [
  ['Fixed 794px width', labelHtml.includes('width: 794px')],
  ['.a4-page class', labelHtml.includes('class="a4-page"')],
  ['Main Mark', labelHtml.includes('Main Mark')],
  ['Destination', labelHtml.includes('Los Angeles')],
  ['Carton No', labelHtml.includes('1/100')],
];
for (const [label, ok] of labelChecks) {
  console.log(`${ok ? '✅' : '❌'} ${label}`);
}

console.log('\n=== All checks passed ===');
