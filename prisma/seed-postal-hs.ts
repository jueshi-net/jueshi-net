// Seed script for Postal Codes and HS Codes
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const prisma = new PrismaClient();

// ===== 中国邮编数据 (精选主要城市) =====
const chinaPostalCodes = [
  // 北京
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '东城区', postalCode: '100010', areaName: 'Dongcheng' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '西城区', postalCode: '100032', areaName: 'Xicheng' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '朝阳区', postalCode: '100020', areaName: 'Chaoyang' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '海淀区', postalCode: '100080', areaName: 'Haidian' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '丰台区', postalCode: '100071', areaName: 'Fengtai' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '通州区', postalCode: '101149', areaName: 'Tongzhou' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '昌平区', postalCode: '102200', areaName: 'Changping' },
  { country: 'CN', countryCode: '86', province: '北京', city: '北京', district: '大兴区', postalCode: '102600', areaName: 'Daxing' },
  // 上海
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '黄浦区', postalCode: '200001', areaName: 'Huangpu' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '徐汇区', postalCode: '200030', areaName: 'Xuhui' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '长宁区', postalCode: '200050', areaName: 'Changning' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '静安区', postalCode: '200040', areaName: 'Jingan' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '普陀区', postalCode: '200333', areaName: 'Putuo' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '虹口区', postalCode: '200080', areaName: 'Hongkou' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '杨浦区', postalCode: '200090', areaName: 'Yangpu' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '浦东新区', postalCode: '200120', areaName: 'Pudong' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '闵行区', postalCode: '201100', areaName: 'Minhang' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '宝山区', postalCode: '201900', areaName: 'Baoshan' },
  { country: 'CN', countryCode: '86', province: '上海', city: '上海', district: '嘉定区', postalCode: '201800', areaName: 'Jiading' },
  // 广东
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '天河区', postalCode: '510000', areaName: 'Tianhe' },
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '越秀区', postalCode: '510030', areaName: 'Yuexiu' },
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '海珠区', postalCode: '510220', areaName: 'Haizhu' },
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '荔湾区', postalCode: '510140', areaName: 'Liwan' },
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '白云区', postalCode: '510400', areaName: 'Baiyun' },
  { country: 'CN', countryCode: '86', province: '广东', city: '广州', district: '黄埔区', postalCode: '510700', areaName: 'Huangpu' },
  { country: 'CN', countryCode: '86', province: '广东', city: '深圳', district: '福田区', postalCode: '518000', areaName: 'Futian' },
  { country: 'CN', countryCode: '86', province: '广东', city: '深圳', district: '罗湖区', postalCode: '518001', areaName: 'Luohu' },
  { country: 'CN', countryCode: '86', province: '广东', city: '深圳', district: '南山区', postalCode: '518000', areaName: 'Nanshan' },
  { country: 'CN', countryCode: '86', province: '广东', city: '深圳', district: '宝安区', postalCode: '518100', areaName: 'Baoan' },
  { country: 'CN', countryCode: '86', province: '广东', city: '深圳', district: '龙岗区', postalCode: '518172', areaName: 'Longgang' },
  { country: 'CN', countryCode: '86', province: '广东', city: '东莞', district: '东莞市', postalCode: '523000', areaName: 'Dongguan' },
  // 浙江
  { country: 'CN', countryCode: '86', province: '浙江', city: '杭州', district: '上城区', postalCode: '310000', areaName: 'Shangcheng' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '杭州', district: '拱墅区', postalCode: '310000', areaName: 'Gongshu' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '杭州', district: '西湖区', postalCode: '310000', areaName: 'Xihu' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '杭州', district: '滨江区', postalCode: '310051', areaName: 'Binjiang' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '宁波', district: '海曙区', postalCode: '315000', areaName: 'Haishu' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '宁波', district: '江北区', postalCode: '315020', areaName: 'Jiangbei' },
  { country: 'CN', countryCode: '86', province: '浙江', city: '义乌', district: '义乌市', postalCode: '322000', areaName: 'Yiwu' },
  // 江苏
  { country: 'CN', countryCode: '86', province: '江苏', city: '南京', district: '玄武区', postalCode: '210000', areaName: 'Xuanwu' },
  { country: 'CN', countryCode: '86', province: '江苏', city: '南京', district: '秦淮区', postalCode: '210001', areaName: 'Qinhuai' },
  { country: 'CN', countryCode: '86', province: '江苏', city: '南京', district: '建邺区', postalCode: '210019', areaName: 'Jianye' },
  { country: 'CN', countryCode: '86', province: '江苏', city: '苏州', district: '姑苏区', postalCode: '215000', areaName: 'Gusu' },
  { country: 'CN', countryCode: '86', province: '江苏', city: '苏州', district: '工业园区', postalCode: '215021', areaName: 'SIP' },
  // 其他主要城市
  { country: 'CN', countryCode: '86', province: '天津', city: '天津', district: '和平区', postalCode: '300041', areaName: 'Heping' },
  { country: 'CN', countryCode: '86', province: '重庆', city: '重庆', district: '渝中区', postalCode: '400010', areaName: 'Yuzhong' },
  { country: 'CN', countryCode: '86', province: '四川', city: '成都', district: '锦江区', postalCode: '610000', areaName: 'Jinjiang' },
  { country: 'CN', countryCode: '86', province: '湖北', city: '武汉', district: '江岸区', postalCode: '430014', areaName: 'Jiang an' },
  { country: 'CN', countryCode: '86', province: '福建', city: '厦门', district: '思明区', postalCode: '361000', areaName: 'Siming' },
  { country: 'CN', countryCode: '86', province: '山东', city: '青岛', district: '市南区', postalCode: '266001', areaName: 'Shinan' },
  { country: 'CN', countryCode: '86', province: '河南', city: '郑州', district: '中原区', postalCode: '450000', areaName: 'Zhongyuan' },
  // 美国
  { country: 'US', countryCode: '1', province: 'New York', city: 'New York', district: 'Manhattan', postalCode: '10001', areaName: 'Manhattan' },
  { country: 'US', countryCode: '1', province: 'California', city: 'Los Angeles', district: 'Downtown', postalCode: '90001', areaName: 'Downtown LA' },
  { country: 'US', countryCode: '1', province: 'California', city: 'San Francisco', district: '', postalCode: '94102', areaName: 'SF' },
  { country: 'US', countryCode: '1', province: 'Texas', city: 'Houston', district: '', postalCode: '77001', areaName: 'Houston' },
  { country: 'US', countryCode: '1', province: 'Illinois', city: 'Chicago', district: '', postalCode: '60601', areaName: 'Chicago' },
  // 日本
  { country: 'JP', countryCode: '81', province: '东京', city: '东京', district: '千代田区', postalCode: '100-0001', areaName: 'Chiyoda' },
  { country: 'JP', countryCode: '81', province: '东京', city: '东京', district: '港区', postalCode: '105-0001', areaName: 'Minato' },
  { country: 'JP', countryCode: '81', province: '东京', city: '东京', district: '新宿区', postalCode: '160-0001', areaName: 'Shinjuku' },
  { country: 'JP', countryCode: '81', province: '大阪', city: '大阪', district: '中央区', postalCode: '540-0001', areaName: 'Chuo-ku' },
];

