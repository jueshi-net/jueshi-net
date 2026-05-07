// Seed script for Phase 2.3: Articles & Resources
// Run: npx tsx prisma/seed-phase2-3.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.env.DATABASE_URL ?? "postgresql://neondb_owner:npg_eL9DhSpQHZ5a@ep-morning-sun-amgb7w40-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";
const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

const articles = [
  {
    title: "海外华人常用包裹查询网站汇总",
    slug: "package-tracking-sites-guide",
    excerpt: "汇总全球主要邮政和快递公司官网查询入口，帮助海外华人快速追踪包裹状态。",
    content: `<h2>为什么要了解多个包裹查询网站？</h2>
<p>作为海外华人，无论是从国内网购商品寄到海外，还是从海外寄回中国，了解多个包裹查询网站都能帮助你更准确地掌握物流状态。不同的承运商使用不同的追踪系统，掌握这些网站的用法可以省去很多麻烦。</p>

<h2>中国邮政查询</h2>
<p>如果你的包裹通过中国邮政（China Post）发出，可以使用以下方式查询：</p>
<ul>
<li><strong>邮政EMS官网</strong>：支持EMS、e邮宝、e特快等产品的追踪查询</li>
<li><strong>11183邮政客服</strong>：国内拨打11183可查询中国邮政包裹状态</li>
<li>国际邮件通常以 <strong>E</strong>（EMS）、<strong>L</strong>（挂号信）、<strong>C/P/R</strong>（包裹）开头</li>
</ul>
<p>注意：国际包裹在离开中国后，追踪信息可能由目的国邮政更新，需要到目的国邮政官网继续查询。</p>

<h2>主要国际快递公司</h2>
<ul>
<li><strong>DHL</strong>：全球快递，运单号通常为10位数字。官网 dhl.com 提供详细追踪</li>
<li><strong>FedEx</strong>：美国总部，覆盖全球。运单号为12或15位数字。官网 fedex.com 可查</li>
<li><strong>UPS</strong>：联合包裹服务，运单号1Z开头+16位字符。官网 ups.com 可追踪</li>
<li><strong>TNT</strong>：已被FedEx收购，部分线路仍使用TNT品牌</li>
</ul>

<h2>各国邮政查询</h2>
<ul>
<li><strong>USPS</strong>（美国邮政）：usps.com，支持所有进入美国的国际包裹查询</li>
<li><strong>Royal Mail</strong>（英国皇家邮政）：royalmail.com，英国境内追踪</li>
<li><strong>Canada Post</strong>（加拿大邮政）：canadapost.ca，加拿大境内追踪</li>
<li><strong>Australia Post</strong>（澳洲邮政）：auspost.com.au，澳洲境内追踪</li>
<li><strong>La Poste</strong>（法国邮政）：laposte.fr</li>
<li><strong>Deutsche Post</strong>（德国邮政）：deutschepost.de</li>
</ul>

<h2>第三方聚合查询平台</h2>
<p>如果你不确定包裹是哪个承运商，可以使用第三方聚合平台：</p>
<ul>
<li><strong>17TRACK</strong>：支持全球600+承运商，自动识别快递公司和运单号格式</li>
<li><strong>AfterShip</strong>：另一款主流聚合追踪工具</li>
<li><strong>ParcelsApp</strong>：支持多承运商对比查询</li>
</ul>

<h2>使用建议</h2>
<ul>
<li>国际包裹查询有时会有 <strong>12-48小时的延迟</strong>，这是正常的</li>
<li>包裹清关阶段可能显示"等待处理"，通常需要1-5个工作日</li>
<li>如果运单号在所有平台都查不到，可能是<strong>单号尚未激活</strong>，建议联系发货方确认</li>
<li>本站工具页提供<strong>批量单号整理</strong>功能，帮你快速格式化运单号并跳转到对应承运商官网</li>
</ul>

<div class="callout">
<p>💡 <strong>提示</strong>：本站不保存物流轨迹，不提供承运服务。实际轨迹请以承运商或第三方查询平台为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["包裹追踪", "物流查询", "国际快递", "邮政"],
    seoTitle: "海外华人包裹查询网站汇总 - 快递追踪入口大全",
    seoDescription: "汇总中国邮政、USPS、DHL、FedEx、UPS等全球主要快递和邮政官网查询入口，附第三方聚合追踪平台推荐。",
    relatedTools: ["tracking"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "体积重怎么算？为什么轻货也可能很贵",
    slug: "volumetric-weight-explained",
    excerpt: "详解体积重（材积重）的计算方法，理解为什么看似很轻的包裹运费却很高。",
    content: `<h2>什么是体积重？</h2>
<p>体积重（Volumetric Weight / Dimensional Weight），也叫材积重，是国际快递和空运中用来衡量包裹"占用空间"的一种计费方式。快递公司不会只看包裹的实际重量，还要考虑它占用多少空间。</p>
<p>简单来说：<strong>一个很大的空箱子，虽然很轻，但占了很多空间，快递公司会按体积重来收费。</strong></p>

<h2>体积重的计算公式</h2>
<p>最常见的体积重计算公式：</p>
<div class="formula">
<p><strong>体积重（kg）= 长(cm) × 宽(cm) × 高(cm) ÷ 体积系数</strong></p>
</div>
<p>不同承运商使用不同的体积系数：</p>
<ul>
<li><strong>DHL / FedEx / UPS</strong>：÷ 5000（最常见的国际标准）</li>
<li><strong>部分空运专线</strong>：÷ 6000（相对宽松）</li>
<li><strong>部分海运专线</strong>：÷ 7000 或 8000（海运对体积不太敏感）</li>
</ul>

<h2>计费重量的确定</h2>
<p>快递公司会比较 <strong>实际重量</strong> 和 <strong>体积重量</strong>，取其中 <strong>较大者</strong> 作为计费重量：</p>
<ul>
<li>实际重量 5kg，体积重 3kg → 按 <strong>5kg</strong> 收费</li>
<li>实际重量 2kg，体积重 8kg → 按 <strong>8kg</strong> 收费 ← 这就是"轻货但很贵"的原因</li>
</ul>

<h2>实际案例</h2>
<p>假设你要寄一个大的毛绒玩具：</p>
<ul>
<li>包装尺寸：50cm × 40cm × 30cm</li>
<li>实际重量：1.5kg（很轻）</li>
<li>体积重：50 × 40 × 30 ÷ 5000 = <strong>12kg</strong></li>
<li>计费重量：<strong>12kg</strong>（按体积重收费）</li>
</ul>
<p>虽然毛绒玩具只有1.5kg，但运费要按12kg来算，这就是为什么轻货也可能很贵。</p>

<h2>如何减少体积重的影响？</h2>
<ul>
<li><strong>压缩包装</strong>：使用压缩袋减少衣物、被褥的体积</li>
<li><strong>拆除外包装</strong>：去掉商品不必要的纸盒和外包装</li>
<li><strong>合理摆放</strong>：多个物品尽量紧密摆放，减少空隙</li>
<li><strong>选择海运</strong>：海运的体积系数通常更大（÷ 7000+），对大体积物品更友好</li>
</ul>

<h2>使用本站工具</h2>
<p>本站提供<strong>运费估算器</strong>，可以帮你快速计算体积重和实际重量的比较，了解包裹的计费重量和费用构成。在寄件前先估算一下，做到心中有数。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站运费估算仅供参考，不构成任何物流服务商的报价或承诺。实际计费以承运商为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["体积重", "运费计算", "材积重", "快递费用"],
    seoTitle: "体积重怎么算？轻货为什么很贵 - 国际快递计费详解",
    seoDescription: "详解体积重/材积重的计算公式和计费逻辑，附带实际案例和省费技巧，帮你理解国际快递的计费方式。",
    relatedTools: ["shipping-estimator"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "CBM 是什么？海运方数怎么计算",
    slug: "cbm-shipping-volume-calculator",
    excerpt: "CBM是国际海运的核心计费单位，教你快速计算方数，理解LCL和FCL的区别。",
    content: `<h2>什么是 CBM？</h2>
<p>CBM 是 <strong>Cubic Meter</strong>（立方米）的缩写，中文也叫"方数"或"立方"。它是国际海运中最基本的体积计量单位，用来计算货物占用的空间大小。</p>
<p>1 CBM = 1立方米 = 1m × 1m × 1m = 100cm × 100cm × 100cm</p>

<h2>为什么 CBM 重要？</h2>
<p>在海运中，运费通常按 CBM 计算。无论是 LCL（拼箱货）还是 FCL（整箱货），CBM 都是决定运费的关键因素之一。</p>
<ul>
<li><strong>LCL（Less than Container Load）</strong>：拼箱运输，你的货物和其他人的货物共享一个集装箱，按 CBM 计费</li>
<li><strong>FCL（Full Container Load）</strong>：整箱运输，你租用整个集装箱，按箱型计费（20尺/40尺柜）</li>
</ul>

<h2>CBM 计算方法</h2>
<div class="formula">
<p><strong>CBM = 长(m) × 宽(m) × 高(m) × 箱数</strong></p>
</div>
<p>如果尺寸是厘米（cm），先换算成米（m）：</p>
<p><strong>CBM = 长(cm) × 宽(cm) × 高(cm) ÷ 1,000,000 × 箱数</strong></p>

<h2>实际计算案例</h2>
<p>你有3箱货物，每箱尺寸 60cm × 40cm × 50cm：</p>
<ul>
<li>单箱 CBM = 60 × 40 × 50 ÷ 1,000,000 = <strong>0.12 CBM</strong></li>
<li>总 CBM = 0.12 × 3 = <strong>0.36 CBM</strong></li>
</ul>
<p>0.36 CBM 属于典型的 LCL 拼箱货物，通常 LCL 最低起算 1 CBM。</p>

<h2>海运集装箱容量参考</h2>
<ul>
<li><strong>20尺柜（20GP）</strong>：约 28-33 CBM（实际装货空间）</li>
<li><strong>40尺柜（40GP）</strong>：约 58-68 CBM</li>
<li><strong>40尺高柜（40HQ）</strong>：约 68-78 CBM</li>
</ul>

<h2>CBM 与重量的关系</h2>
<p>海运也有"计费吨"（Revenue Ton）的概念：</p>
<ul>
<li>如果 <strong>1 CBM < 1吨</strong>：按 CBM 计费（轻货）</li>
<li>如果 <strong>1 CBM > 1吨</strong>：按吨计费（重货）</li>
<li>取较大者作为计费单位</li>
</ul>
<p>这类似于空运中的体积重概念。</p>

<h2>使用建议</h2>
<ul>
<li>在询价前就计算好 CBM，可以更准确地比较不同货代的报价</li>
<li>LCL 报价通常包含：海运费 + 起运港费用 + 目的港费用，不要只看海运费</li>
<li>本站<strong>运费估算器</strong>支持 CBM 的参考计算，帮你理解费用构成</li>
</ul>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站仅提供 CBM 计算参考，不提供海运报价或承运服务。实际运费请以货代报价为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["CBM", "方数计算", "海运", "LCL", "拼箱"],
    seoTitle: "CBM是什么？海运方数计算方法 - 立方米计算教程",
    seoDescription: "详解CBM（立方米/方数）的计算方法，LCL和FCL的区别，海运集装箱容量参考，帮你理解海运计费。",
    relatedTools: ["shipping-estimator"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "Commercial Invoice 商业发票怎么填",
    slug: "commercial-invoice-how-to-fill",
    excerpt: "手把手教你填写国际快递商业发票，包含必填字段、常见错误和填写模板。",
    content: `<h2>什么是商业发票？</h2>
<p>商业发票（Commercial Invoice）是国际贸易中最基本的单证之一。它不是我们日常消费中说的"收据"或"账单"，而是进出口报关时<strong>必须提交</strong>的文件，用来向海关说明货物的价值、数量和用途。</p>
<p>即使你是个人寄个人物品，国际快递通常也需要你填写一份商业发票（或形式发票 Proforma Invoice）。</p>

<h2>商业发票的必填字段</h2>

<h3>1. 发货人信息（Shipper / Exporter）</h3>
<ul>
<li>公司名称或个人姓名</li>
<li>完整地址（包括邮编）</li>
<li>联系电话和邮箱</li>
</ul>

<h3>2. 收货人信息（Consignee / Importer）</h3>
<ul>
<li>公司名称或个人姓名</li>
<li>完整地址（包括邮编）</li>
<li>联系电话（非常重要，快递员会联系）</li>
<li>税号/身份证号（部分国家要求）</li>
</ul>

<h3>3. 货物描述（Description of Goods）</h3>
<ul>
<li><strong>用英文填写</strong>，描述要具体（不要只写"gift"或"clothing"）</li>
<li>正确示例："Women's cotton T-shirt, size M" 而不是 "clothes"</li>
<li>正确示例："Plastic phone case for iPhone 15" 而不是 "accessories"</li>
<li>每行一个品项，数量、单价、总价分开列</li>
</ul>

<h3>4. HS 编码（Harmonized System Code）</h3>
<ul>
<li>至少填写前6位（国际通用）</li>
<li>不确定可以查海关官网或使用本站 HS 编码查询工具</li>
<li>错误的 HS 编码可能导致清关延误</li>
</ul>

<h3>5. 申报价值（Declared Value）</h3>
<ul>
<li>填写<strong>真实交易价值</strong>或合理估算值</li>
<li>货币单位（通常为 USD）</li>
<li>低报价值可能导致海关处罚或货物被扣押</li>
<li>个人物品可以标注"Personal Effects, Not for Sale"</li>
</ul>

<h3>6. 原产国（Country of Origin）</h3>
<ul>
<li>填写制造/生产国家（如"China"、"Made in China"）</li>
<li>有些国家对特定原产国有额外关税</li>
</ul>

<h2>常见错误</h2>
<ul>
<li>❌ 只写"gift"或"sample"——海关需要具体描述</li>
<li>❌ 申报价值过低——可能被视为逃税</li>
<li>❌ 没有填写 HS 编码——清关可能延误</li>
<li>❌ 漏写数量或单位——海关无法核算</li>
<li>❌ 中英文混用——建议使用英文</li>
</ul>

<h2>使用本站工具</h2>
<p>本站提供<strong>发票生成器</strong>和 <strong>HS 编码查询工具</strong>，帮你快速生成符合规范的商业发票和查询 HS 编码。在寄件前先准备好这些文件，可以大大加快清关速度。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站提供的发票模板仅供参考，不构成法律或海关建议。具体要求请咨询专业报关行或目的国海关。</p>
</div>`,
    category: "跨境寄送",
    tags: ["商业发票", "Commercial Invoice", "报关", "清关"],
    seoTitle: "商业发票怎么填？Commercial Invoice填写教程 - 国际快递报关",
    seoDescription: "手把手教你填写国际快递商业发票，包含必填字段、常见错误和注意事项，附HS编码查询工具。",
    relatedTools: ["hs-code", "invoice"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "Packing List 装箱单怎么做",
    slug: "packing-list-how-to-make",
    excerpt: "装箱单是国际物流必备单证，教你快速制作规范的装箱单，避免清关问题。",
    content: `<h2>什么是装箱单？</h2>
<p>装箱单（Packing List）是国际物流中与商业发票配套使用的单证，用来详细说明货物的<strong>包装情况</strong>——每个箱子里装了什么、重量多少、尺寸多大。海关和承运商都需要用它来核实货物。</p>

<h2>装箱单和商业发票的区别</h2>
<ul>
<li><strong>商业发票</strong>：重点在<strong>价值</strong>——单价、总价、交易条件</li>
<li><strong>装箱单</strong>：重点在<strong>物理信息</strong>——数量、重量、尺寸、包装方式</li>
<li>两者配合使用，缺一不可</li>
</ul>

<h2>装箱单的必填内容</h2>

<h3>基本信息</h3>
<ul>
<li>装箱单编号（Packing List No.）</li>
<li>日期（Date）</li>
<li>合同号或订单号（可选）</li>
</ul>

<h3>收发信息</h3>
<ul>
<li>发货人（Shipper）：名称、地址、联系方式</li>
<li>收货人（Consignee）：名称、地址、联系方式</li>
</ul>

<h3>货物包装信息（核心）</h3>
<ul>
<li><strong>箱号</strong>（Carton No.）：如 CTN 1-5（共5箱）</li>
<li><strong>品名</strong>：每箱装的是什么</li>
<li><strong>数量</strong>：每箱各品项的件数</li>
<li><strong>单箱毛重</strong>（Gross Weight per Carton，kg）</li>
<li><strong>总毛重</strong>（Total Gross Weight，kg）</li>
<li><strong>单箱净重</strong>（Net Weight per Carton，kg）</li>
<li><strong>箱尺寸</strong>（L × W × H，cm）</li>
<li><strong>总体积</strong>（Total CBM）</li>
</ul>

<h2>装箱单模板示例</h2>
<p>以下是一个简化版的装箱单示例：</p>
<div class="code-block">
Packing List No.: PL-2024-001
Date: 2024-01-15

Shipper: ABC Trading Co., Ltd.
Consignee: John Smith, 123 Main St, Toronto, ON M5V 2T6, Canada

| Carton No. | Description          | Qty | GW(kg) | NW(kg) | Dimensions(cm)     |
| CTN 1      | Cotton T-shirt, M    | 50  | 12.5   | 11.0   | 60×40×30           |
| CTN 2      | Cotton T-shirt, L    | 50  | 13.0   | 11.5   | 60×40×30           |
| CTN 3      | Phone case, iPhone15 | 200 | 8.0    | 7.5    | 40×30×25           |

Total: 3 cartons | GW: 33.5 kg | NW: 30.0 kg | CBM: 0.33
</div>

<h2>注意事项</h2>
<ul>
<li>毛重必须 ≥ 净重（毛重 = 净重 + 包装重量）</li>
<li>箱号要连续，不能跳号</li>
<li>如果每箱内容不同，要逐箱列出</li>
<li>如果每箱内容相同，可以用"CTN 1-10"合并表示</li>
<li>数据要和商业发票保持一致（品名、数量）</li>
</ul>

<h2>使用本站工具</h2>
<p>本站提供<strong>装箱单模板生成器</strong>（即将上线），帮你快速生成规范的装箱单。同时搭配<strong>发票生成器</strong>使用，可以一次性准备好所有报关单证。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站提供的装箱单模板仅供参考。具体报关要求请咨询专业报关行或目的国海关。</p>
</div>`,
    category: "跨境寄送",
    tags: ["装箱单", "Packing List", "报关单证", "物流文档"],
    seoTitle: "装箱单怎么做？Packing List制作教程 - 国际物流必备单证",
    seoDescription: "详解装箱单（Packing List）的必填内容和制作规范，附带模板示例，避免清关延误。",
    relatedTools: ["invoice", "shipping-estimator"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "HS 编码是什么？普通人怎么查",
    slug: "hs-code-beginner-guide",
    excerpt: 'HS编码是国际货物的"身份证号"，普通人寄包裹也能用到，教你快速查询和填写。',
    content: `<h2>HS 编码是什么？</h2>
<p>HS 编码（Harmonized System Code），全称"商品名称及编码协调制度"，是全球通用的商品分类编码体系。由世界海关组织（WCO）制定，目前被200多个国家和地区采用。</p>
<p>简单来说：<strong>HS编码是国际货物的"身份证号"</strong>。每个商品都有一个对应的编码，海关通过这个编码来确定商品的类别、适用关税和监管要求。</p>

<h2>HS 编码的结构</h2>
<p>HS 编码通常为6-10位数字：</p>
<ul>
<li><strong>前2位</strong>：章（Chapter），如第62章 = 非针织服装</li>
<li><strong>前4位</strong>：品目（Heading），如6203 = 男式西装</li>
<li><strong>前6位</strong>：子目（Sub-heading），国际通用部分</li>
<li><strong>7-10位</strong>：各国自行扩展的细分编码</li>
</ul>
<p><strong>重要：前6位是国际通用的</strong>，各国扩展的后几位可能不同。所以跨国寄送时，只需要确保前6位正确即可。</p>

<h2>普通人什么时候需要 HS 编码？</h2>
<ul>
<li>填写国际快递<strong>商业发票</strong>时，通常需要填写 HS 编码</li>
<li>个人从海外网购商品，有时需要提供 HS 编码</li>
<li>通过集运寄东西到海外，承运商可能要求你提供</li>
<li>跨境电商卖家的报关必须用到</li>
</ul>

<h2>怎么查 HS 编码？</h2>
<p>有几种方式：</p>

<h3>方法1：使用本站 HS 编码工具</h3>
<p>本站提供 <strong>100个常用商品的 HS 编码参考</strong>，覆盖服装、电子产品、日用品等常见品类。直接搜索品名即可获取参考编码。</p>

<h3>方法2：查询海关官网</h3>
<ul>
<li><strong>中国海关总署</strong>：海关官网提供完整税则查询</li>
<li><strong>中国国际贸易单一窗口</strong>：singlewindow.cn，可查进出口税则</li>
<li><strong>美国 USITC</strong>：hts.usitc.gov，可查美国关税编码</li>
<li><strong>加拿大 CBSA</strong>：cbsa-asfc.gc.ca，可查加拿大税则</li>
<li><strong>英国 Trade Tariff</strong>：gov.uk/trade-tariff</li>
<li><strong>欧盟 TARIC</strong>：ec.europa.eu/taxation_customs/dds2/taric</li>
</ul>

<h3>方法3：咨询承运商</h3>
<p>如果不确定，可以联系你的承运商或货代，他们通常能帮你确定正确的 HS 编码。</p>

<h2>注意事项</h2>
<ul>
<li>HS 编码填错可能导致清关延误或关税计算错误</li>
<li>不要随便编一个编码——海关可能会要求修改或退件</li>
<li>同一批货物中不同商品要分别列出各自的 HS 编码</li>
<li>不确定的话，使用本站工具中的参考编码，再向承运商确认</li>
</ul>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站提供的 HS 编码仅供参考，不构成海关建议。最终以目的国海关和报关行的确认准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["HS编码", "商品编码", "海关税则", "报关"],
    seoTitle: "HS编码是什么？普通人怎么查 - 国际货物编码入门指南",
    seoDescription: "详解HS编码（协调制度编码）的结构和用途，教你查询海关税则，附100个常用商品HS编码参考工具。",
    relatedTools: ["hs-code", "invoice"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "加拿大邮编格式怎么写",
    slug: "canada-postal-code-format",
    excerpt: "加拿大邮编采用独特的字母数字交替格式，教你正确书写和查询加拿大邮编。",
    content: `<h2>加拿大邮编的基本格式</h2>
<p>加拿大邮编（Postal Code）由6个字符组成，采用<strong>字母-数字-字母 数字-字母-数字</strong>的交替格式：</p>
<div class="formula">
<p><strong>A1A 1A1</strong>（中间有一个空格）</p>
</div>
<p>其中：</p>
<ul>
<li><strong>A</strong> = 字母（A-Z）</li>
<li><strong>1</strong> = 数字（0-9）</li>
</ul>
<p>示例：<strong>M5V 2T6</strong>（多伦多市中心）、<strong>K1A 0B1</strong>（渥太华）</p>

<h2>格式规则</h2>
<ul>
<li><strong>第一位字母</strong>：表示邮政区域（Postal District），如 M = 多伦多，V = 温哥华，H = 蒙特利尔</li>
<li><strong>第二位</strong>：必须是数字</li>
<li><strong>第三位</strong>：必须是字母</li>
<li><strong>空格</strong>：第三和第四位之间有一个空格</li>
<li><strong>第四到六位</strong>：数字-字母-数字</li>
</ul>

<h2>特殊限制</h2>
<p>加拿大邮编有一些字符限制：</p>
<ul>
<li>不使用字母 <strong>D、F、I、O、Q、U</strong>（容易与数字或其他字母混淆）</li>
<li>第一位不使用 <strong>W、Z</strong></li>
<li>第二位不使用 <strong>0</strong>（除了特殊用途如 K1A 0B1）</li>
</ul>

<h2>主要城市邮编前缀</h2>
<ul>
<li><strong>M</strong>：多伦多（Toronto）</li>
<li><strong>V</strong>：温哥华（Vancouver）</li>
<li><strong>H</strong>：蒙特利尔（Montreal）</li>
<li><strong>K</strong>：渥太华（Ottawa）</li>
<li><strong>T</strong>：卡尔加里（Calgary）</li>
<li><strong>R</strong>：温尼伯（Winnipeg）</li>
<li><strong>E</strong>：新斯科舍省</li>
<li><strong>G</strong>：魁北克城</li>
</ul>

<h2>书写格式</h2>
<ul>
<li>✅ <strong>M5V 2T6</strong>（带空格，推荐格式）</li>
<li>✅ <strong>M5V2T6</strong>（不带空格，也可以接受）</li>
<li>❌ m5v 2t6（小写，虽然系统能识别但建议大写）</li>
<li>❌ M 5 V 2 T 6（多余空格）</li>
</ul>

<h2>如何查询加拿大邮编？</h2>
<ul>
<li><strong>Canada Post 官网</strong>：canadapost.ca 提供邮编查询工具</li>
<li>输入地址或城市名即可查到对应的邮编</li>
<li>一个城市可能有多个邮编（不同区域不同）</li>
</ul>

<h2>使用本站工具</h2>
<p>本站<strong>邮编格式校验工具</strong>支持加拿大邮编格式验证，帮你快速检查邮编是否正确。同时提供<strong>地址格式化</strong>功能，生成符合加拿大邮政规范的完整地址。</p>

<div class="callout">
<p>💡 <strong>提示</strong>：加拿大邮编对邮件投递非常重要，写错可能导致包裹延误或退回。建议在寄件前用本站工具验证。</p>
</div>`,
    category: "海外生活",
    tags: ["加拿大邮编", "Postal Code", "地址格式", "加拿大生活"],
    seoTitle: "加拿大邮编格式怎么写 - Postal Code格式和查询指南",
    seoDescription: "详解加拿大邮编（A1A 1A1）的格式规则、主要城市邮编前缀和查询方法，附邮编格式校验工具。",
    relatedTools: ["postal-code", "address-formatter"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "食品、液体、电池寄海外为什么要提前确认",
    slug: "restricted-items-shipping-guide",
    excerpt: "食品、液体、锂电池等特殊物品在跨境寄送中有严格限制，教你理解原因和正确做法。",
    content: `<h2>为什么有些物品不能随便寄？</h2>
<p>跨境寄送不是"想寄什么就寄什么"。国际航空运输和各国海关对特定物品有严格的限制和规定。不了解这些规定就寄件，轻则被退回，重则被海关扣押甚至面临法律后果。</p>

<h2>食品类</h2>
<h3>为什么限制？</h3>
<ul>
<li><strong>食品安全</strong>：各国对进口食品有检疫要求，防止外来病虫害和疾病传播</li>
<li><strong>保质期</strong>：国际运输时间长，部分食品可能在途中过期</li>
<li><strong>成分限制</strong>：某些成分在目的国可能被禁止（如含肉制品、特定添加剂）</li>
</ul>
<h3>常见受限食品</h3>
<ul>
<li>🔴 <strong>肉类和肉制品</strong>（腊肉、香肠、火腿）：多数国家严禁进口</li>
<li>🔴 <strong>新鲜水果和蔬菜</strong>：几乎各国都禁止</li>
<li>🟡 <strong>零食和干货</strong>：部分国家允许但需申报，注意成分表</li>
<li>🟡 <strong>茶叶</strong>：通常可以，但部分国家有数量限制</li>
<li>🟢 <strong>糖果和巧克力</strong>：一般可以，注意保质期</li>
</ul>
<h3>正确做法</h3>
<p>寄食品前：<strong>查询目的国海关的食品进口规定，向承运商确认是否接货，如实申报</strong>。</p>

<h2>液体类</h2>
<h3>为什么限制？</h3>
<ul>
<li><strong>航空安全</strong>：液体在空运中可能泄漏、反应或引发安全问题</li>
<li><strong>化妆品监管</strong>：部分液体化妆品含有目的国限制的成分</li>
<li><strong>容器要求</strong>：液体包装需要符合航空运输的密封标准</li>
</ul>
<h3>常见受限液体</h3>
<ul>
<li>🟡 <strong>化妆品和护肤品</strong>：通常可以，但需注意成分和容量</li>
<li>🟡 <strong>香水</strong>：含酒精，航空运输有严格限制</li>
<li>🟡 <strong>药酒/保健品液体</strong>：需确认成分和目的国法规</li>
</ul>
<h3>正确做法</h3>
<p><strong>确认液体不含危险品成分，包装密封良好，如实申报品名和成分</strong>。</p>

<h2>电池类</h2>
<h3>为什么限制？</h3>
<ul>
<li><strong>航空安全（最重要）</strong>：锂电池在空运中可能起火或爆炸，这是国际航空运输协会（IATA）严格规定的原因</li>
<li><strong>UN38.3 测试</strong>：所有锂电池必须通过 UN38.3 安全测试才能空运</li>
<li><strong>容量限制</strong>：不同类型的电池有不同的容量上限</li>
</ul>
<h3>常见受限电池</h3>
<ul>
<li>🟠 <strong>充电宝/移动电源</strong>：需要 UN38.3 测试报告，容量有限制</li>
<li>🟠 <strong>含大电池的设备</strong>（电动滑板车等）：可能只能海运</li>
<li>🟡 <strong>内置锂电池的电子产品</strong>（手机、笔记本）：通常可以，需申报</li>
<li>🟡 <strong>干电池</strong>：一般限制较少，但也需申报</li>
</ul>
<h3>正确做法</h3>
<p><strong>确认电池类型和容量，向承运商确认接货要求，必要时提供 UN38.3 测试报告</strong>。</p>

<h2>其他常见受限物品</h2>
<ul>
<li>🟡 <strong>粉末类</strong>：需要确认成分，部分粉末被禁止空运</li>
<li>🟡 <strong>磁性物品</strong>：需要进行磁性检测</li>
<li>🟡 <strong>木制品</strong>：可能需要熏蒸证明</li>
<li>🟡 <strong>液体和粉末状化妆品</strong>：成分和容量需符合航空规定</li>
</ul>

<h2>核心原则</h2>
<ul>
<li><strong>不要瞒报</strong>：瞒报可能导致货物被扣、罚款甚至法律责任</li>
<li><strong>提前确认</strong>：寄件前向承运商确认物品是否可以寄送</li>
<li><strong>如实申报</strong>：品名、数量、价值都要如实填写</li>
<li><strong>遵守法律</strong>：遵守目的国法律法规，不符合规定的物品不要寄</li>
</ul>

<h2>使用本站工具</h2>
<p>本站提供<strong>敏感物品参考查询</strong>工具，涵盖12类常见特殊物品的寄送参考和合规话术。在寄件前先查询，了解相关注意事项。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站仅提供信息参考，不构成任何物流建议。具体接货规则请以承运商确认为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["敏感货", "食品寄送", "锂电池", "液体", "航空安全"],
    seoTitle: "食品液体电池寄海外为什么要提前确认 - 特殊物品寄送指南",
    seoDescription: "详解食品、液体、锂电池等特殊物品跨境寄送的限制原因和正确做法，附敏感物品参考查询工具。",
    relatedTools: ["sensitive-goods", "tracking"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "集运是什么？海外华人怎么理解集运",
    slug: "what-is-consolidation-shipping",
    excerpt: "集运是海外华人最常用的寄送方式之一，帮你理解集运的运作流程和注意事项。",
    content: `<h2>什么是集运？</h2>
<p>集运（Consolidation Shipping），也叫"转运"或"合箱"，是一种将多个包裹先集中到一个中转仓库，再合并打包后统一寄到海外的物流方式。</p>
<p>简单来说：你在不同平台买了几样东西，分别发到集运仓，集运公司收到所有包裹后，帮你合并成一个包裹寄到海外。这样可以<strong>节省运费</strong>，也能<strong>一次性收到所有商品</strong>。</p>

<h2>集运的基本流程</h2>

<h3>第一步：注册并获取仓库地址</h3>
<p>在集运平台注册账号后，你会获得一个<strong>专属的国内仓库地址</strong>（包括一个专属编号），用来标识你的包裹。</p>

<h3>第二步：购物并填写仓库地址</h3>
<p>在淘宝、京东、拼多多等平台购物时，收货地址填写集运仓库地址和你的专属编号。</p>

<h3>第三步：包裹到仓</h3>
<p>卖家发货到集运仓后，集运公司会签收并通知你。你可以在系统中看到每个包裹的状态。</p>

<h3>第四步：合箱打包</h3>
<p>当你所有的包裹都到仓后，集运公司会帮你：
- 拆除外包装（减少体积）
- 合并到一个箱子
- 称重并计算运费
- 拍照让你确认</p>

<h3>第五步：支付国际运费</h3>
<p>确认包裹信息和费用后，支付国际运费。</p>

<h3>第六步：国际运输与清关</h3>
<p>集运公司负责国际运输和出口报关。到达目的国后，需要进口清关。</p>

<h3>第七步：目的国派送</h3>
<p>清关完成后，由目的国邮政或当地快递公司派送到你手中。</p>

<h2>集运的优缺点</h2>
<h3>优点</h3>
<ul>
<li>✅ 多个包裹合并，节省国际运费</li>
<li>✅ 可以拆除外包装，减小体积</li>
<li>✅ 一次性收到所有商品</li>
<li>✅ 部分集运公司提供拍照验货服务</li>
<li>✅ 通常比直邮更便宜</li>
</ul>
<h3>缺点和注意事项</h3>
<ul>
<li>⚠️ 时效比直邮长（需要等所有包裹到仓）</li>
<li>⚠️ 需要选择可靠的集运公司</li>
<li>⚠️ 合箱后包裹的价值可能超过目的国免税额度</li>
<li>⚠️ 某些特殊物品集运公司可能不收</li>
</ul>

<h2>选择集运公司的建议</h2>
<ul>
<li>查看公司资质和用户评价</li>
<li>确认是否支持你需要的物品类型（食品、化妆品等）</li>
<li>了解运费计算方式（实重 vs 体积重）</li>
<li>确认是否有丢件赔付政策</li>
<li>注意是否有隐藏费用（如合箱费、拍照费等）</li>
</ul>

<h2>集运与直邮的区别</h2>
<ul>
<li><strong>直邮</strong>：卖家直接从国内寄到海外，适合单个包裹</li>
<li><strong>集运</strong>：先到中转仓再合箱寄送，适合多个包裹</li>
</ul>

<h2>使用本站工具</h2>
<p>本站提供<strong>地址格式化工具</strong>帮你生成正确的集运仓地址格式，<strong>运费估算器</strong>帮你预估合箱后的运费。集运过程中涉及的<strong>商业发票</strong>和 <strong>HS 编码</strong>也可以在本站找到相关工具。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站不推荐任何特定集运公司，不提供承运服务。选择集运公司请自行评估。</p>
</div>`,
    category: "跨境寄送",
    tags: ["集运", "转运", "合箱", "海外购物"],
    seoTitle: "集运是什么？海外华人怎么理解集运 - 转运流程详解",
    seoDescription: "详解集运（转运/合箱）的运作流程、优缺点和选择建议，帮助海外华人理解和使用集运服务。",
    relatedTools: ["address-formatter", "shipping-estimator", "invoice"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "怎么判断跨境寄送报价是否靠谱",
    slug: "how-to-evaluate-shipping-quote",
    excerpt: "跨境寄送报价差异很大，教你识别合理报价和潜在陷阱，避免被坑。",
    content: `<h2>为什么报价差异这么大？</h2>
<p>同一条线路、同样重量的包裹，不同承运商的报价可能相差数倍。这是因为影响跨境寄送费用的因素非常多，不了解这些因素就很难判断一个报价是否合理。</p>

<h2>影响跨境寄送费用的核心因素</h2>

<h3>1. 计费重量</h3>
<p>承运商取<strong>实际重量</strong>和<strong>体积重量</strong>的较大者作为计费重量。如果你只按实际重量估算，可能会发现最终费用远超预期。</p>

<h3>2. 运输方式</h3>
<ul>
<li><strong>空运快递</strong>（DHL/FedEx/UPS）：最快但最贵，通常 3-7 天</li>
<li><strong>空运专线</strong>：比快递便宜，时效 7-15 天</li>
<li><strong>海运拼箱（LCL）</strong>：最便宜但最慢，通常 30-60 天</li>
<li><strong>海运整箱（FCL）</strong>：大批量货物最划算</li>
<li><strong>铁路（中欧班列）</strong>：介于空运和海运之间，15-25 天</li>
</ul>

<h3>3. 起运地和目的地</h3>
<p>不同城市之间的运费差异很大。从一线城市发货通常更便宜，偏远地区可能有附加费。</p>

<h3>4. 货物类型</h3>
<ul>
<li>普通货：运费最低</li>
<li>带电/含磁：可能需要额外检测或走特殊渠道</li>
<li>食品/液体/化妆品：可能有额外费用或被拒收</li>
</ul>

<h3>5. 附加费用（最容易产生"坑"的地方）</h3>
<ul>
<li>📦 <strong>燃油附加费</strong>：随油价浮动，通常按月调整</li>
<li>📦 <strong>偏远地区附加费</strong>：派送地址不在主要城市</li>
<li>📦 <strong>超重/超大附加费</strong>：单件超过重量或尺寸限制</li>
<li>📦 <strong>关税和税费</strong>：目的国海关征收，通常由收货人承担</li>
<li>📦 <strong>清关费</strong>：部分承运商收取的清关服务费</li>
<li>📦 <strong>保险费</strong>：货物价值高时建议购买</li>
</ul>

<h2>如何判断报价是否靠谱？</h2>

<h3>✅ 靠谱报价的特征</h3>
<ul>
<li>明确列出计费重量的计算方式（实重/体积重）</li>
<li>分项列出：基础运费、燃油附加费、其他费用</li>
<li>说明是否包含清关费、派送费</li>
<li>注明时效范围（不是"保证几天到"）</li>
<li>提供关税/税费的参考说明</li>
</ul>

<h3>❌ 需要警惕的信号</h3>
<ul>
<li>报价远低于市场平均水平（可能隐藏了附加费）</li>
<li>不说明计费方式，只说"XX元一公斤"</li>
<li>承诺"100%包清关""100%不征税"（不现实）</li>
<li>不提体积重（后续可能按体积重补收差价）</li>
<li>要求线下转账、不提供合同或收据</li>
</ul>

<h2>快速比价的方法</h2>
<ol>
<li>确定包裹的<strong>实际重量</strong>和<strong>包装尺寸</strong></li>
<li>用本站<strong>运费估算器</strong>计算体积重和参考费用</li>
<li>向 2-3 家承运商询价，使用相同的参数</li>
<li>对比<strong>总费用</strong>而非"每公斤单价"</li>
<li>确认报价包含哪些服务、不包含哪些服务</li>
</ol>

<h2>一个实用的经验法则</h2>
<p>如果某个报价比市场平均低 <strong>30% 以上</strong>，需要特别警惕。过低的价格往往意味着后续会有额外收费，或者服务质量无法保证。</p>

<h2>使用本站工具</h2>
<p>本站提供<strong>运费估算器</strong>，帮你了解国际快递的费用构成和参考价格。在询价前先用工具估算一下，做到心中有数，不会被离谱的报价忽悠。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站运费估算仅供参考，不构成任何物流服务商的报价或承诺。实际费用请以承运商报价为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["运费报价", "比价", "物流费用", "集运"],
    seoTitle: "怎么判断跨境寄送报价是否靠谱 - 物流费用避坑指南",
    seoDescription: "教你识别合理的跨境寄送报价和潜在陷阱，了解影响运费的核心因素，附运费估算工具。",
    relatedTools: ["shipping-estimator", "sensitive-goods"],
    author: "海外百宝箱",
    status: "published",
  },
];

const resources = [
  // Category 1: 海外生活资源
  {
    category: "life",
    items: [
      { name: "USPS 包裹追踪", url: "https://tools.usps.com/go/TrackConfirmAction_input", desc: "美国邮政官方包裹追踪入口，支持所有 USPS 邮件类型。", tags: ["包裹追踪", "邮政", "美国"], sourceType: "official", usage: "追踪进入美国的国际包裹" },
      { name: "Canada Post 邮编查询", url: "https://www.canadapost-postescanada.ca/cpotools/apps/fpc/personal/findByCity", desc: "加拿大邮政官方邮编查询工具，按地址查邮编。", tags: ["邮编查询", "邮政", "加拿大"], sourceType: "official", usage: "查询加拿大地址对应的邮编" },
      { name: "UK Royal Mail 追踪", url: "https://www.royalmail.com/track-your-item", desc: "英国皇家邮政官方包裹追踪入口。", tags: ["包裹追踪", "邮政", "英国"], sourceType: "official", usage: "追踪进入英国的国际包裹" },
      { name: "Australia Post 追踪", url: "https://auspost.com.au/mypost/track/#/search", desc: "澳洲邮政官方包裹追踪和邮编查询入口。", tags: ["包裹追踪", "邮编查询", "澳洲"], sourceType: "official", usage: "追踪进入澳洲的包裹" },
      { name: "中国驻外使领馆", url: "https://www.fmprc.gov.cn/web/wjdt_674879/zwbd_674887/", desc: "外交部官网：中国驻各国使领馆联系方式和领事服务信息。", tags: ["领事服务", "政府", "海外华人"], sourceType: "official", usage: "海外公民寻求领事保护和协助" },
      { name: "IRS 税务指南（美国）", url: "https://www.irs.gov/individuals/international-taxpayers", desc: "美国国税局国际纳税人专区，涵盖海外美国人税务申报指南。", tags: ["税务", "政府", "美国"], sourceType: "official", usage: "了解美国联邦税务申报要求" },
      { name: "CRA 税务（加拿大）", url: "https://www.canada.ca/en/revenue-agency.html", desc: "加拿大税务局（CRA）官网，个人所得税申报入口。", tags: ["税务", "政府", "加拿大"], sourceType: "official", usage: "加拿大个人所得税申报和税务查询" },
      { name: "17TRACK", url: "https://www.17track.net", desc: "全球包裹追踪聚合平台，支持600+承运商，自动识别快递公司。", tags: ["包裹追踪", "第三方", "聚合平台"], sourceType: "third-party", usage: "不确定承运商时使用聚合查询" },
      { name: "Wise 跨境汇款", url: "https://wise.com", desc: "低成本国际汇款服务，支持160+国家，实时汇率。", tags: ["汇款", "金融", "第三方"], sourceType: "third-party", usage: "跨国汇款和货币兑换" },
      { name: "Google Translate", url: "https://translate.google.com", desc: "Google 在线翻译，支持100+语言，支持文档和图片翻译。", tags: ["翻译", "工具", "第三方"], sourceType: "third-party", usage: "多语言翻译和文档翻译" },
    ]
  },
  // Category 2: 跨境寄送资源
  {
    category: "logistics",
    items: [
      { name: "DHL Express", url: "https://www.dhl.com", desc: "DHL 国际快递官网，提供全球快递、货运和追踪服务。", tags: ["快递", "国际", "DHL"], sourceType: "official", usage: "国际快递寄送和包裹追踪" },
      { name: "FedEx", url: "https://www.fedex.com", desc: "FedEx 联邦快递官网，全球快递和物流服务。", tags: ["快递", "国际", "FedEx"], sourceType: "official", usage: "国际快递寄送和包裹追踪" },
      { name: "UPS", url: "https://www.ups.com", desc: "UPS 联合包裹服务官网，全球物流和供应链管理。", tags: ["快递", "国际", "UPS"], sourceType: "official", usage: "国际快递寄送和包裹追踪" },
      { name: "中国邮政 EMS", url: "https://www.ems.com.cn", desc: "中国邮政速递物流官网，国际 EMS、e邮宝查询入口。", tags: ["邮政", "EMS", "中国"], sourceType: "official", usage: "查询中国邮政国际包裹" },
      { name: "中国海关总署", url: "http://www.customs.gov.cn", desc: "中华人民共和国海关总署官网，进出口税则和政策法规。", tags: ["海关", "政府", "税则"], sourceType: "official", usage: "查询中国进出口商品税则" },
      { name: "中国国际贸易单一窗口", url: "https://www.singlewindow.cn", desc: "中国进出口通关一站式平台，可查税则、申报。", tags: ["报关", "政府", "单一窗口"], sourceType: "official", usage: "进出口报关和税则查询" },
      { name: "USITC HTS 查询", url: "https://hts.usitc.gov", desc: "美国国际贸易委员会关税税则查询系统。", tags: ["海关", "政府", "美国"], sourceType: "official", usage: "查询美国进口商品关税编码和税率" },
      { name: "UK Trade Tariff", url: "https://www.gov.uk/trade-tariff", desc: "英国政府关税税则查询系统，可查进口关税和增值税。", tags: ["海关", "政府", "英国"], sourceType: "official", usage: "查询英国进口商品关税" },
      { name: "AfterShip 追踪", url: "https://www.aftership.com/track", desc: "第三方包裹追踪平台，支持800+承运商。", tags: ["包裹追踪", "第三方", "聚合平台"], sourceType: "third-party", usage: "多承运商包裹追踪" },
      { name: "ParcelsApp", url: "https://parcelsapp.com", desc: "第三方包裹追踪比价平台，自动识别承运商。", tags: ["包裹追踪", "第三方", "聚合平台"], sourceType: "third-party", usage: "不确定承运商时自动识别和追踪" },
    ]
  },
  // Category 3: 出海经营资源
  {
    category: "business",
    items: [
      { name: "Shopify", url: "https://www.shopify.com", desc: "全球领先的电商建站平台，适合个人和中小企业出海。", tags: ["电商", "建站", "第三方"], sourceType: "third-party", usage: "搭建独立电商网站" },
      { name: "Amazon Global Selling", url: "https://sell.amazon.com", desc: "亚马逊全球开店，覆盖北美、欧洲、日本等站点。", tags: ["电商", "亚马逊", "第三方"], sourceType: "third-party", usage: "在亚马逊平台销售商品" },
      { name: "Stripe", url: "https://stripe.com", desc: "全球在线支付处理平台，支持135+货币。", tags: ["支付", "收款", "第三方"], sourceType: "third-party", usage: "在线收款和支付处理" },
      { name: "PayPal Business", url: "https://www.paypal.com/business", desc: "PayPal 商家收款服务，全球200+国家/地区支持。", tags: ["支付", "收款", "第三方"], sourceType: "third-party", usage: "跨境在线收款" },
      { name: "Google Ads", url: "https://ads.google.com", desc: "Google 广告投放平台，覆盖搜索、展示、视频广告。", tags: ["广告", "营销", "第三方"], sourceType: "third-party", usage: "Google 搜索和展示广告投放" },
      { name: "Meta Business", url: "https://business.facebook.com", desc: "Facebook/Instagram 广告投放和商业账号管理平台。", tags: ["广告", "营销", "社交媒体"], sourceType: "third-party", usage: "Facebook 和 Instagram 广告投放" },
      { name: "中国贸促会", url: "https://www.ccpit.org", desc: "中国国际贸易促进委员会，提供贸易促进和法律服务。", tags: ["贸易", "政府", "贸促会"], sourceType: "official", usage: "获取国际贸易法律和政策支持" },
      { name: "商务部对外投资合作", url: "https://fec.mofcom.gov.cn", desc: "中国商务部对外投资和经济合作司，发布各国投资指南。", tags: ["投资", "政府", "商务部"], sourceType: "official", usage: "了解各国投资环境和政策" },
      { name: "Alibaba.com", url: "https://www.alibaba.com", desc: "阿里巴巴国际站，B2B 跨境电商批发平台。", tags: ["电商", "B2B", "第三方"], sourceType: "third-party", usage: "B2B 跨境批发采购和销售" },
      { name: "XTransfer", url: "https://www.xtransfer.com", desc: "为中国外贸企业提供跨境收款和金融服务的平台。", tags: ["支付", "收款", "B2B"], sourceType: "third-party", usage: "B2B 外贸跨境收款" },
    ]
  },
  // Category 4: 模板表格资源
  {
    category: "templates",
    items: [
      { name: "Commercial Invoice 模板", url: "/tools/invoice", desc: "本站在线发票生成器，填写信息即可生成规范的商业发票 PDF。", tags: ["发票", "模板", "报关"], sourceType: "internal", usage: "生成国际快递商业发票" },
      { name: "Packing List 模板", url: "/tools/invoice", desc: "本站装箱单模板，与发票生成器配套使用。", tags: ["装箱单", "模板", "物流"], sourceType: "internal", usage: "制作规范的装箱单" },
      { name: "地址格式参考", url: "/tools/address-formatter", desc: "5国地址格式参考，一键生成标准格式地址。", tags: ["地址", "模板", "格式"], sourceType: "internal", usage: "生成符合各国邮政规范的地址" },
      { name: "运费估算表", url: "/tools/shipping-estimator", desc: "在线运费估算器，计算体积重和费用参考。", tags: ["运费", "计算", "参考"], sourceType: "internal", usage: "估算国际快递费用" },
      { name: "箱唛模板（Shipping Mark）", url: "/tools/receipt", desc: "箱唛信息生成器，生成规范的运输标识。", tags: ["箱唛", "模板", "物流"], sourceType: "internal", usage: "生成外箱运输标识信息" },
      { name: "HS 编码查询表", url: "/tools/hs-code", desc: "100个常用商品的 HS 编码参考，支持搜索和分类浏览。", tags: ["HS编码", "参考", "海关"], sourceType: "internal", usage: "快速查询常见商品的HS编码" },
      { name: "敏感物品参考清单", url: "/tools/sensitive-goods", desc: "12类特殊物品的寄送参考和合规话术生成。", tags: ["敏感货", "参考", "合规"], sourceType: "internal", usage: "查询特殊物品的寄送注意事项" },
      { name: "国际快递单号整理表", url: "/tracking", desc: "批量运单号格式化工具，自动识别承运商并生成跳转链接。", tags: ["运单号", "工具", "追踪"], sourceType: "internal", usage: "整理和格式化批量运单号" },
      { name: "报价单模板", url: "/tools/quote", desc: "在线报价单生成器，适用于外贸报价场景。", tags: ["报价单", "模板", "外贸"], sourceType: "internal", usage: "生成外贸报价单" },
      { name: "邮编格式校验工具", url: "/tools/postal-code", desc: "5国邮编格式校验和参考，检查邮编是否正确。", tags: ["邮编", "校验", "格式"], sourceType: "internal", usage: "验证各国邮编格式是否正确" },
    ]
  },
];

async function main() {
  console.log("🌱 Phase 2.3: Seeding articles and resources...\n");

  // Check if articles already exist
  const existingCount = await prisma.article.count();
  console.log(`📊 Existing articles in DB: ${existingCount}`);

  // Add articles
  let createdArticles = 0;
  let skippedArticles = 0;

  for (const art of articles) {
    const exists = await prisma.article.findUnique({ where: { slug: art.slug } });
    if (exists) {
      console.log(`⏭️  Skipped (exists): ${art.title}`);
      skippedArticles++;
      continue;
    }

    await prisma.article.create({
      data: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        category: art.category,
        coverImage: null,
        author: art.author,
        status: art.status,
        views: 0,
        publishedAt: new Date(),
        seoTitle: art.seoTitle,
        seoDescription: art.seoDescription,
        relatedTools: art.relatedTools,
        tags: {
          create: art.tags.map(tag => ({ tag })),
        },
      },
    });
    console.log(`✅ Created: ${art.title}`);
    createdArticles++;
  }

  console.log(`\n📝 Articles: ${createdArticles} created, ${skippedArticles} skipped`);
  console.log(`📊 Total articles in DB: ${await prisma.article.count()}`);

  // Add resources
  let createdResources = 0;
  let skippedResources = 0;

  for (const cat of resources) {
    for (const item of cat.items) {
      const exists = await prisma.resource.findFirst({
        where: { name: item.name, category: cat.category },
      });
      if (exists) {
        console.log(`⏭️  Skipped (exists): ${item.name}`);
        skippedResources++;
        continue;
      }

      await prisma.resource.create({
        data: {
          name: item.name,
          url: item.url,
          description: item.desc,
          category: cat.category,
          tags: item.tags,
          sourceType: item.sourceType,
          usage: item.usage,
        },
      });
      console.log(`✅ Resource: ${item.name} (${cat.category})`);
      createdResources++;
    }
  }

  console.log(`\n📦 Resources: ${createdResources} created, ${skippedResources} skipped`);
  console.log(`📊 Total resources in DB: ${await prisma.resource.count()}`);

  console.log("\n✅ Phase 2.3 seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
