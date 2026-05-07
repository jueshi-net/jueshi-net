'use client';

import { useState } from 'react';
import { Search, Package, Filter, Info, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';

interface ProductDecl {
  name: string;
  aliases: string[];
  nameEn: string;
  material: string;
  usage: string;
  riskLevel: 'normal' | 'needs-confirm' | 'high-risk' | 'restricted';
  sensitiveLabel: string;
  hsCandidates: string[];
  notes: string;
  officialUrl: string;
  thirdPartyUrl?: string;
}

const labelMap: Record<string, string> = {
  'normal': '普通货参考',
  'needs-confirm': '需确认属性',
  'high-risk': '高风险合规确认',
  'restricted': '明显受限或禁止风险',
};

const riskMap: Record<string, string> = {
  '坚果混合装': 'needs-confirm', '茶叶': 'needs-confirm', '蜂蜜': 'needs-confirm',
  '辣椒酱': 'needs-confirm', '大米': 'needs-confirm', '方便面': 'needs-confirm',
  '腊肉/香肠': 'restricted', '月饼': 'needs-confirm',
  '男士T恤': 'normal', '女士连衣裙': 'normal', '牛仔裤': 'normal',
  '运动鞋': 'normal', '皮鞋': 'normal', '双肩包': 'normal',
  '羽绒服': 'needs-confirm', '毛衣': 'normal',
  '手机壳': 'normal', '手机充电线': 'normal', '充电宝': 'high-risk',
  '手机屏幕保护膜': 'normal', '蓝牙耳机': 'needs-confirm', '智能手表': 'needs-confirm',
  '电饭煲': 'needs-confirm', '电热水壶': 'needs-confirm', '吹风机': 'needs-confirm',
  '空气炸锅': 'needs-confirm', '吸尘器': 'needs-confirm', '台灯': 'needs-confirm',
  '毛绒玩具': 'normal', '积木玩具': 'normal', '遥控车': 'needs-confirm', '拼图': 'normal',
  '办公椅': 'normal', '实木桌子': 'needs-confirm', '沙发': 'normal',
  '书架': 'needs-confirm',
  '口红': 'needs-confirm', '面霜/乳液': 'needs-confirm', '香水': 'high-risk',
  '面膜': 'needs-confirm',
  '维生素片': 'needs-confirm', '鱼油胶囊': 'needs-confirm', '蛋白粉': 'needs-confirm',
  '中性笔': 'normal', '笔记本': 'normal', '彩铅': 'normal',
  '菜刀': 'restricted', '炒锅': 'normal', '保温杯': 'normal', '餐具套装': 'normal',
  'LED灯泡': 'needs-confirm', '吊灯': 'normal',
  '毛巾': 'normal', '床上用品四件套': 'normal', '收纳箱': 'normal',
  '瑜伽垫': 'normal', '雨伞': 'normal', '太阳镜': 'normal',
  '手表': 'normal', '项链': 'normal', '眼镜框': 'normal', '行李箱': 'normal',
  '拖鞋': 'normal', '帽子': 'normal', '围巾': 'normal', '手套': 'normal',
  '皮带': 'normal', '袜子': 'normal', '内衣': 'normal', '睡衣': 'normal',
  '鼠标': 'normal', '键盘': 'normal', 'U盘': 'normal', '移动硬盘': 'normal',
  '路由器': 'needs-confirm', '插线板': 'needs-confirm', '电饭煲内胆': 'normal',
  '调料瓶套装': 'normal', '宠物食品': 'needs-confirm', '猫砂': 'normal',
  '婴儿奶粉': 'needs-confirm', '纸尿裤': 'normal', '儿童安全座椅': 'normal',
  '自行车': 'normal', '滑板车': 'high-risk', '瑜伽球': 'normal', '哑铃': 'normal',
  '吉他': 'needs-confirm', '电子琴': 'needs-confirm', '相框': 'needs-confirm',
  '蜡烛': 'normal', '香薰': 'needs-confirm', '干花': 'normal',
  '手机支架': 'normal', '笔记本电脑包': 'normal', '运动鞋垫': 'normal',
  '保温饭盒': 'normal', '车载充电器': 'needs-confirm', '电热毯': 'needs-confirm',
  '手机数据线': 'normal',
};

const mk = (name: string, aliases: string[], nameEn: string, material: string, usage: string, hsCandidates: string[], notes: string, thirdPartyUrl?: string): ProductDecl => {
  const risk = riskMap[name] || 'normal';
  return { name, aliases, nameEn, material, usage, riskLevel: risk as ProductDecl['riskLevel'], sensitiveLabel: labelMap[risk], hsCandidates, notes, officialUrl: 'https://www.customs.gov.cn', thirdPartyUrl };
};

const commonProducts: ProductDecl[] = [
  mk("坚果混合装", ["混合坚果", "坚果礼盒"], "Mixed Nuts", "坚果", "食用", ["2008.19", "0802.90"], "需原厂包装，标注保质期，部分国家需食品标签翻译"),
  mk("茶叶", ["绿茶", "红茶", "普洱茶"], "Tea Leaves", "茶叶", "冲泡饮用", ["0902.10", "0902.20"], "部分国家对茶叶进口有农残检测要求"),
  mk("蜂蜜", ["天然蜂蜜"], "Honey", "蜂蜜", "食用", ["0409.00"], "液体+食品双重敏感，需密封包装"),
  mk("辣椒酱", ["老干妈", "调味酱"], "Chili Sauce", "辣椒/植物油", "调味", ["2103.90"], "含液体+食品，需标注成分和保质期"),
  mk("大米", ["东北大米", "泰国香米"], "Rice", "谷物", "食用", ["1006.30", "1006.10"], "部分国家对大米进口有检疫要求"),
  mk("方便面", ["泡面", "速食面"], "Instant Noodles", "面粉/调味料", "速食", ["1902.30"], "调味料包可能含肉类成分，需向服务商确认"),
  mk("腊肉/香肠", ["腊肠", "风干肉"], "Cured Sausage", "猪肉", "食用", ["1601.00"], "多数国家严禁肉类入境，如不符合目的国法规请勿寄送"),
  mk("月饼", ["中秋月饼"], "Mooncake", "面粉/馅料", "食用", ["1905.90"], "含蛋黄/肉类馅料的月饼多数国家禁止进口，需提前确认"),
  mk("男士T恤", ["短袖T恤", "棉T恤"], "Men's T-shirt", "棉/涤纶", "穿着", ["6109.10", "6109.90"], "针织棉制归6109.10，化纤制归6109.90"),
  mk("女士连衣裙", ["裙子", "长裙"], "Women's Dress", "棉/丝绸/化纤", "穿着", ["6204.42", "6204.43", "6204.44"], "棉制归6204.42，化纤制归6204.43"),
  mk("牛仔裤", ["牛仔长裤"], "Jeans", "牛仔布（棉）", "穿着", ["6203.42", "6204.62"], "男裤归6203.42，女裤归6204.62"),
  mk("运动鞋", ["跑步鞋", "篮球鞋"], "Sports Shoes", "橡胶/织物", "运动穿着", ["6404.11", "6404.19"], "运动鞋面多为织物，归6404.11或6404.19"),
  mk("皮鞋", ["真皮鞋", "高跟鞋"], "Leather Shoes", "真皮", "穿着", ["6403.91", "6403.99"], "真皮鞋归6403，注意区分运动鞋和皮鞋"),
  mk("双肩包", ["背包", "书包"], "Backpack", "涤纶/尼龙", "携带物品", ["4202.12", "4202.92"], "书包归4202.12，其他包归4202.92"),
  mk("羽绒服", ["羽绒外套"], "Down Jacket", "羽绒/尼龙", "保暖穿着", ["6201.93", "6202.93"], "羽绒制品可能需要检疫证明，需向服务商确认"),
  mk("毛衣", ["针织衫", "羊毛衫"], "Sweater", "羊毛/棉", "穿着", ["6110.11", "6110.20"], "羊毛制归6110.11，棉制归6110.20"),
  mk("手机壳", ["手机保护壳"], "Phone Case", "TPU/硅胶/PC", "手机保护", ["3926.90", "4202.99"], "硅胶/塑料壳归3926.90，皮革壳归4202.99"),
  mk("手机充电线", ["数据线", "USB线"], "USB Cable", "铜线/塑料", "充电/数据传输", ["8544.42"], "带插头的电缆归8544.42"),
  mk("充电宝", ["移动电源", "便携充电器"], "Power Bank", "锂电池/塑料", "充电", ["8507.60"], "锂电池产品，需提供UN38.3测试报告，需提前确认"),
  mk("手机屏幕保护膜", ["钢化膜", "手机贴膜"], "Screen Protector", "钢化玻璃/PET", "屏幕保护", ["7007.19", "3920.62"], "钢化玻璃归7007.19，PET膜归3920.62"),
  mk("蓝牙耳机", ["无线耳机", "AirPods"], "Bluetooth Earphones", "塑料/电子元件", "音频播放", ["8518.30"], "含锂电池，需UN38.3报告，需向服务商确认"),
  mk("智能手表", ["Apple Watch", "运动手表"], "Smart Watch", "金属/玻璃/电子", "穿戴设备", ["9102.11", "8517.62"], "功能偏向通信归8517.62，偏向计时归9102，需确认属性"),
  mk("电饭煲", ["电饭锅"], "Rice Cooker", "金属/塑料", "煮饭", ["8516.72"], "电热厨房器具归8516.72，需确认是否含锂电池"),
  mk("电热水壶", ["烧水壶"], "Electric Kettle", "不锈钢/塑料", "烧水", ["8516.71"], "电热液体加热器归8516.71"),
  mk("吹风机", ["电吹风"], "Hair Dryer", "塑料/电机", "吹干头发", ["8516.31"], "电热理发器具归8516.31"),
  mk("空气炸锅", ["空气炸锅"], "Air Fryer", "金属/塑料", "烹饪", ["8516.60"], "电热厨房器具归8516.60"),
  mk("吸尘器", ["手持吸尘器"], "Vacuum Cleaner", "塑料/电机", "清洁", ["8508.11"], "家用吸尘器归8508.11"),
  mk("台灯", ["LED台灯"], "Desk Lamp", "金属/LED", "照明", ["9405.21", "9405.42"], "LED灯归9405.21或9405.42"),
  mk("毛绒玩具", ["公仔", "布偶"], "Plush Toy", "毛绒/棉花填充", "儿童玩具", ["9503.00"], "玩具归9503，需注意目的国玩具安全标准"),
  mk("积木玩具", ["乐高", "拼装积木"], "Building Blocks", "塑料", "儿童玩具", ["9503.00"], "玩具归9503，塑料积木注意材质说明"),
  mk("遥控车", ["RC车", "遥控玩具"], "RC Car", "塑料/电机/电池", "玩具", ["9503.00"], "含电池，需UN38.3报告，同时归类为玩具，需向服务商确认"),
  mk("拼图", ["益智拼图"], "Puzzle", "纸板/木头", "益智玩具", ["9503.00", "4911.99"], "纸质拼图可能归4911.99或9503.00"),
  mk("办公椅", ["电脑椅", "电竞椅"], "Office Chair", "金属/网布/皮革", "办公/家用", ["9401.71", "9401.79"], "有扶手金属框架归9401.71，无扶手归9401.79"),
  mk("实木桌子", ["书桌", "餐桌"], "Wooden Table", "实木", "家用", ["9403.30", "9403.60"], "木制家具归9403.30或9403.60，需熏蒸证明，需确认属性"),
  mk("沙发", ["布艺沙发", "皮沙发"], "Sofa", "木架/海绵/布料", "家用", ["9401.41", "9401.61"], "大件家具通常走海运，按CBM计费"),
  mk("书架", ["置物架"], "Bookshelf", "木材/金属", "收纳", ["9403.30", "9403.60"], "木制归9403.30/60，需熏蒸证明"),
  mk("口红", ["唇膏", "润唇膏"], "Lipstick", "蜡/色素/油脂", "化妆", ["3304.10"], "唇用化妆品归3304.10，含液体需确认渠道"),
  mk("面霜/乳液", ["保湿霜", "护肤乳"], "Face Cream", "水/油脂/活性成分", "护肤", ["3304.91", "3304.99"], "粉末归3304.91，其他归3304.99"),
  mk("香水", ["古龙水"], "Perfume", "酒精/香精", "香氛", ["3303.00"], "含酒精液体，航空运输严格限制，需高风险合规确认"),
  mk("面膜", ["贴片面膜"], "Facial Mask", "无纺布/精华液", "护肤", ["3304.99"], "含精华液，按液体化妆品处理"),
  mk("维生素片", ["综合维生素"], "Vitamin Tablets", "维生素/辅料", "膳食补充", ["2936.27", "2106.90"], "单一维生素归2936，混合制剂归2106.90，需向服务商确认"),
  mk("鱼油胶囊", ["深海鱼油"], "Fish Oil Capsules", "鱼油/明胶", "膳食补充", ["1504.20", "2106.90"], "纯鱼油归1504.20，胶囊制剂归2106.90，需确认属性"),
  mk("蛋白粉", ["乳清蛋白"], "Protein Powder", "乳清蛋白", "运动营养", ["0404.60", "2106.10"], "粉末状物品，通常需提供成分证明，需向服务商确认"),
  mk("中性笔", ["签字笔", "水笔"], "Gel Pen", "塑料/墨水", "书写", ["9608.10"], "圆珠笔/中性笔归9608.10"),
  mk("笔记本", ["记事本"], "Notebook", "纸张/纸板", "书写", ["4820.10"], "纸质笔记本归4820.10"),
  mk("彩铅", ["彩色铅笔"], "Colored Pencils", "木材/颜料芯", "绘画", ["9609.10"], "铅笔归9609.10"),
  mk("菜刀", ["厨房刀"], "Kitchen Knife", "不锈钢", "切割食材", ["8211.91", "8211.92"], "刀具属敏感货，部分国家严格限制，如不符合目的国法规请勿寄送"),
  mk("炒锅", ["铁锅", "不粘锅"], "Wok", "铁/不粘涂层", "烹饪", ["7323.93", "7323.94"], "不锈钢锅归7323.93，搪瓷/不粘归7323.94"),
  mk("保温杯", ["保温水壶"], "Thermos", "不锈钢", "保温饮品", ["7323.95", "9617.00"], "真空保温容器归9617.00"),
  mk("餐具套装", ["碗筷套装"], "Tableware Set", "陶瓷/不锈钢", "用餐", ["6911.10", "7323.93"], "陶瓷归6911.10，不锈钢归7323.93"),
  mk("LED灯泡", ["节能灯泡"], "LED Bulb", "铝/LED芯片/塑料", "照明", ["8539.51", "8539.52"], "LED灯归8539.51或8539.52"),
  mk("吊灯", ["客厅吊灯"], "Chandelier", "金属/玻璃", "照明装饰", ["9405.10"], "电气吊灯归9405.10"),
  mk("毛巾", ["浴巾"], "Towel", "棉", "清洁/沐浴", ["6302.60"], "棉制毛巾归6302.60"),
  mk("床上用品四件套", ["床单被套"], "Bedding Set", "棉/涤纶", "床上用品", ["6302.21", "6302.22"], "棉制印花归6302.21，化纤制归6302.22"),
  mk("收纳箱", ["整理箱"], "Storage Box", "塑料/布料", "收纳", ["3924.90", "4202.99"], "塑料归3924.90，布制归4202.99"),
  mk("瑜伽垫", ["健身垫"], "Yoga Mat", "TPE/橡胶", "健身", ["9506.91", "4016.93"], "健身器材归9506.91，橡胶垫归4016.93"),
  mk("雨伞", ["折叠伞"], "Umbrella", "金属/涤纶布", "防雨", ["6601.91", "6601.99"], "折叠伞归6601.91，其他伞归6601.99"),
  mk("太阳镜", ["墨镜"], "Sunglasses", "金属/树脂", "遮阳/防护", ["9004.10"], "太阳镜归9004.10"),
  mk("手表", ["石英表", "机械表"], "Watch", "金属/玻璃", "计时/装饰", ["9102.11", "9102.19", "9102.21"], "电动归9102.11，机械归9102.21"),
  mk("项链", ["吊坠项链"], "Necklace", "金属/宝石", "装饰", ["7113.11", "7113.19", "7117.19"], "贵金属归7113，仿首饰归7117"),
  mk("眼镜框", ["近视眼镜框"], "Eyeglass Frame", "金属/塑料", "视力矫正", ["9003.11", "9003.19"], "塑料框归9003.11，金属框归9003.19"),
  mk("行李箱", ["旅行箱", "拉杆箱"], "Suitcase", "PC/ABS/布料", "旅行", ["4202.11", "4202.12"], "真皮归4202.11，塑料/布料归4202.12"),
  mk("拖鞋", ["凉拖", "浴室拖鞋"], "Slippers", "EVA/塑料/橡胶", "穿着", ["6402.91", "6402.99"], "塑料拖鞋归6402.91或6402.99"),
  mk("帽子", ["棒球帽", "渔夫帽"], "Cap", "棉/涤纶", "遮阳/装饰", ["6505.00"], "针织帽子归6505.00"),
  mk("围巾", ["丝巾"], "Scarf", "丝绸/羊毛/棉", "保暖/装饰", ["6213.10", "6213.20", "6213.90"], "丝绸归6213.10，棉制归6213.20"),
  mk("手套", ["棉手套", "皮手套"], "Gloves", "棉/皮革", "保暖/防护", ["6216.00"], "非针织手套归6216.00"),
  mk("皮带", ["腰带", "真皮腰带"], "Belt", "皮革", "装饰/固定", ["4203.30"], "皮革腰带归4203.30"),
  mk("袜子", ["棉袜", "丝袜"], "Socks", "棉/尼龙", "穿着", ["6115.93", "6115.96"], "合成纤维归6115.93，其他归6115.96"),
  mk("内衣", ["文胸", "内裤"], "Underwear", "棉/蕾丝", "穿着", ["6212.10", "6212.20", "6212.30"], "文胸归6212.10，束腰归6212.20"),
  mk("睡衣", ["家居服"], "Pajamas", "棉/丝绸", "睡眠", ["6207.21", "6208.21"], "男睡衣归6207.21，女睡衣归6208.21"),
  mk("鼠标", ["无线鼠标"], "Mouse", "塑料/电子元件", "电脑配件", ["8471.60"], "电脑输入设备归8471.60"),
  mk("键盘", ["机械键盘"], "Keyboard", "塑料/金属/电子", "电脑配件", ["8471.60"], "电脑输入设备归8471.60"),
  mk("U盘", ["优盘", "闪存盘"], "USB Flash Drive", "金属/电子元件", "数据存储", ["8523.51"], "固态存储设备归8523.51"),
  mk("移动硬盘", ["外置硬盘"], "External Hard Drive", "金属/电子元件", "数据存储", ["8471.70"], "存储设备归8471.70"),
  mk("路由器", ["WiFi路由器"], "Router", "塑料/电子元件", "网络连接", ["8517.62"], "网络通信设备归8517.62，需确认属性"),
  mk("插线板", ["排插", "电源插座"], "Power Strip", "塑料/铜线", "电源扩展", ["8536.69"], "插头插座归8536.69，需确认电压标准"),
  mk("电饭煲内胆", ["锅胆"], "Rice Cooker Inner Pot", "铝合金/涂层", "烹饪配件", ["7615.10"], "铝制家用器皿归7615.10"),
  mk("调料瓶套装", ["调味罐"], "Spice Jar Set", "玻璃/塑料", "厨房收纳", ["7010.90", "3924.90"], "玻璃归7010.90，塑料归3924.90"),
  mk("宠物食品", ["猫粮", "狗粮"], "Pet Food", "肉类/谷物", "宠物食用", ["2309.10", "2309.90"], "宠物食品归2309，含肉类成分可能被严格限制，需向服务商确认"),
  mk("猫砂", ["膨润土猫砂"], "Cat Litter", "膨润土/豆腐渣", "宠物用品", ["2508.40", "2309.90"], "矿物猫砂归2508.40，豆腐猫砂归2309.90"),
  mk("婴儿奶粉", ["配方奶粉"], "Baby Formula", "乳粉/营养添加剂", "婴儿食用", ["1901.10"], "婴儿食品归1901.10，部分国家对进口量有严格限制，需向服务商确认"),
  mk("纸尿裤", ["婴儿尿不湿"], "Baby Diapers", "无纺布/高分子吸水树脂", "婴儿用品", ["9619.00"], "卫生用品归9619.00"),
  mk("儿童安全座椅", ["汽车安全座椅"], "Car Safety Seat", "塑料/织物/金属", "儿童乘车安全", ["9401.80"], "大件物品，通常需海运"),
  mk("自行车", ["山地车", "公路车"], "Bicycle", "金属/橡胶", "出行", ["8712.00"], "自行车归8712.00，大件走海运"),
  mk("滑板车", ["电动滑板车"], "Electric Scooter", "金属/锂电池", "出行", ["8711.60"], "电动归8711.60，含大电池海运限制严格，需高风险合规确认"),
  mk("瑜伽球", ["健身球"], "Exercise Ball", "PVC/橡胶", "健身", ["9506.91"], "健身器材归9506.91"),
  mk("哑铃", ["健身哑铃"], "Dumbbell", "铸铁/橡胶", "健身", ["9506.91"], "重货按重量计费，建议海运"),
  mk("吉他", ["民谣吉他", "电吉他"], "Guitar", "木材/金属", "乐器", ["9201.10", "9201.20"], "木制乐器需熏蒸证明，电吉他归9201.20"),
  mk("电子琴", ["电钢琴"], "Electric Piano", "塑料/电子元件", "乐器", ["9207.10"], "电气乐器归9207.10"),
  mk("相框", ["照片框"], "Photo Frame", "木材/金属/塑料", "装饰", ["4414.00", "8306.29"], "木制归4414.00，金属归8306.29，需确认属性"),
  mk("蜡烛", ["香薰蜡烛"], "Candle", "石蜡/大豆蜡", "照明/香氛", ["3406.00"], "蜡烛归3406.00"),
  mk("香薰", ["精油", "香薰精油"], "Essential Oil", "植物精油", "香氛", ["3301.29"], "精油属液体+可能含酒精，需向服务商确认"),
  mk("干花", ["仿真花"], "Dried Flowers", "干花/人造材料", "装饰", ["0603.90", "6702.10"], "真干花归0603.90，仿真花归6702.10"),
  mk("手机支架", ["桌面支架", "车载支架"], "Phone Holder", "塑料/金属", "手机固定", ["8517.79", "3926.90"], "通用支架归3926.90或8517.79"),
  mk("笔记本电脑包", ["电脑内胆包"], "Laptop Bag", "尼龙/皮革", "携带电脑", ["4202.12", "4202.92"], "背包式归4202.12，内胆套归4202.92"),
  mk("运动鞋垫", ["鞋垫"], "Insoles", "EVA/海绵", "鞋内垫", ["9506.99", "3926.90"], "运动类归9506.99，通用归3926.90"),
  mk("保温饭盒", ["便当盒"], "Insulated Lunch Box", "不锈钢/塑料", "携带食物", ["7323.95", "3924.10"], "不锈钢归7323.95，塑料归3924.10"),
  mk("车载充电器", ["车用充电头"], "Car Charger", "塑料/电子元件", "车载充电", ["8504.40"], "静止式变流器归8504.40"),
  mk("电热毯", ["电暖毯"], "Electric Blanket", "布料/电热丝", "取暖", ["6306.12", "8516.29"], "电加热制品归8516.29"),
  mk("手机数据线", ["Lightning线", "Type-C线"], "Phone Data Cable", "铜线/塑料", "充电/数据传输", ["8544.42"], "带接头电缆归8544.42，需确认接口类型"),
];

export default function HSCodePage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState('all');

  const filtered = commonProducts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.aliases.some(a => a.toLowerCase().includes(q));
    const matchRisk = filterRisk === 'all' || p.riskLevel === filterRisk;
    return matchSearch && matchRisk;
  });

  const getRiskColor = (risk: string) => {
    const map: Record<string, string> = {
      normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'needs-confirm': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'high-risk': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      restricted: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return map[risk] || map.normal;
  };

  const getRiskEmoji = (risk: string) => {
    const map: Record<string, string> = { normal: '🟢', 'needs-confirm': '🟡', 'high-risk': '🟠', restricted: '🔴' };
    return map[risk] || '🟢';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">商品申报名称参考</h1>
          <p className="text-lg text-teal-100">常见商品英文申报名、HS编码候选、申报注意事项速查</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>HS编码仅供辅助查询，最终以海关、报关行或官方税则为准。</strong>
            本工具列出的编码为常见候选，实际归类需结合商品材质、用途、加工工艺等综合判断。
            各国可在6位HS编码基础上扩展至8-10位。
          </p>
        </div>

        {/* Risk level disclaimer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            风险等级仅供跨境寄送和申报准备参考，不代表任何物流服务商的接货规则。
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input className="w-full pl-10 pr-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="搜索商品名称（中文/英文/别名）..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
              className="px-4 py-2.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">全部商品</option>
              <option value="normal">仅普通货参考</option>
              <option value="needs-confirm">仅需要确认属性</option>
              <option value="high-risk">仅高风险合规</option>
              <option value="restricted">仅受限/禁止风险</option>
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-2">共 {commonProducts.length} 个常用商品，当前显示 {filtered.length} 个</p>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const id = `product-${i}`;
            const isExpanded = expandedId === id;
            return (
              <div key={id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() => setExpandedId(isExpanded ? null : id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{getRiskEmoji(p.riskLevel)}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskColor(p.riskLevel)}`}>
                      {p.sensitiveLabel}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t dark:border-gray-700 pt-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">别名</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.aliases.join(' / ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">英文申报名</p>
                        <p className="text-sm font-mono text-blue-600 dark:text-blue-400">{p.nameEn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">材质</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.material}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">用途</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{p.usage}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">HS 候选编码</p>
                      <div className="flex flex-wrap gap-2">
                        {p.hsCandidates.map((h, j) => (
                          <span key={j} className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-mono rounded-md">{h}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">申报注意事项</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">{p.notes}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <a href={p.officialUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700">
                        <ExternalLink className="w-3 h-3" /> 前往官方税则核验
                      </a>
                      {p.thirdPartyUrl && (
                        <a href={p.thirdPartyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-3 h-3" /> 第三方参考入口
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">未找到匹配的商品，试试其他关键词</p>
          </div>
        )}

        {/* Government sources */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-green-600" />
            各国官方 HS 编码查询入口
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "中国海关总署", url: "https://www.customs.gov.cn", label: "中国税则查询" },
              { name: "中国国际贸易单一窗口", url: "https://www.singlewindow.cn", label: "报关查询" },
              { name: "美国 USITC HTS", url: "https://hts.usitc.gov/", label: "Harmonized Tariff Schedule" },
              { name: "加拿大 CBSA", url: "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2024/html-eng.html", label: "Customs Tariff" },
              { name: "英国 Trade Tariff", url: "https://www.trade-tariff.service.gov.uk/", label: "UK Trade Tariff" },
              { name: "欧盟 TARIC", url: "https://ec.europa.eu/taxation_customs/dds2/taric/taric_consultation.jsp?Lang=en", label: "TARIC Database" },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Source info */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📚 数据来源与说明</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div><p className="font-medium">来源</p><p>常用商品申报经验汇总</p></div>
            <div><p className="font-medium">版本</p><p>2026 年 HS 编码体系</p></div>
            <div><p className="font-medium">更新</p><p>随海关税则调整持续更新</p></div>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
            第三方查询（如 hscode.net）仅供快速参考，最终以目的国海关、报关行或官方税则为准。
          </p>
        </div>

        <RelatedGuidesSection slugs={["hs-code-beginner-guide", "commercial-invoice-how-to-fill"]} />
      </div>
    </div>
  );
}
