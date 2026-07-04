function parseNaturalLanguage(text) {
  const lowerText = text.toLowerCase();
  
  let type = 'checklist';
  if (lowerText.includes('指南') || lowerText.includes('guide') || lowerText.includes('教程')) {
    type = 'guide';
  } else if (lowerText.includes('专题') || lowerText.includes('topic') || lowerText.includes('主题')) {
    type = 'topic';
  } else if (lowerText.includes('清单') || lowerText.includes('checklist') || lowerText.includes('列表')) {
    type = 'checklist';
  }
  
  let title = '';
  const quotedMatch = text.match(/['"""\u201c\u201d]([^'"""\u201c\u201d]+?)['"""\u201c\u201d]/);
  if (quotedMatch) {
    title = quotedMatch[1].trim();
  } else {
    const sentences = text.split(/[。！？.!?]/);
    title = sentences[0].replace(/^(帮我|请|创建|一个)/, '').trim();
  }
  
  if (!title) return null;
  
  const slug = title
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return { type, title, slug };
}

const tests = [
  {
    input: '帮我创建一个\u201c新加坡留学生租房注意事项清单\u201d。',
    expected: { type: 'checklist', title: '新加坡留学生租房注意事项清单' }
  },
  {
    input: '帮我创建一个\u201c加拿大留学签证申请指南\u201d。',
    expected: { type: 'guide', title: '加拿大留学签证申请指南' }
  },
  {
    input: '帮我创建一个\u201c海外必备 APP 推荐\u201d的专题。',
    expected: { type: 'topic', title: '海外必备 APP 推荐' }
  }
];

console.log('=== Parser Regression Test ===\n');
let allPass = true;

tests.forEach((test, i) => {
  const result = parseNaturalLanguage(test.input);
  const typePass = result.type === test.expected.type;
  const titlePass = result.title === test.expected.title;
  const slugPass = result.slug && result.slug.length > 0;
  
  console.log('Test ' + (i + 1) + ': ' + test.expected.type);
  console.log('  Type: ' + (typePass ? 'PASS' : 'FAIL'));
  console.log('  Title: ' + (titlePass ? 'PASS' : 'FAIL') + ' (got: ' + result.title + ')');
  console.log('  Slug: ' + (slugPass ? 'PASS' : 'FAIL') + ' (got: ' + result.slug + ')');
  console.log();
  
  if (!typePass || !titlePass || !slugPass) allPass = false;
});

console.log(allPass ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
process.exit(allPass ? 0 : 1);