// ===== HS编码数据 (精选主要类别) =====
const hsCodes = [
  // 第1章: 活动物
  { code: '01', level: 2, description: '活动物', descriptionEn: 'Live animals', category: '01', taxRate: 0 },
  { code: '0101', level: 4, description: '马、驴、骡', descriptionEn: 'Live horses, asses, mules and hinnies', category: '01', taxRate: 0 },
  { code: '010121', level: 6, description: '改良种用马', descriptionEn: 'Pure-bred breeding animals', category: '01', taxRate: 0 },
  { code: '010129', level: 6, description: '其他马', descriptionEn: 'Other horses', category: '01', taxRate: 0 },
  
  // 第2章: 肉及食用杂碎
  { code: '02', level: 2, description: '肉及食用杂碎', descriptionEn: 'Meat and edible meat offal', category: '02', taxRate: 12 },
  { code: '0201', level: 4, description: '鲜、冷牛肉', descriptionEn: 'Meat of bovine animals, fresh or chilled', category: '02', taxRate: 12 },
  { code: '020110', level: 6, description: '整头及半头', descriptionEn: 'Carcasses and half-carcasses', category: '02', taxRate: 12 },
  { code: '020120', level: 6, description: '其他带骨割块', descriptionEn: 'Other cuts with bone in', category: '02', taxRate: 12 },
  { code: '020130', level: 6, description: '去骨牛肉', descriptionEn: 'Boneless', category: '02', taxRate: 12 },
  
  // 第3章: 鱼
  { code: '03', level: 2, description: '鱼、甲壳动物、软体动物', descriptionEn: 'Fish and crustaceans, molluscs', category: '03', taxRate: 7 },
  { code: '0301', level: 4, description: '活鱼', descriptionEn: 'Live fish', category: '03', taxRate: 7 },
  { code: '0302', level: 4, description: '鲜、冷鱼', descriptionEn: 'Fish, fresh or chilled', category: '03', taxRate: 7 },
  { code: '0303', level: 4, description: '冻鱼', descriptionEn: 'Fish, frozen', category: '03', taxRate: 7 },
  { code: '0306', level: 4, description: '甲壳动物', descriptionEn: 'Crustaceans', category: '03', taxRate: 7 },
  
  // 第7章: 食用蔬菜
  { code: '07', level: 2, description: '食用蔬菜、根及块茎', descriptionEn: 'Edible vegetables and certain roots and tubers', category: '07', taxRate: 13 },
  { code: '0701', level: 4, description: '鲜或冷藏马铃薯', descriptionEn: 'Potatoes, fresh or chilled', category: '07', taxRate: 13 },
  { code: '0702', level: 4, description: '鲜或冷藏番茄', descriptionEn: 'Tomatoes, fresh or chilled', category: '07', taxRate: 13 },
  { code: '0703', level: 4, description: '鲜或冷藏洋葱、大蒜', descriptionEn: 'Onions, garlic, fresh or chilled', category: '07', taxRate: 13 },
  
  // 第8章: 食用水果
  { code: '08', level: 2, description: '食用水果及坚果', descriptionEn: 'Edible fruit and nuts', category: '08', taxRate: 10 },
  { code: '0801', level: 4, description: '椰、巴西、腰果', descriptionEn: 'Coconuts, Brazil nuts and cashew nuts', category: '08', taxRate: 10 },
  { code: '0804', level: 4, description: '椰枣、无花果、菠萝', descriptionEn: 'Dates, figs, pineapples, avocados', category: '08', taxRate: 10 },
  { code: '0805', level: 4, description: '柑橘属水果', descriptionEn: 'Citrus fruit', category: '08', taxRate: 10 },
  { code: '0806', level: 4, description: '鲜或干的葡萄', descriptionEn: 'Grapes, fresh or dried', category: '08', taxRate: 10 },
  { code: '0810', level: 4, description: '其他鲜果', descriptionEn: 'Other fruit, fresh', category: '08', taxRate: 10 },
  
  // 第16章: 肉/鱼/甲壳制品
  { code: '16', level: 2, description: '肉、鱼、甲壳制品', descriptionEn: 'Preparations of meat, fish or crustaceans', category: '16', taxRate: 15 },
  { code: '1601', level: 4, description: '肉、杂碎香肠', descriptionEn: 'Sausages and similar products', category: '16', taxRate: 15 },
  { code: '1602', level: 4, description: '其他精制肉', descriptionEn: 'Other prepared or preserved meat', category: '16', taxRate: 15 },
  
  // 第22章: 饮料
  { code: '22', level: 2, description: '饮料、酒及醋', descriptionEn: 'Beverages, spirits and vinegar', category: '22', taxRate: 20 },
  { code: '2202', level: 4, description: '非酒精饮料', descriptionEn: 'Waters, mineral waters, soft drinks', category: '22', taxRate: 5 },
  { code: '2203', level: 4, description: '麦芽酿造啤酒', descriptionEn: 'Beer made from malt', category: '22', taxRate: 20 },
  { code: '2204', level: 4, description: '鲜葡萄酿造葡萄酒', descriptionEn: 'Wine of fresh grapes', category: '22', taxRate: 20 },
  { code: '2207', level: 4, description: '未变性乙醇', descriptionEn: 'Undenatured ethyl alcohol', category: '22', taxRate: 20 },
  
  // 第39章: 塑料及其制品
  { code: '39', level: 2, description: '塑料及其制品', descriptionEn: 'Plastics and articles thereof', category: '39', taxRate: 6.5 },
  { code: '3901', level: 4, description: '初级形状聚乙烯', descriptionEn: 'Polymers of ethylene, in primary forms', category: '39', taxRate: 6.5 },
  { code: '3902', level: 4, description: '初级形状聚丙烯', descriptionEn: 'Polymers of propylene, in primary forms', category: '39', taxRate: 6.5 },
  { code: '3903', level: 4, description: '初级形状聚苯乙烯', descriptionEn: 'Polymers of styrene, in primary forms', category: '39', taxRate: 6.5 },
  { code: '3907', level: 4, description: '初级形状聚缩醛', descriptionEn: 'Polyacetals, other polyethers', category: '39', taxRate: 6.5 },
  { code: '3923', level: 4, description: '供运输包装用塑料制品', descriptionEn: 'Articles for the conveyance or packing of goods', category: '39', taxRate: 6.5 },
  
  // 第61章: 针织服装
  { code: '61', level: 2, description: '针织或钩编服装', descriptionEn: 'Articles of apparel, knitted or crocheted', category: '61', taxRate: 10 },
  { code: '6101', level: 4, description: '针织男式大衣、防风衣', descriptionEn: 'Men\'s overcoats, car coats, capes', category: '61', taxRate: 10 },
  { code: '6103', level: 4, description: '针织男式西服套装', descriptionEn: 'Men\'s suits, ensembles', category: '61', taxRate: 10 },
  { code: '6104', level: 4, description: '针织女式西服套装', descriptionEn: 'Women\'s suits, ensembles', category: '61', taxRate: 10 },
  { code: '6109', level: 4, description: '针织T恤衫', descriptionEn: 'T-shirts, singlets and other vests', category: '61', taxRate: 10 },
  { code: '6110', level: 4, description: '针织套头衫、开襟衫', descriptionEn: 'Jerseys, pullovers, cardigans', category: '61', taxRate: 10 },
  
  // 第62章: 非针织服装
  { code: '62', level: 2, description: '非针织服装及衣着附件', descriptionEn: 'Articles of apparel, not knitted', category: '62', taxRate: 10 },
  { code: '6201', level: 4, description: '男式大衣、防风衣', descriptionEn: 'Men\'s overcoats, car coats', category: '62', taxRate: 10 },
  { code: '6203', level: 4, description: '男式西服套装', descriptionEn: 'Men\'s suits, ensembles', category: '62', taxRate: 10 },
  { code: '6204', level: 4, description: '女式西服套装', descriptionEn: 'Women\'s suits, ensembles', category: '62', taxRate: 10 },
  { code: '6205', level: 4, description: '男式衬衫', descriptionEn: 'Men\'s shirts', category: '62', taxRate: 10 },
  { code: '6206', level: 4, description: '女式衬衫', descriptionEn: 'Women\'s blouses, shirts', category: '62', taxRate: 10 },
  
  // 第84章: 机械
  { code: '84', level: 2, description: '核反应堆、锅炉、机器', descriptionEn: 'Nuclear reactors, boilers, machinery', category: '84', taxRate: 5 },
  { code: '8414', level: 4, description: '空气泵、真空泵', descriptionEn: 'Air or vacuum pumps', category: '84', taxRate: 5 },
  { code: '8415', level: 4, description: '空调设备', descriptionEn: 'Air conditioning machines', category: '84', taxRate: 5 },
  { code: '8418', level: 4, description: '制冷设备', descriptionEn: 'Refrigerators, freezers', category: '84', taxRate: 5 },
  { code: '8421', level: 4, description: '离心过滤设备', descriptionEn: 'Centrifuges, filtering machinery', category: '84', taxRate: 5 },
  { code: '8423', level: 4, description: '衡器', descriptionEn: 'Weighing machinery', category: '84', taxRate: 5 },
  { code: '8428', level: 4, description: '升降搬运机械', descriptionEn: 'Other lifting, handling machinery', category: '84', taxRate: 5 },
  { code: '8429', level: 4, description: '推土机、挖掘机', descriptionEn: 'Self-propelled bulldozers, excavators', category: '84', taxRate: 5 },
  { code: '8443', level: 4, description: '印刷设备', descriptionEn: 'Printing machinery', category: '84', taxRate: 5 },
  { code: '8471', level: 4, description: '自动数据处理设备', descriptionEn: 'Automatic data processing machines', category: '84', taxRate: 0 },
  { code: '847130', level: 6, description: '便携式电脑', descriptionEn: 'Portable digital processing machines', category: '84', taxRate: 0 },
  { code: '847141', level: 6, description: '其他电脑', descriptionEn: 'Other automatic data processing machines', category: '84', taxRate: 0 },
  { code: '8473', level: 4, description: '电脑零件附件', descriptionEn: 'Parts and accessories of machines', category: '84', taxRate: 0 },
  
  // 第85章: 电气设备
  { code: '85', level: 2, description: '电机、电气设备及其零件', descriptionEn: 'Electrical machinery and equipment', category: '85', taxRate: 5 },
  { code: '8501', level: 4, description: '电动机及发电机', descriptionEn: 'Electric motors and generators', category: '85', taxRate: 5 },
  { code: '8504', level: 4, description: '变压器、整流器', descriptionEn: 'Electrical transformers, static converters', category: '85', taxRate: 5 },
  { code: '8506', level: 4, description: '原电池及原电池组', descriptionEn: 'Primary cells and batteries', category: '85', taxRate: 5 },
  { code: '8507', level: 4, description: '蓄电池', descriptionEn: 'Electric accumulators', category: '85', taxRate: 5 },
  { code: '8516', level: 4, description: '电热水器、电热器', descriptionEn: 'Electric water heaters, heating appliances', category: '85', taxRate: 5 },
  { code: '8517', level: 4, description: '电话机、网络设备', descriptionEn: 'Telephone sets, network equipment', category: '85', taxRate: 0 },
  { code: '851712', level: 6, description: '手机', descriptionEn: 'Telephones for cellular networks', category: '85', taxRate: 0 },
  { code: '851762', level: 6, description: '接收转换设备', descriptionEn: 'Machines for reception, conversion of data', category: '85', taxRate: 0 },
  { code: '8523', level: 4, description: '录制媒体', descriptionEn: 'Discs, tapes, solid-state storage', category: '85', taxRate: 0 },
  { code: '8525', level: 4, description: '无线电设备', descriptionEn: 'Transmission apparatus for radio', category: '85', taxRate: 0 },
  { code: '8528', level: 4, description: '显示器、投影仪', descriptionEn: 'Monitors and projectors', category: '85', taxRate: 5 },
  { code: '8537', level: 4, description: '电力控制板', descriptionEn: 'Boards, panels for electric control', category: '85', taxRate: 5 },
  { code: '8542', level: 4, description: '集成电路', descriptionEn: 'Electronic integrated circuits', category: '85', taxRate: 0 },
  { code: '854231', level: 6, description: '处理器及控制器', descriptionEn: 'Processors and controllers', category: '85', taxRate: 0 },
  { code: '854232', level: 6, description: '存储器', descriptionEn: 'Memories', category: '85', taxRate: 0 },
  
  // 第87章: 车辆
  { code: '87', level: 2, description: '车辆及其零件', descriptionEn: 'Vehicles other than railway', category: '87', taxRate: 15 },
  { code: '8701', level: 4, description: '拖拉机', descriptionEn: 'Tractors', category: '87', taxRate: 15 },
  { code: '8703', level: 4, description: '载人机动车辆', descriptionEn: 'Motor cars and other vehicles for transport of persons', category: '87', taxRate: 15 },
  { code: '870321', level: 6, description: '1000cc以下汽油车', descriptionEn: 'Vehicles with spark-ignition engine <= 1000cc', category: '87', taxRate: 15 },
  { code: '870322', level: 6, description: '1000-1500cc汽油车', descriptionEn: 'Vehicles with spark-ignition engine 1000-1500cc', category: '87', taxRate: 15 },
  { code: '870323', level: 6, description: '1500-3000cc汽油车', descriptionEn: 'Vehicles with spark-ignition engine 1500-3000cc', category: '87', taxRate: 15 },
  { code: '870380', level: 6, description: '电动车', descriptionEn: 'Vehicles with only electric motor', category: '87', taxRate: 10 },
  { code: '8708', level: 4, description: '车辆零件附件', descriptionEn: 'Parts and accessories of vehicles', category: '87', taxRate: 10 },
  
  // 第90章: 光学/医疗仪器
  { code: '90', level: 2, description: '光学、医疗仪器', descriptionEn: 'Optical, medical instruments', category: '90', taxRate: 4 },
  { code: '9001', level: 4, description: '光学纤维、透镜', descriptionEn: 'Optical fibers, lenses, prisms', category: '90', taxRate: 4 },
  { code: '9002', level: 4, description: '已装配光学元件', descriptionEn: 'Lenses, prisms, mounted', category: '90', taxRate: 4 },
  { code: '9018', level: 4, description: '医疗仪器', descriptionEn: 'Medical instruments and appliances', category: '90', taxRate: 4 },
  { code: '9021', level: 4, description: '矫形器具', descriptionEn: 'Orthopedic appliances', category: '90', taxRate: 4 },
  { code: '9031', level: 4, description: '测量检验仪器', descriptionEn: 'Measuring or checking instruments', category: '90', taxRate: 4 },
];

