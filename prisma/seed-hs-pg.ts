// Quick seed for HS codes
import { Client } from 'pg';

async function main() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  await client.connect();

  const hsCodes = [
    { code: '0101', description: '马、驴、骡', rate: 0, category: '活动物' },
    { code: '0102', description: '牛', rate: 0, category: '活动物' },
    { code: '0103', description: '猪', rate: 0, category: '活动物' },
    { code: '0104', description: '绵羊、山羊', rate: 0, category: '活动物' },
    { code: '0105', description: '家禽', rate: 0, category: '活动物' },
    { code: '0201', description: '鲜、冷牛肉', rate: 12, category: '肉及食用杂碎' },
    { code: '0202', description: '冻牛肉', rate: 12, category: '肉及食用杂碎' },
    { code: '0203', description: '鲜、冷、冻猪肉', rate: 12, category: '肉及食用杂碎' },
    { code: '0204', description: '鲜、冷、冻绵羊或山羊肉', rate: 12, category: '肉及食用杂碎' },
    { code: '0207', description: '禽肉及食用杂碎', rate: 12, category: '肉及食用杂碎' },
    { code: '0301', description: '活鱼', rate: 10, category: '鱼、甲壳动物' },
    { code: '0302', description: '鲜、冷鱼', rate: 10, category: '鱼、甲壳动物' },
    { code: '0303', description: '冻鱼', rate: 10, category: '鱼、甲壳动物' },
    { code: '0304', description: '鲜、冷、冻鱼肉片', rate: 10, category: '鱼、甲壳动物' },
    { code: '0306', description: '甲壳动物', rate: 10, category: '鱼、甲壳动物' },
    { code: '0401', description: '未浓缩的乳及奶油', rate: 15, category: '乳品、蛋品' },
    { code: '0402', description: '浓缩的乳及奶油', rate: 15, category: '乳品、蛋品' },
    { code: '0403', description: '酸乳、结块的乳', rate: 15, category: '乳品、蛋品' },
    { code: '0404', description: '乳清', rate: 15, category: '乳品、蛋品' },
    { code: '0405', description: '黄油及其他乳脂', rate: 15, category: '乳品、蛋品' },
    { code: '0406', description: '乳酪及凝乳', rate: 15, category: '乳品、蛋品' },
    { code: '0407', description: '带壳禽蛋', rate: 15, category: '乳品、蛋品' },
    { code: '0408', description: '去壳禽蛋', rate: 15, category: '乳品、蛋品' },
    { code: '0409', description: '天然蜂蜜', rate: 15, category: '乳品、蛋品' },
    { code: '0501', description: '未加工的人发', rate: 0, category: '其他动物产品' },
    { code: '0502', description: '猪、牛、马毛', rate: 0, category: '其他动物产品' },
    { code: '0601', description: '鳞茎、块茎', rate: 5, category: '活植物' },
    { code: '0602', description: '其他活植物', rate: 5, category: '活植物' },
    { code: '0603', description: '鲜、干的插花用花', rate: 5, category: '活植物' },
    { code: '0604', description: '制花用叶、枝', rate: 5, category: '活植物' },
    { code: '0701', description: '鲜、冷马铃薯', rate: 10, category: '食用蔬菜' },
    { code: '0702', description: '鲜、冷番茄', rate: 10, category: '食用蔬菜' },
    { code: '0703', description: '鲜、冷葱蒜', rate: 10, category: '食用蔬菜' },
    { code: '0704', description: '鲜、冷卷心菜', rate: 10, category: '食用蔬菜' },
    { code: '0705', description: '鲜、冷生菜', rate: 10, category: '食用蔬菜' },
    { code: '0706', description: '鲜、冷胡萝卜', rate: 10, category: '食用蔬菜' },
    { code: '0707', description: '鲜、冷黄瓜', rate: 10, category: '食用蔬菜' },
    { code: '0708', description: '鲜、冷豆类蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0709', description: '鲜、冷其他蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0710', description: '冷冻蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0711', description: '暂时保藏蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0712', description: '干蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0713', description: '干豆类蔬菜', rate: 10, category: '食用蔬菜' },
    { code: '0714', description: '木薯、甘薯', rate: 10, category: '食用蔬菜' },
    { code: '0801', description: '椰子、巴西果', rate: 8, category: '食用水果' },
    { code: '0802', description: '坚果', rate: 8, category: '食用水果' },
    { code: '0803', description: '鲜、干香蕉', rate: 8, category: '食用水果' },
    { code: '0804', description: '鲜、干枣、无花果', rate: 8, category: '食用水果' },
    { code: '0805', description: '柑橘属水果', rate: 8, category: '食用水果' },
    { code: '0806', description: '鲜、干葡萄', rate: 8, category: '食用水果' },
    { code: '0807', description: '鲜甜瓜、西瓜', rate: 8, category: '食用水果' },
    { code: '0808', description: '鲜苹果、梨、榅桲', rate: 8, category: '食用水果' },
    { code: '0809', description: '鲜杏、樱桃、桃、梅', rate: 8, category: '食用水果' },
    { code: '0810', description: '其他鲜果', rate: 8, category: '食用水果' },
    { code: '0811', description: '冷冻水果', rate: 8, category: '食用水果' },
    { code: '0812', description: '暂时保藏水果', rate: 8, category: '食用水果' },
    { code: '0813', description: '干果', rate: 8, category: '食用水果' },
    { code: '0814', description: '柑橘属水果皮', rate: 8, category: '食用水果' },
    { code: '0901', description: '咖啡', rate: 10, category: '咖啡、茶、香料' },
    { code: '0902', description: '茶', rate: 10, category: '咖啡、茶、香料' },
    { code: '0903', description: '马黛茶', rate: 10, category: '咖啡、茶、香料' },
    { code: '0904', description: '胡椒', rate: 10, category: '咖啡、茶、香料' },
    { code: '0905', description: '香草子', rate: 10, category: '咖啡、茶、香料' },
    { code: '0906', description: '肉桂', rate: 10, category: '咖啡、茶、香料' },
    { code: '0907', description: '丁香', rate: 10, category: '咖啡、茶、香料' },
    { code: '0908', description: '肉豆蔻', rate: 10, category: '咖啡、茶、香料' },
    { code: '0909', description: '茴香、芫荽', rate: 10, category: '咖啡、茶、香料' },
    { code: '0910', description: '姜、姜黄等', rate: 10, category: '咖啡、茶、香料' },
    { code: '1001', description: '小麦及混合麦', rate: 0, category: '谷物' },
    { code: '1002', description: '黑麦', rate: 0, category: '谷物' },
    { code: '1003', description: '大麦', rate: 0, category: '谷物' },
    { code: '1004', description: '燕麦', rate: 0, category: '谷物' },
    { code: '1005', description: '玉米', rate: 0, category: '谷物' },
    { code: '1006', description: '稻谷、大米', rate: 0, category: '谷物' },
    { code: '1007', description: '食用高粱', rate: 0, category: '谷物' },
    { code: '1008', description: '荞麦、谷子', rate: 0, category: '谷物' },
    { code: '1101', description: '小麦或混合麦的细粉', rate: 15, category: '制粉产品' },
    { code: '1102', description: '其他谷物细粉', rate: 15, category: '制粉产品' },
    { code: '1103', description: '谷物粗粉及团粒', rate: 15, category: '制粉产品' },
    { code: '1104', description: '经其他加工的谷物', rate: 15, category: '制粉产品' },
    { code: '1105', description: '马铃薯细粉', rate: 15, category: '制粉产品' },
    { code: '1106', description: '豆类细粉', rate: 15, category: '制粉产品' },
    { code: '1107', description: '麦芽', rate: 15, category: '制粉产品' },
    { code: '1108', description: '淀粉', rate: 15, category: '制粉产品' },
    { code: '1109', description: '小麦面筋', rate: 15, category: '制粉产品' },
    { code: '1201', description: '大豆', rate: 0, category: '油籽' },
    { code: '1202', description: '花生', rate: 0, category: '油籽' },
    { code: '1203', description: '干椰子肉', rate: 0, category: '油籽' },
    { code: '1204', description: '亚麻子', rate: 0, category: '油籽' },
    { code: '1205', description: '油菜子', rate: 0, category: '油籽' },
    { code: '1206', description: '葵花子', rate: 0, category: '油籽' },
    { code: '1207', description: '其他油籽', rate: 0, category: '油籽' },
    { code: '1208', description: '油籽细粉', rate: 0, category: '油籽' },
    { code: '1209', description: '种植用种子', rate: 0, category: '油籽' },
    { code: '1210', description: '鲜啤酒花', rate: 0, category: '油籽' },
    { code: '1211', description: '香料及药用植物', rate: 0, category: '油籽' },
    { code: '1212', description: '刺槐豆、海藻', rate: 0, category: '油籽' },
    { code: '1301', description: '虫胶、树胶', rate: 5, category: '植物液汁' },
    { code: '1302', description: '植物液汁及浸膏', rate: 5, category: '植物液汁' },
    { code: '1401', description: '编结用植物材料', rate: 0, category: '其他植物产品' },
    { code: '1402', description: '编结用填充料', rate: 0, category: '其他植物产品' },
    { code: '1403', description: '帚用植物材料', rate: 0, category: '其他植物产品' },
    { code: '1404', description: '未列名植物产品', rate: 0, category: '其他植物产品' },
    { code: '1501', description: '猪、家禽脂肪', rate: 10, category: '动植物油脂' },
    { code: '1502', description: '牛、羊脂肪', rate: 10, category: '动植物油脂' },
    { code: '1503', description: '液体猪油', rate: 10, category: '动植物油脂' },
    { code: '1504', description: '鱼、鲸油', rate: 10, category: '动植物油脂' },
    { code: '1505', description: '羊毛脂', rate: 10, category: '动植物油脂' },
    { code: '1507', description: '豆油', rate: 10, category: '动植物油脂' },
    { code: '1508', description: '花生油', rate: 10, category: '动植物油脂' },
    { code: '1509', description: '橄榄油', rate: 10, category: '动植物油脂' },
    { code: '1510', description: '其他橄榄油', rate: 10, category: '动植物油脂' },
    { code: '1511', description: '棕榈油', rate: 10, category: '动植物油脂' },
    { code: '1512', description: '葵花油、棉籽油', rate: 10, category: '动植物油脂' },
    { code: '1513', description: '椰子油、棕榈油', rate: 10, category: '动植物油脂' },
    { code: '1514', description: '菜籽油、芥子油', rate: 10, category: '动植物油脂' },
    { code: '1515', description: '其他固定植物油', rate: 10, category: '动植物油脂' },
    { code: '1516', description: '动植物油脂及其分离品', rate: 10, category: '动植物油脂' },
    { code: '1517', description: '人造黄油', rate: 10, category: '动植物油脂' },
    { code: '1518', description: '化学改性的油脂', rate: 10, category: '动植物油脂' },
    { code: '1520', description: '甘油', rate: 10, category: '动植物油脂' },
    { code: '1521', description: '植物蜡', rate: 10, category: '动植物油脂' },
    { code: '1522', description: '油脂加工残渣', rate: 10, category: '动植物油脂' },
  ];

  console.log(`Inserting ${hsCodes.length} HS codes...`);

  const values = hsCodes.map((c, i) => {
    const offset = i * 6;
    return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5}, $${offset+6})`;
  }).join(',');

  const params = hsCodes.flatMap(c => [c.code, c.description, c.rate, c.category, 2, null]);

  await client.query(
    `INSERT INTO hs_codes (code, description, "taxRate", category, level, "parentId") 
     VALUES ${values} 
     ON CONFLICT (code) DO NOTHING`,
    params
  );

  console.log('✅ HS codes seeded successfully');
  await client.end();
}

main().catch(console.error);
