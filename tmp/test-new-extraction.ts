// Quick test to verify the new extractSourceFacts logic
const testText = `以下是我整理的加拿大留学签证资料，请你提炼并改写成绝世百宝箱风格的指南，适合准备去加拿大的留学生和家长：

加拿大留学签证申请一般需要先确认学校录取通知书，准备护照、资金证明、学习计划、学历材料、语言成绩、体检和无犯罪记录等资料。很多学生容易忽略的是，签证官不仅看你有没有被学校录取，也会看你是否有明确学习目的、足够资金来源、合理回国或未来规划，以及材料之间是否一致。资金证明最好能解释来源，避免突然大额存入导致被质疑。学习计划不应该写得太空泛，要说明为什么选择加拿大、为什么选择这所学校和专业、学习完成后的规划。家长准备材料时，也要注意收入证明、银行流水、亲属关系证明和担保说明之间要对应。递交前应该检查姓名、出生日期、学校名称、专业名称、学制、学费金额等关键信息是否一致。如果材料翻译不规范、资金解释不足、学习目的不清晰，容易增加拒签风险。申请人还需要关注体检预约、录指纹时间、签证审理周期，以及入境前需要携带的文件。建议学生在准备签证材料时建立一个清单，把必备材料、补充材料、解释信、翻译件和扫描件分开整理，避免临近递交时遗漏。`;

// New logic: split by sentences
const sentences = testText.split(/[。！？!?\n]+/).filter(s => s.trim().length >= 5);

console.log('=== New extractSourceFacts Logic Test ===\n');
console.log(`Total sentences: ${sentences.length}\n`);

const keyFacts = [];
const steps = [];
const warnings = [];

for (const sentence of sentences) {
  const trimmed = sentence.trim();
  if (trimmed.length < 5) continue;

  // Steps / action items
  if (/^(第?[一二三四五六七八九十\d]+[步阶段点项条]|先|然后|接着|最后|步骤|需要|必须|应该|建议)/.test(trimmed)) {
    steps.push(trimmed);
  }
  // Warnings / risks
  else if (/注意|小心|避免|不要|别|风险|坑|危险|警告|禁止|不能|切勿|千万别|容易|导致|问题|错误|失败|拒绝|质疑/.test(trimmed)) {
    warnings.push(trimmed);
  }
  // Key facts
  else if (/\d/.test(trimmed) || /约|大概|通常|一般|平均|最好|最好能|不应该|要说明|要注意|要对应|要检查/.test(trimmed)) {
    keyFacts.push(trimmed);
  }
  // General facts
  else if (trimmed.length > 15) {
    keyFacts.push(trimmed);
  }
}

console.log(`Steps: ${steps.length}`);
steps.forEach((s, i) => console.log(`  ${i + 1}. ${s.substring(0, 60)}...`));

console.log(`\nWarnings: ${warnings.length}`);
warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w.substring(0, 60)}...`));

console.log(`\nKey Facts: ${keyFacts.length}`);
keyFacts.forEach((f, i) => console.log(`  ${i + 1}. ${f.substring(0, 60)}...`));

const totalFacts = keyFacts.length + steps.length + warnings.length;
console.log(`\n=== Summary ===`);
console.log(`Total source facts: ${totalFacts} (expected: >= 10) ${totalFacts >= 10 ? '✅' : '❌'}`);