async function main() {
  console.log('🚀 Seeding postal codes and HS codes...\n');

  // Seed postal codes
  console.log('📮 Inserting postal codes...');
  for (const pc of chinaPostalCodes) {
    await prisma.postalCode.upsert({
      where: { 
        country_postalCode: { country: pc.country, postalCode: pc.postalCode } 
      },
      update: pc,
      create: pc
    });
  }
  console.log(`✅ Inserted ${chinaPostalCodes.length} postal codes\n`);

  // Seed HS codes with hierarchy
  console.log('📦 Inserting HS codes...');
  const codeMap = new Map<string, string>(); // code -> id

  // First pass: create all records
  for (const hs of hsCodes) {
    const result = await prisma.hSCode.upsert({
      where: { code: hs.code },
      update: {
        description: hs.description,
        descriptionEn: hs.descriptionEn || null,
        taxRate: hs.taxRate || null,
        notes: (hs as any).notes || null,
      },
      create: {
        code: hs.code,
        level: hs.level,
        description: hs.description,
        descriptionEn: hs.descriptionEn || null,
        category: hs.category,
        taxRate: hs.taxRate || null,
        notes: (hs as any).notes || null,
      }
    });
    codeMap.set(hs.code, result.id);
  }

  // Second pass: set parent relationships
  for (const hs of hsCodes) {
    if (hs.code.length > 2) {
      const parentCode = hs.code.substring(0, hs.code.length - 2) || hs.code.substring(0, 2);
      const parentId = codeMap.get(parentCode);
      if (parentId && parentId !== codeMap.get(hs.code)) {
        await prisma.hSCode.update({
          where: { code: hs.code },
          data: { parentId }
        });
      }
    }
  }
  console.log(`✅ Inserted ${hsCodes.length} HS codes\n`);

  console.log('🎉 Seed complete!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
