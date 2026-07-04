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
    const fallbackMatch = text.match(/(?:帮我|请)?(?:创建|关于|做一个)?(?:一个)?['"""\u201c\u201d]?([^'"""\u201c\u201d\n。！？]+?)['"""\u201c\u201d]?(?:的|。|！|？|$)/);
    if (fallbackMatch) {
      title = fallbackMatch[1].trim();
    } else {
      const sentences = text.split(/[。！？.!?]/);
      title = sentences[0].replace(/^(帮我|请|创建|一个)/, '').trim();
    }
  }
  
  if (!title) return null;
  
  let slug = title
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  // Check if slug contains Chinese characters
  const hasChinese = /[\u4e00-\u9fa5]/.test(slug);
  
  return { type, title, slug, hasChinese };
}

const tests = [
  {
    input: '帮我创建一个\u201c新加坡留学生租房注意事项清单\u201d。\n目标用户：新加坡留学生。\n目标国家：新加坡。\n受众阶段：即将出国。',
    expected: { type: 'checklist', title: '新加坡留学生租房注意事项清单' }
  },
  {
    input: '帮我创建一个\u201c加拿大留学签证申请指南\u201d。\n目标用户：准备去加拿大的留学生。\n目标国家：加拿大。\n受众阶段：准备出国。',
    expected: { type: 'guide', title: '加拿大留学签证申请指南' }
  },
  {
    input: '帮我创建一个\u201c海外必备 APP 推荐\u201d的专题。\n目标用户：海外华人、留学生、准备出国的人。\n目标国家：加拿大、美国、英国、澳大利亚、新加坡。\n受众阶段：已在海外。',
    expected: { type: 'topic', title: '海外必备 APP 推荐' }
  }
];

console.log('=== Parser Self-Check v2 ===\n');
let allPass = true;

tests.forEach((test, i) => {
  const result = parseNaturalLanguage(test.input);
  const typePass = result.type === test.expected.type;
  const titlePass = result.title === test.expected.title;
  const slugPass = result.slug && result.slug.length > 0;
  const noChinese = !result.hasChinese;
  
  console.log('Test ' + (i + 1) + ': ' + test.expected.type);
  console.log('  Type: ' + (typePass ? 'PASS' : 'FAIL'));
  console.log('  Title: ' + (titlePass ? 'PASS' : 'FAIL') + ' (got: ' + result.title + ')');
  console.log('  Slug: ' + (slugPass ? 'PASS' : 'FAIL') + ' (got: ' + result.slug + ')');
  console.log('  No Chinese in slug: ' + (noChinese ? 'PASS' : 'FAIL'));
  console.log();
  
  if (!typePass || !titlePass || !slugPass || !noChinese) allPass = false;
});

console.log(allPass ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
process.exit(allPass ? 0 : 1);
