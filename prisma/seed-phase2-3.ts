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
  {
    title: "海外地址怎么写才不容易丢件",
    slug: "how-to-write-overseas-address-correctly",
    excerpt: "海外地址格式因国家而异，写错一个细节可能导致包裹延误或退回。教你正确填写各国地址。",
    content: `<h2>为什么地址写对很重要？</h2>
<p>国际包裹的派送完全依赖地址信息。与国内快递不同，海外很多国家的邮政系统对地址格式有严格要求。格式不规范、邮编缺失、电话号码漏写，都可能导致包裹在目的国无法顺利派送，甚至被退回。</p>

<h2>通用地址书写原则</h2>
<ul>
<li><strong>使用英文或目的国官方语言</strong>：国际快递通常要求英文地址，寄往日本可用日文，寄往德国可用德文</li>
<li><strong>从具体到宽泛排列</strong>：姓名 → 门牌号/街道 → 城市 → 州/省 → 邮编 → 国家</li>
<li><strong>邮编必填且准确</strong>：邮编是自动化分拣的核心依据，写错邮编是最常见的丢件原因</li>
<li><strong>预留联系电话</strong>：快递员派送前通常会联系收件人，缺少电话可能导致派送失败</li>
<li><strong>避免使用特殊字符</strong>：部分承运商系统不支持中文、日文等非拉丁字符，建议用拼音或英文替代</li>
</ul>

<h2>主要国家地址格式</h2>

<h3>美国</h3>
<div class="code-block">
John Smith
123 Main Street, Apt 4B
New York, NY 10001
United States
</div>
<p>注意：州名用两个字母缩写（如 NY、CA、TX），邮编为5位或5+4位格式（ZIP+4）。</p>

<h3>加拿大</h3>
<div class="code-block">
Jane Doe
456 King Street W, Unit 12
Toronto, ON M5V 2T6
Canada
</div>
<p>注意：邮编格式为 A1A 1A1（字母数字交替），中间有空格。省份用两个字母缩写。</p>

<h3>英国</h3>
<div class="code-block">
David Brown
78 Oxford Road
Manchester M1 5AN
United Kingdom
</div>
<p>注意：英国邮编非常精确，通常对应一条街道甚至一栋楼。邮编格式如 M1 5AN 或 SW1A 1AA。</p>

<h3>澳大利亚</h3>
<div class="code-block">
Sarah Wilson
12 George Street
Sydney NSW 2000
Australia
</div>
<p>注意：州缩写（NSW、VIC、QLD 等）和4位邮编之间通常不加逗号。</p>

<h3>日本</h3>
<div class="code-block">
田中太郎
〒100-0001
東京都千代田区千代田1-1
Japan
</div>
<p>注意：国际件建议同时标注日文和英文地址，邮编7位格式如 100-0001。</p>

<h2>常见地址错误</h2>
<ul>
<li>❌ 漏写邮编或邮编写错——最常见原因</li>
<li>❌ 州/省缩写不正确（如把加州写成 CL 而不是 CA）</li>
<li>❌ 门牌号遗漏或顺序颠倒</li>
<li>❌ 公寓号/单元号未标注（如 Apt、Suite、Unit）</li>
<li>❌ 国家名称省略或使用非标准缩写</li>
<li>❌ 使用中文地址寄往非中文国家</li>
</ul>

<h2>核对清单</h2>
<p>寄件前请逐项检查：</p>
<ol>
<li>收件人姓名完整准确</li>
<li>街道地址和门牌号正确</li>
<li>公寓号/单元号已标注（如适用）</li>
<li>城市名称拼写正确</li>
<li>州/省缩写正确</li>
<li>邮编准确无误</li>
<li>国家名称使用英文全称</li>
<li>联系电话包含国家区号（如 +1、+44）</li>
</ol>

<h2>地址书写错误导致的实际后果</h2>
<p>很多华人寄件时习惯按照中文地址顺序翻译，结果导致包裹延误甚至退回。以下是真实案例：</p>
<ul>
<li>案例1：小李寄往多伦多的包裹，把邮编 M5V 2T6 写成了 M5V2T6（缺少空格），Canada Post 自动分拣系统无法识别，包裹在分拣中心滞留了3天</li>
<li>案例2：寄往伦敦的包裹，收件人地址写了 "北京市海淀区" 的拼音，但英国邮政系统无法识别中文拼音，最终因地址不明被退回</li>
<li>案例3：寄往悉尼的包裹，州缩写 NSW 和邮编 2000 之间加了逗号，澳洲邮政系统将其识别为地址的一部分而非州名，导致派送到错误区域</li>
</ul>

<h2>实用建议</h2>
<p>如果不确定地址格式是否正确，可以先用各国邮政官网的邮编查询工具验证。输入街道地址后，系统会返回标准格式的邮编和地址，按照这个格式填写可以最大程度避免丢件。同时，建议在包裹上同时标注收件人的当地电话号码，以便快递员在派送时联系。</p>

<div class="callout">
<p>💡 <strong>提示</strong>：本站提供<strong>邮编格式校验工具</strong>，可验证5国邮编格式是否正确。同时提供<strong>地址格式化参考</strong>，帮你生成符合各国邮政规范的地址。本站不提供承运服务，信息仅供参考。</p>
</div>`,
    category: "跨境寄送",
    tags: ["地址格式", "邮编", "国际快递", "丢件预防"],
    seoTitle: "海外地址怎么写才不容易丢件 - 各国地址格式指南",
    seoDescription: "详解美国、加拿大、英国、澳洲、日本等国家的地址书写格式，常见错误分析和核对清单，避免包裹因地址问题被退回。",
    relatedTools: ["postal-code", "tracking"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "国际快递单号怎么看",
    slug: "how-to-read-international-tracking-number",
    excerpt: "不同承运商的快递单号有各自的编码规则，了解这些规则能帮你快速识别快递公司和追踪状态。",
    content: `<h2>快递单号是什么？</h2>
<p>快递单号（Tracking Number / Waybill Number）是承运商分配给每个包裹的唯一识别码。通过单号，你可以在承运商官网或第三方追踪平台上查询包裹的实时物流状态。</p>
<p>不同快递公司的单号有不同的长度、格式和编码规则。了解这些规则有助于你快速识别包裹由哪家承运商负责运输。</p>

<h2>常见快递公司单号格式</h2>

<h3>中国邮政 / EMS</h3>
<p>国际邮件采用万国邮政联盟（UPU）标准格式：<strong>2位字母 + 9位数字 + 2位国家代码</strong></p>
<ul>
<li><strong>EMS</strong>：以 E 开头，如 EE123456789CN</li>
<li><strong>挂号信</strong>：以 R 开头，如 RA123456789CN</li>
<li><strong>普通包裹</strong>：以 C 开头，如 CP123456789CN</li>
<li><strong>e邮宝</strong>：以 L 开头，如 LV123456789CN</li>
</ul>
<p>末尾两位 CN 代表中国。到达目的国后，可能换成本国邮政的新单号继续追踪。</p>

<h3>DHL</h3>
<ul>
<li><strong>DHL Express</strong>：通常为10位纯数字，如 1234567890</li>
<li><strong>DHL eCommerce</strong>：可能为11-16位，常见以 JVGL、JD 等开头</li>
<li>也有部分运单使用 JD + 11位数字的格式</li>
</ul>

<h3>FedEx</h3>
<ul>
<li><strong>FedEx Express</strong>：12位或15位纯数字</li>
<li>12位格式：前4位为服务类型，后8位为包裹编号</li>
<li>15位格式：在12位基础上增加3位校验码</li>
</ul>

<h3>UPS</h3>
<ul>
<li>标准格式：<strong>1Z</strong> 开头 + 6位承运商代码 + 2位服务代码 + 7位包裹编号 + 1位校验码</li>
<li>总共18位字符，如 1Z999AA10123456784</li>
<li>也支持纯数字的邮件创新（Mail Innovations）单号，通常为9位</li>
</ul>

<h2>如何根据单号判断承运商？</h2>
<p>如果你收到一个单号但不确定是哪家公司的，可以参考以下特征：</p>
<ul>
<li>以 <strong>1Z</strong> 开头 → <strong>UPS</strong></li>
<li><strong>10位纯数字</strong> → 很可能是 <strong>DHL Express</strong></li>
<li><strong>12位纯数字</strong> → 可能是 <strong>FedEx</strong></li>
<li>以 <strong>E/R/C/L</strong> + 9位数字 + <strong>CN</strong> → <strong>中国邮政</strong></li>
<li>以 <strong>JD</strong> 开头 → <strong>DHL eCommerce</strong> 或 <strong>京东物流</strong></li>
</ul>
<p>如果不确定，可以使用第三方聚合追踪平台（如 17TRACK、ParcelsApp），输入单号后系统会自动识别承运商。</p>

<h2>追踪状态常见术语</h2>
<ul>
<li><strong>Shipment Information Received</strong>：承运商已收到运单信息，但尚未揽件</li>
<li><strong>Picked Up / Collected</strong>：包裹已被承运商揽收</li>
<li><strong>In Transit</strong>：包裹正在运输途中</li>
<li><strong>Arrived at Hub / Facility</strong>：到达中转中心</li>
<li><strong>Customs Clearance</strong>：正在清关中</li>
<li><strong>Out for Delivery</strong>：派送中</li>
<li><strong>Delivered</strong>：已签收</li>
<li><strong>Exception / Delay</strong>：异常情况，需要关注</li>
</ul>

<h2>单号查不到怎么办？</h2>
<ol>
<li>确认单号是否完整——有时复制会漏掉最后一位</li>
<li>等待12-48小时——刚生成的单号可能尚未激活</li>
<li>在承运商官网直接查询，而非第三方平台</li>
<li>联系发货方确认单号是否正确</li>
<li>检查是否已更换为本地派送单号（常见于邮政渠道）</li>
</ol>

<h2>邮政渠道单号转换的特殊情况</h2>
<p>通过邮政渠道（如中国邮政 e 邮宝、EMS）寄出的国际包裹，到达目的国后通常会被转换为本地邮政的新单号。例如从中国寄到美国的 EMS 包裹，到达美国后可能转为 USPS 的新单号继续追踪。这种情况下，原始单号在美国邮政系统中可能查不到任何信息。建议使用 17TRACK 等聚合平台查询，它们能自动关联新旧单号。</p>

<h2>转运单号和末端派送单号的区别</h2>
<p>很多新手容易混淆"转运单号"和"末端派送单号"。当你使用集运或转运服务时，会收到两个不同的单号：</p>
<ul>
<li><strong>转运单号（国内段）</strong>：商家发货到转运公司国内仓库的单号，通常是顺丰、圆通、中通等国内快递单号。这个阶段包裹还在国内运输。</li>
<li><strong>国际运单号</strong>：转运公司收到包裹后，重新打包并安排国际运输时分配的单号。这个单号才能查到国际段的物流轨迹。</li>
<li><strong>末端派送单号</strong>：包裹到达目的国后，由当地邮政或快递公司负责最后一公里派送时分配的单号。这个单号通常只能在目的国本地邮政系统查询。</li>
</ul>
<p>实际案例：你从淘宝买了东西发到美国转运仓，先收到一个中通快递单号（国内段）。转运公司签收后给你一个 FedEx 国际单号。包裹到达美国后，FedEx 可能把它转交给 USPS 做最后派送，这时又会产生一个 USPS 的末端单号。三个阶段的单号各不相同，需要分别追踪。</p>

<h2>刚生成的单号查不到是怎么回事？</h2>
<p>如果你刚拿到单号就立刻去查，很可能会显示"查无此单"或"信息不存在"。这是正常现象，原因包括：</p>
<ul>
<li><strong>系统尚未同步</strong>：承运商的揽件系统需要时间将运单信息录入数据库，通常有 1-6 小时的延迟。</li>
<li><strong>仅打印了面单但未揽件</strong>：商家可能只是在系统里生成了运单号、打印了快递面单贴在包裹上，但快递员还没有上门取件。此时承运商系统只有运单号，没有物流轨迹。</li>
<li><strong>批量扫描延迟</strong>：快递员揽收包裹后，需要在网点进行扫描入库。如果赶上揽收高峰期（如下午 5-7 点），扫描数据可能延迟上传。</li>
</ul>
<p><strong>实用建议</strong>：拿到单号后不要立刻查，先等 <strong>24-48 小时</strong>再查询。如果超过 48 小时仍然查不到任何信息，建议联系发货方确认单号是否正确或是否已实际发出。</p>

<div class="callout">
<p>💡 <strong>提示</strong>：本站提供<strong>物流追踪工具</strong>，支持批量整理运单号并自动跳转到对应承运商官网。本站不保存物流轨迹，不提供承运服务，实际追踪信息请以承运商为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["快递单号", "物流追踪", "运单号", "承运商"],
    seoTitle: "国际快递单号怎么看 - 各快递公司单号格式识别指南",
    seoDescription: "详解DHL、FedEx、UPS、中国邮政等主要快递公司的单号格式和编码规则，教你快速识别承运商和查询物流状态。",
    relatedTools: ["tracking", "postal-code"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "UPS、FedEx、DHL、邮政渠道有什么区别",
    slug: "international-carrier-comparison-guide",
    excerpt: "四大国际物流渠道各有特点，了解它们的优劣势，选择最适合你的寄送方式。",
    content: `<h2>为什么选择合适的承运商很重要？</h2>
<p>国际快递市场有几家主要参与者，它们在时效、价格、覆盖范围和清关能力上各有不同。选择合适的承运商不仅能节省运费，还能减少清关延误和丢件风险。</p>

<h2>DHL（敦豪速递）</h2>
<p>德国邮政旗下的全球快递品牌，国际快递领域的领导者之一。</p>
<ul>
<li><strong>优势</strong>：欧洲线路最强，全球覆盖220+国家和地区，清关能力强</li>
<li><strong>时效</strong>：全球主要城市 2-5 个工作日</li>
<li><strong>适合</strong>：寄往欧洲、中东、非洲的包裹；文件和小包裹</li>
<li><strong>注意</strong>：美洲和亚洲部分偏远地区可能不如 UPS/FedEx</li>
<li><strong>体积系数</strong>：÷ 5000</li>
</ul>

<h2>FedEx（联邦快递）</h2>
<p>美国总部的全球快递巨头，北美航线优势明显。</p>
<ul>
<li><strong>优势</strong>：北美线路覆盖广，时效稳定，电子产品清关经验丰富</li>
<li><strong>时效</strong>：北美 2-4 个工作日，亚洲 3-5 个工作日</li>
<li><strong>适合</strong>：寄往美国和加拿大的包裹；中高价值货物</li>
<li><strong>注意</strong>：欧洲部分地区派送覆盖不如 DHL</li>
<li><strong>体积系数</strong>：÷ 5000</li>
</ul>

<h2>UPS（联合包裹服务）</h2>
<p>全球最大的包裹递送公司之一，综合物流能力强。</p>
<ul>
<li><strong>优势</strong>：北美线路覆盖面最广，大宗货物价格有竞争力，地面派送网络完善</li>
<li><strong>时效</strong>：北美 2-5 个工作日，全球 3-7 个工作日</li>
<li><strong>适合</strong>：大件重货、北美方向的批量寄送</li>
<li><strong>注意</strong>：国际件偏远地区可能转交当地邮政派送</li>
<li><strong>体积系数</strong>：÷ 5000</li>
</ul>

<h2>邮政渠道（万国邮政联盟）</h2>
<p>包括中国邮政（EMS/e邮宝/挂号信）和目的国邮政的联合派送体系。</p>
<ul>
<li><strong>优势</strong>：价格便宜，覆盖范围最广（连偏远村庄都能到），清关相对宽松</li>
<li><strong>时效</strong>：7-30 个工作日不等，波动较大</li>
<li><strong>适合</strong>：不急于时效的小包裹、个人物品、轻小件</li>
<li><strong>注意</strong>：追踪信息可能不完整，时效不稳定，丢件索赔流程较长</li>
<li><strong>体积系数</strong>：邮政一般不计算体积重（有尺寸上限即可）</li>
</ul>

<h2>快速对比</h2>
<ul>
<li><strong>最快</strong>：DHL ≈ FedEx > UPS > 邮政</li>
<li><strong>最便宜</strong>：邮政 > UPS（重货） > FedEx > DHL</li>
<li><strong>追踪最完善</strong>：DHL = FedEx = UPS > 邮政</li>
<li><strong>清关最强</strong>：DHL（欧洲） > FedEx（北美） > UPS > 邮政</li>
<li><strong>覆盖最广</strong>：邮政 > DHL > UPS > FedEx</li>
</ul>

<h2>选择建议</h2>
<ol>
<li><strong>急件/高价值</strong>：选 DHL 或 FedEx，时效有保障</li>
<li><strong>北美方向</strong>：优先 FedEx 或 UPS</li>
<li><strong>欧洲方向</strong>：优先 DHL</li>
<li><strong>不急/预算有限</strong>：选邮政渠道</li>
<li><strong>大件重货</strong>：UPS 或海运专线</li>
</ol>

<h2>其他值得考虑的渠道</h2>
<ul>
<li><strong>空运专线</strong>：货代整合资源，价格比三大快递便宜，时效 7-15 天</li>
<li><strong>海运</strong>：大批量货物最经济，时效 30-60 天</li>
<li><strong>中欧班列</strong>：中国到欧洲的铁路货运，时效 15-25 天，价格介于空运和海运之间</li>
</ul>

<h2>省钱技巧</h2>
<p>如果你是长期寄件用户，可以考虑以下方法降低运费：通过货代下单通常比直接在承运商官网下单便宜 20%-40%；关注各大快递公司的促销活动和会员折扣；对于不急的包裹，选择邮政渠道能省下一半以上的运费。但要注意，便宜不等于划算——如果因为低价渠道导致包裹延误或清关失败，反而可能产生额外费用。</p>
<div class="callout">
<p>⚠️ <strong>声明</strong>：本站不提供任何承运服务，以上信息仅供参考。时效和价格因具体线路、货物类型和市场行情而异，请以实际承运商报价为准。</p>
</div>`,
    category: "跨境寄送",
    tags: ["DHL", "FedEx", "UPS", "邮政", "承运商对比"],
    seoTitle: "UPS、FedEx、DHL、邮政渠道有什么区别 - 国际快递对比指南",
    seoDescription: "对比四大国际物流渠道的优劣势、时效、价格和适用场景，帮你选择最适合的寄送方式。",
    relatedTools: ["tracking", "shipping-estimator"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "带电产品寄海外要注意什么",
    slug: "shipping-battery-products-overseas",
    excerpt: "含锂电池的产品在国际运输中有严格安全要求，了解 UN38.3 测试和航空运输规定。",
    content: `<h2>为什么带电产品寄送有特殊要求？</h2>
<p>锂电池在国际航空运输中被归类为第9类危险品。原因是锂电池在特定条件下（短路、过充、挤压、高温）可能引发起火甚至爆炸。国际航空运输协会（IATA）对锂电池的空运有非常严格的规定，所有承运商都必须遵守。</p>

<h2>电池的分类</h2>
<p>在航空运输中，电池主要分为以下几类：</p>
<ul>
<li><strong>UN3480</strong>：纯锂电池（单独运输的锂离子电池）</li>
<li><strong>UN3481</strong>：锂电池安装在设备中（如手机、笔记本电脑）</li>
<li><strong>UN3481（PI966/PI967）</strong>：锂电池与设备包装在一起但未安装</li>
<li><strong>UN3090/UN3091</strong>：锂金属电池（较少见，如纽扣电池）</li>
</ul>
<p>不同分类对应不同的运输要求和限制。</p>

<h2>UN38.3 测试是什么？</h2>
<p>UN38.3 是联合国制定的锂电池安全测试标准，所有空运锂电池必须通过以下8项测试：</p>
<ol>
<li><strong>高度模拟</strong>——模拟高空低压环境</li>
<li><strong>温度测试</strong>——极端高低温循环</li>
<li><strong>振动测试</strong>——模拟运输震动</li>
<li><strong>冲击测试</strong>——模拟意外撞击</li>
<li><strong>外部短路</strong>——短路情况下是否安全</li>
<li><strong>撞击/挤压</strong>——受挤压时是否起火</li>
<li><strong>过充测试</strong>——过度充电是否安全</li>
<li><strong>强制放电</strong>——强制放电是否安全</li>
</ol>
<p>只有通过 UN38.3 测试的锂电池才能进行航空运输。购买电池产品时，可以向供应商索要测试报告。</p>

<h2>寄送带电产品的注意事项</h2>

<h3>常见带电产品</h3>
<ul>
<li>🟢 手机、笔记本电脑、平板（内置电池，通常可以寄）</li>
<li>🟡 充电宝/移动电源（需 UN38.3 报告，容量有限制）</li>
<li>🟡 蓝牙耳机、智能手表（内置小电池，一般可以）</li>
<li>🔴 电动滑板车、平衡车（大电池，多数航空禁运）</li>
<li>🔴 纯电池/散装电池（限制最严格）</li>
</ul>

<h3>容量限制</h3>
<ul>
<li><strong>锂电池（Li-ion）</strong>：单块不超过 100Wh（约 27000mAh@3.7V）</li>
<li><strong>100Wh-160Wh</strong>：需要承运商特别批准</li>
<li><strong>超过 160Wh</strong>：通常禁止航空运输</li>
</ul>

<h3>包装要求</h3>
<ul>
<li>电池电极必须做好绝缘保护（贴胶带覆盖）</li>
<li>设备中的电池应确保处于关机状态</li>
<li>使用坚固的外包装，防止挤压和穿刺</li>
<li>部分承运商要求贴锂电池警示标签</li>
</ul>

<h3>申报要求</h3>
<ul>
<li>如实申报品名，注明是否含电池</li>
<li>提供电池类型（锂离子/锂金属）和容量（Wh 或 mAh）</li>
<li>可能需要提供 UN38.3 测试报告摘要</li>
<li>填写危险品申报单（如承运商要求）</li>
</ul>

<h2>如果航空不能寄怎么办？</h2>
<p>对于航空禁运的带电产品（如大容量电池、电动滑板车等），可以考虑：</p>
<ul>
<li><strong>海运渠道</strong>：海运对电池的限制相对宽松，但时效较长（30-60天）</li>
<li><strong>专线渠道</strong>：部分货代有带电专线，可走DG柜（危险品柜）</li>
<li><strong>陆运</strong>：部分邻近国家可通过陆运寄送</li>
</ul>

<h2>常见错误：瞒报带电产品</h2>
<p>有些卖家为了省事或省钱，在申报时不注明产品含电池，这种做法非常危险。一旦被安检发现，包裹可能被扣押、销毁，甚至面临罚款。部分国家海关对瞒报危险品有严格的处罚规定，包括列入黑名单和影响后续寄件。正确申报虽然可能增加一些运费和手续，但能确保包裹安全送达。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站仅提供信息参考，不构成任何物流或安全建议。带电产品的具体运输规则请以承运商和 IATA 最新规定为准。本站不提供承运服务。</p>
</div>`,
    category: "跨境寄送",
    tags: ["带电产品", "锂电池", "UN38.3", "航空安全", "危险品"],
    seoTitle: "带电产品寄海外要注意什么 - 锂电池航空运输指南",
    seoDescription: "详解含锂电池产品的国际航空运输规定，UN38.3测试要求、容量限制和包装申报指南。",
    relatedTools: ["sensitive-goods", "hs-code"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "木制品和家具寄海外为什么要确认熏蒸",
    slug: "wood-furniture-shipping-fumigation-guide",
    excerpt: "木质包装和家具寄往多数国家需要熏蒸证明，了解 ISPM 15 标准和各国植物检疫要求。",
    content: `<h2>什么是熏蒸？</h2>
<p>熏蒸（Fumigation）是用化学药剂或热处理方式杀灭木材中有害生物（如害虫、虫卵、真菌）的过程。这是国际植物检疫的重要环节，目的是防止外来有害生物随木质材料传播。</p>

<h2>为什么木质物品需要熏蒸？</h2>
<p>实木材料可能携带天牛、白蚁、松材线虫等有害生物。这些生物一旦进入新的生态环境，可能造成本地树种大量死亡，严重影响生态平衡。因此，全球绝大多数国家都对进口木质材料有严格的检疫要求。</p>

<h2>ISPM 15 国际标准</h2>
<p>ISPM 15（国际植物检疫措施标准第15号）是全球木质包装材料检疫的国际标准，由联合国粮农组织（FAO）下属的国际植物保护公约（IPPC）制定。</p>
<ul>
<li><strong>适用范围</strong>：所有用于国际运输的木质包装材料（木箱、木托盘、木架、垫木等）</li>
<li><strong>处理方式</strong>：热处理（HT）或溴甲烷熏蒸（MB）</li>
<li><strong>标识要求</strong>：处理后的木材必须加盖 IPPC 标识，包含处理方式代码和国家代码</li>
<li><strong>豁免对象</strong>：胶合板、刨花板、纤维板等人造板材通常豁免（因制造过程中已高温处理）</li>
</ul>

<h2>常见需要熏蒸的木质物品</h2>
<ul>
<li>🟠 <strong>实木家具</strong>（桌椅、柜子、床架等）</li>
<li>🟠 <strong>木制工艺品</strong>（木雕、木制装饰品）</li>
<li>🟠 <strong>木质包装箱/托盘</strong>（出口货物的外包装）</li>
<li>🟠 <strong>竹制品</strong>（部分国家对竹制品有同等要求）</li>
<li>🟢 <strong>人造板材家具</strong>（密度板、刨花板，通常不需要）</li>
<li>🟢 <strong>已加工木制品</strong>（油漆/涂层完全覆盖的成品，部分国家豁免）</li>
</ul>

<h2>熏蒸流程</h2>
<ol>
<li><strong>联系有资质的熏蒸公司</strong>——必须是海关或检验检疫部门认可的机构</li>
<li><strong>货物送检</strong>——熏蒸公司对木材进行检查和处理</li>
<li><strong>出具熏蒸证书</strong>——处理后颁发熏蒸证明（Fumigation Certificate）</li>
<li><strong>加盖 IPPC 标识</strong>——在木质包装上加盖处理标识</li>
<li><strong>随货寄送</strong>——将熏蒸证书随货同行，清关时提交</li>
</ol>

<h2>各国要求差异</h2>
<ul>
<li><strong>美国</strong>：严格执行 ISPM 15，木质包装必须有 IPPC 标识</li>
<li><strong>加拿大</strong>：同美国，要求 IPPC 标识</li>
<li><strong>澳大利亚/新西兰</strong>：全球最严格的植物检疫国家之一，几乎所有实木制品都需要处理</li>
<li><strong>欧盟</strong>：执行 ISPM 15，对来自非欧盟国家的木质包装有要求</li>
<li><strong>日本</strong>：执行 ISPM 15，部分木制品可豁免</li>
</ul>

<h2>未熏蒸的后果</h2>
<ul>
<li>货物在目的国海关被扣留</li>
<li>强制要求退运或销毁</li>
<li>目的国可能收取熏蒸费用（通常比自己处理贵很多）</li>
<li>多次违规可能被列入黑名单</li>
</ul>

<h2>省钱建议</h2>
<ul>
<li>尽量使用<strong>人造板材</strong>（胶合板/密度板）代替实木，通常免熏蒸</li>
<li>提前向承运商和目的国海关确认具体要求</li>
<li>在起运国完成熏蒸，费用通常比在目的国低</li>
<li>保留熏蒸证书原件，以备查验</li>
</ul>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站仅提供信息参考，不构成植物检疫建议。各国对木质材料的检疫要求可能随时调整，请以目的国海关和检验检疫部门的最新规定为准。本站不提供承运服务。</p>
</div>`,
    category: "跨境寄送",
    tags: ["熏蒸", "木制品", "家具寄送", "ISPM15", "植物检疫"],
    seoTitle: "木制品和家具寄海外为什么要确认熏蒸 - ISPM15标准详解",
    seoDescription: "详解木质包装和家具寄海外的熏蒸要求，ISPM 15国际标准、熏蒸流程和各国检疫规定。",
    relatedTools: ["sensitive-goods", "invoice"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "留学生寄行李回国或出国要准备什么",
    slug: "international-student-luggage-shipping-checklist",
    excerpt: "留学生跨国搬家涉及行李整理、物品申报和渠道选择，这份清单帮你理清准备事项。",
    content: `<h2>留学生寄行李的常见场景</h2>
<p>无论是出国留学还是毕业回国，都需要处理大量物品的跨国运输。与快递小包裹不同，行李寄送涉及更多物品、更大的体积和更复杂的清关要求。提前做好准备可以避免很多麻烦。</p>

<h2>出发前：物品整理清单</h2>

<h3>第一步：分类筛选</h3>
<p>把所有物品分成四类：</p>
<ul>
<li><strong>必带</strong>：重要证件、常用药品、不可替代的个人物品</li>
<li><strong>可寄</strong>：衣物、书籍、日常用品等不紧急但需要的物品</li>
<li><strong>可不带</strong>：在当地容易买到且价格差不多的物品</li>
<li><strong>不带</strong>：违禁品、超重超限物品、价值低但体积大的物品</li>
</ul>

<h3>第二步：重要证件（必须随身携带）</h3>
<ul>
<li>护照和签证文件</li>
<li>学校录取通知书/Offer</li>
<li>学历证明和成绩单（建议带公证件）</li>
<li>体检报告（部分国家要求）</li>
<li>驾照及公证件（如计划在当地开车）</li>
<li>重要银行卡和少量现金</li>
</ul>

<h3>第三步：行李寄送渠道选择</h3>
<ul>
<li><strong>航空公司超重行李</strong>：最直接，提前购买额外行李额</li>
<li><strong>国际快递</strong>（DHL/FedEx/UPS）：适合少量紧急物品，时效快但价格高</li>
<li><strong>海运行李托运</strong>：适合大批量行李，价格便宜但时效 30-60 天</li>
<li><strong>留学生行李专线</strong>：部分公司提供门到门的留学生行李寄送服务</li>
<li><strong>邮政包裹</strong>：适合不紧急的小件，价格适中</li>
</ul>

<h2>清关和申报注意事项</h2>

<h3>中国海关留学生免税政策</h3>
<ul>
<li>留学人员回国可申请<strong>自用物品免税入境</strong></li>
<li>需要提供：护照、签证/留学证明、入境申报单</li>
<li>免税额度有上限，超出部分需缴纳关税</li>
<li>部分物品（如汽车）有特殊免税指标，需提前申请</li>
</ul>

<h3>目的国入境申报</h3>
<ul>
<li><strong>美国</strong>：个人物品通常免税，但需申报总价值</li>
<li><strong>英国</strong>：非英国居民的个人物品可免税入境（需填写 C3 表格）</li>
<li><strong>加拿大</strong>：新移民/返校学生的个人物品可免税（BSF186 表格）</li>
<li><strong>澳大利亚</strong>：个人物品免税入境，但需满足"已使用超过12个月"等条件</li>
</ul>

<h2>常见限制物品</h2>
<ul>
<li>🔴 <strong>食品</strong>：肉类、新鲜水果蔬菜通常禁止入境</li>
<li>🔴 <strong>药品</strong>：含麻黄碱、可待因等成分的药物可能被禁</li>
<li>🟡 <strong>现金</strong>：超过规定金额需申报（如中国 2万元人民币，美国 1万美元）</li>
<li>🟡 <strong>电器</strong>：注意电压差异（中国 220V，美国/日本 110V）</li>
<li>🟡 <strong>液体和化妆品</strong>：托运有限制，随身携带有容量限制</li>
</ul>

<h2>实用建议</h2>
<ol>
<li>提前 2-4 周开始整理和寄送行李</li>
<li>给每个箱子编号并拍照记录内容物</li>
<li>制作一份物品清单，中英文各一份</li>
<li>贵重物品和重要文件随身携带，不要寄送</li>
<li>购买运输保险，尤其是高价值物品</li>
<li>保留所有寄送凭证和追踪单号</li>
<li>到达后及时取件，避免目的国仓储费用</li>
</ol>

<div class="callout">
<p>💡 <strong>提示</strong>：本站提供<strong>邮编工具</strong>帮你确认目的国地址格式，<strong>运费估算器</strong>帮你预估寄送费用。本站不提供承运服务，各国海关政策可能调整，请以官方最新规定为准。</p>
</div>`,
    category: "海外生活",
    tags: ["留学生", "行李寄送", "搬家", "清关", "免税"],
    seoTitle: "留学生寄行李回国/出国要准备什么 - 跨国搬家清单",
    seoDescription: "留学生跨国行李寄送全流程指南，包含物品分类、渠道选择、清关申报和各国免税政策。",
    relatedTools: ["postal-code", "shipping-estimator", "invoice"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "跨境收款工具怎么选",
    slug: "cross-border-payment-tools-comparison",
    excerpt: "跨境收款工具有很多种，费率、到账速度和支持的国家各不相同，帮你理清选择思路。",
    content: `<h2>为什么跨境收款需要专门工具？</h2>
<p>传统银行跨境汇款手续费高、到账慢、汇率不透明。无论是跨境电商卖家、自由职业者还是留学生，都需要更高效的跨境收款方式。近年来，涌现了很多专门服务跨境收款的金融科技工具。</p>

<h2>主流跨境收款工具对比</h2>

<h3>PayPal</h3>
<ul>
<li><strong>覆盖</strong>：全球200+国家/地区，支持25+种货币</li>
<li><strong>费率</strong>：收款费率约 2.9% + 固定费用，跨境另加汇率转换费</li>
<li><strong>到账</strong>：即时到账至 PayPal 账户，提现到银行需 1-3 个工作日</li>
<li><strong>适合</strong>：小额收款、C端客户付款、自由职业者</li>
<li><strong>注意</strong>：费率偏高，账户风控严格，冻结风险</li>
</ul>

<h3>Wise（原 TransferWise）</h3>
<ul>
<li><strong>覆盖</strong>：80+国家，支持40+种货币</li>
<li><strong>费率</strong>：透明费率，通常为 0.4%-1%，使用中间市场汇率</li>
<li><strong>到账</strong>：大部分即时或1-2个工作日</li>
<li><strong>适合</strong>：个人跨境转账、自由职业者收款、多币种账户</li>
<li><strong>注意</strong>：不支持所有国家的本地收款账户</li>
</ul>

<h3>Payoneer</h3>
<ul>
<li><strong>覆盖</strong>：200+国家，支持150+种货币</li>
<li><strong>费率</strong>：收款通常免费（取决于付款方），提现费率约 1-2%</li>
<li><strong>到账</strong>：1-3个工作日</li>
<li><strong>适合</strong>：跨境电商卖家（Amazon/Shopify 等）、自由职业者平台</li>
<li><strong>注意</strong>：年费政策可能调整，部分功能需达到一定交易量</li>
</ul>

<h3>Stripe</h3>
<ul>
<li><strong>覆盖</strong>：47+国家/地区</li>
<li><strong>费率</strong>：约 2.9% + 30美分/笔</li>
<li><strong>到账</strong>：2-7个工作日（滚动结算）</li>
<li><strong>适合</strong>：独立站卖家、SaaS 服务、在线订阅收款</li>
<li><strong>注意</strong>：需要公司注册（部分国家支持个人），风控严格</li>
</ul>

<h3>万里汇（WorldFirst）</h3>
<ul>
<li><strong>覆盖</strong>：主要服务中国卖家，支持多币种</li>
<li><strong>费率</strong>：约 0.3% 封顶</li>
<li><strong>到账</strong>：最快当天到账支付宝</li>
<li><strong>适合</strong>：中国跨境电商卖家（Amazon/速卖通等）</li>
<li><strong>注意</strong>：主要面向中国卖家，功能侧重电商收款</li>
</ul>

<h3>XTransfer</h3>
<ul>
<li><strong>覆盖</strong>：主要服务中国外贸企业</li>
<li><strong>费率</strong>：0费率开户，按需收费</li>
<li><strong>到账</strong>：1-3个工作日</li>
<li><strong>适合</strong>：B2B外贸企业、大额收款</li>
<li><strong>注意</strong>：侧重 B2B 贸易场景，需企业资质</li>
</ul>

<h2>选择时需要考虑的因素</h2>
<ol>
<li><strong>收款场景</strong>：B2B 大额还是 B2C 小额？电商平台还是独立站？</li>
<li><strong>目标市场</strong>：收款方主要在哪些国家？</li>
<li><strong>费率结构</strong>：不仅看收款费率，还要看汇率转换费和提现费</li>
<li><strong>到账速度</strong>：是否需要快速回款？</li>
<li><strong>合规要求</strong>：是否需要企业资质？KYC 流程是否繁琐？</li>
<li><strong>多币种支持</strong>：是否需要同时收取多种货币？</li>
<li><strong>提现方式</strong>：能否直接提现到国内银行或支付宝/微信？</li>
</ol>

<h2>省钱小技巧</h2>
<ul>
<li>比较<strong>总成本</strong>而非单一费率——包含汇率差价、提现费、月租等</li>
<li>大额收款优先考虑低费率工具，小额收款优先考虑便捷性</li>
<li>部分工具提供 VIP 费率，交易量达标后可申请优惠</li>
<li>关注汇率波动时机，选择合适的时间提现</li>
</ul>

<h2>合规提醒</h2>
<p>跨境收款涉及外汇管理和税务合规。在中国大陆，个人每年外汇结汇额度为 5 万美元（等值），超出额度需要提供贸易背景材料。企业收款则需要通过正规渠道申报收入并依法纳税。建议使用正规持牌的收款工具，避免通过地下钱庄或个人账户进行大额资金转移，以免触发反洗钱审查。</p>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站仅提供信息参考，不构成金融或投资建议。各工具的费率和政策可能随时调整，请以官方最新公布为准。本站不提供任何金融服务。</p>
</div>`,
    category: "出海经营",
    tags: ["跨境收款", "PayPal", "Wise", "Payoneer", "Stripe"],
    seoTitle: "跨境收款工具怎么选 - 主流收款平台对比指南",
    seoDescription: "对比PayPal、Wise、Payoneer、Stripe等主流跨境收款工具的费率、覆盖和适用场景，帮你选择最合适的收款方式。",
    relatedTools: ["invoice", "hs-code"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "Shopify 新手常用工具清单",
    slug: "shopify-beginner-essential-tools",
    excerpt: "刚接触 Shopify 开店？这份清单涵盖建站、物流、支付、营销的必备工具推荐。",
    content: `<h2>Shopify 是什么？</h2>
<p>Shopify 是全球最流行的独立电商建站平台之一，帮助个人和中小企业快速搭建在线商店。它提供店铺模板、支付集成、订单管理等基础功能，但很多进阶需求需要借助第三方工具来实现。</p>

<h2>店铺搭建与美化</h2>
<ul>
<li><strong>Shopify 主题市场</strong>：官方和第三方主题，选择适合品类的设计风格</li>
<li><strong>PageFly / Shogun</strong>：页面拖拽编辑器，无需代码即可定制页面</li>
<li><strong>Canva</strong>：制作产品图片、Banner、社交媒体素材</li>
<li><strong>Remove.bg</strong>：一键去除产品图背景，制作干净的商品展示图</li>
</ul>

<h2>物流与发货</h2>
<ul>
<li><strong>Shopify Shipping</strong>：Shopify 内置的发货工具，支持 USPS、DHL 等，可打印运单</li>
<li><strong>ShipStation</strong>：多平台订单统一管理，批量打印运单和标签</li>
<li><strong>AfterShip</strong>：订单追踪页面和邮件通知，提升客户体验</li>
<li><strong>DSers / Oberlo 替代</strong>：Dropshipping 模式的选品和自动下单工具</li>
</ul>
<p>提示：处理国际订单时，了解目的国的<strong>地址格式</strong>和<strong>邮编要求</strong>非常重要，可以减少派送失败率。</p>

<h2>支付与收款</h2>
<ul>
<li><strong>Shopify Payments</strong>：内置支付网关（部分地区可用）</li>
<li><strong>Stripe</strong>：信用卡支付处理，覆盖47+国家</li>
<li><strong>PayPal</strong>：全球最广泛接受的在线支付方式</li>
<li><strong>Apple Pay / Google Pay</strong>：移动端快捷支付</li>
<li><strong>Shop Pay</strong>：Shopify 的一键结账方案，转化率更高</li>
</ul>

<h2>营销与增长</h2>
<ul>
<li><strong>Google Analytics 4</strong>：网站流量和用户行为分析</li>
<li><strong>Meta Pixel</strong>：Facebook/Instagram 广告追踪和转化优化</li>
<li><strong>Klaviyo</strong>：邮件营销自动化，支持弃购邮件、欢迎邮件等</li>
<li><strong>Loox / Judge.me</strong>：产品评价收集和展示工具</li>
<li><strong>Yotpo</strong>：评价管理和忠诚度计划</li>
</ul>

<h2>客服与沟通</h2>
<ul>
<li><strong>Tidio</strong>：在线聊天机器人和客服工具</li>
<li><strong>Gorgias</strong>：多渠道客服管理（邮件、聊天、社交媒体）</li>
<li><strong>WhatsApp Business</strong>：与客户直接沟通，适合国际市场</li>
</ul>

<h2>合规与税务</h2>
<ul>
<li><strong>Avalara / TaxJar</strong>：自动计算各国销售税和增值税</li>
<li><strong>GDPR Cookie Consent</strong>：欧盟数据合规 Cookie 提示</li>
<li><strong>商业发票工具</strong>：国际订单需要商业发票，可用在线工具生成</li>
</ul>

<h2>建站前必做事项</h2>
<ol>
<li>确定目标市场和主要销售品类</li>
<li>研究竞争对手的网站设计和定价策略</li>
<li>准备好产品图片和描述（建议英文）</li>
<li>了解目标国家的税费政策和物流渠道</li>
<li>设置合适的退款和售后政策</li>
<li>测试完整的购买流程（从浏览到支付到确认邮件）</li>
</ol>

<h2>新手常见误区</h2>
<ul>
<li>❌ 一开始就安装太多 App——影响网站速度</li>
<li>❌ 忽视移动端体验——大部分流量来自手机</li>
<li>❌ 产品图片质量差——直接影响转化率</li>
<li>❌ 不设置运费规则——可能导致亏本发货</li>
<li>❌ 忽略 SEO——Shopify 基础 SEO 设置要做好</li>
</ul>

<h2>建站前必做事项</h2>
<p>在正式开始之前，建议完成以下准备工作：确定目标市场和主要竞争对手，研究当地消费者的购买习惯和偏好；准备好至少 10-20 个产品的清晰图片和详细描述；注册一个与品牌相关的域名；了解目标国家的税务和合规要求（如欧洲需要 GDPR 合规、IOSS 增值税注册等）；准备至少 1-2 个月的运营资金用于广告测试和前期投入。</p>

<div class="callout">
<p>💡 <strong>提示</strong>：本站提供<strong>商业发票生成器</strong>和<strong>HS编码查询</strong>工具，可辅助 Shopify 国际订单的报关准备。本站不提供电商建站或承运服务，以上工具推荐仅供参考。</p>
</div>`,
    category: "出海经营",
    tags: ["Shopify", "电商工具", "独立站", "跨境电商"],
    seoTitle: "Shopify 新手常用工具清单 - 独立站建站必备工具推荐",
    seoDescription: "涵盖Shopify建站、物流、支付、营销、客服的必备工具推荐，附带新手建站前必做事项和常见误区。",
    relatedTools: ["invoice", "hs-code", "shipping-estimator"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "海外华人常用政府网站导航",
    slug: "overseas-chinese-government-websites-directory",
    excerpt: "汇总各国常用政府网站入口，涵盖税务、移民、领事服务、社保等，方便海外华人快速找到官方信息。",
    content: `<h2>为什么要收藏这些网站？</h2>
<p>海外生活中，很多事务需要直接与政府部门打交道——报税、签证续签、社保申请、证件办理等。各国政府网站通常信息量大但入口分散，提前收藏常用网站可以节省大量搜索时间。</p>

<h2>中国相关</h2>
<ul>
<li><strong>外交部领事服务网</strong>（cs.mfa.gov.cn）：护照/旅行证办理、领事认证、海外安全提醒</li>
<li><strong>中国领事 APP</strong>：海外中国公民在线办理护照、旅行证等业务</li>
<li><strong>国家移民管理局</strong>（nia.gov.cn）：出入境政策、签证/居留许可查询</li>
<li><strong>海关总署</strong>（customs.gov.cn）：进出境物品规定、税率查询</li>
<li><strong>人社部</strong>（mohrss.gov.cn）：社保政策、回国就业信息</li>
<li><strong>教育部留学服务中心</strong>（cscse.edu.cn）：学历认证、留学回国证明</li>
</ul>

<h2>美国</h2>
<ul>
<li><strong>USCIS</strong>（uscis.gov）：移民局官网，签证/绿卡/入籍申请和状态查询</li>
<li><strong>IRS</strong>（irs.gov）：国税局，联邦税务申报和退税</li>
<li><strong>SSA</strong>（ssa.gov）：社会保障局，社保号申请和福利查询</li>
<li><strong>USPS</strong>（usps.com）：邮政服务，包裹追踪和地址变更</li>
<li><strong>DMV</strong>：各州车辆管理局网站（搜索"州名 + DMV"），驾照和车辆登记</li>
<li><strong>CBP</strong>（cbp.gov）：海关和边境保护，入境规定和申报要求</li>
</ul>

<h2>加拿大</h2>
<ul>
<li><strong>IRCC</strong>（canada.ca/en/immigration-refugees-citizenship）：移民、难民和公民部，签证和永居申请</li>
<li><strong>CRA</strong>（canada.ca/en/revenue-agency）：税务局，个人所得税申报（NETFILE/ EFILE）</li>
<li><strong>Service Canada</strong>（canada.ca/en/employment-social-development）：社保号（SIN）、 Employment Insurance</li>
<li><strong>Canada Post</strong>（canadapost.ca）：邮政服务，邮编查询和包裹追踪</li>
<li><strong>CICIC</strong>（cicic.ca）：学历认证和加拿大资格框架</li>
</ul>

<h2>英国</h2>
<ul>
<li><strong>GOV.UK</strong>（gov.uk）：英国政府综合门户网站，几乎所有政府服务</li>
<li><strong>UKVI</strong>（gov.uk/browse/visas-immigration）：签证和移民服务</li>
<li><strong>HMRC</strong>（gov.uk/government/organisations/hm-revenue-customs）：税务和海关</li>
<li><strong>Home Office</strong>（gov.uk/government/organisations/home-office）：内政部，居留和公民身份</li>
<li><strong>NHS</strong>（nhs.uk）：国民医疗服务，注册 GP 和健康咨询</li>
</ul>

<h2>澳大利亚</h2>
<ul>
<li><strong>Home Affairs</strong>（homeaffairs.gov.au）：内政部，签证和移民事务</li>
<li><strong>ATO</strong>（ato.gov.au）：税务局，税务申报和税务文件号（TFN）</li>
<li><strong>Services Australia</strong>（servicesaustralia.gov.au）：社保服务（Centrelink）、Medicare</li>
<li><strong>Australia Post</strong>（auspost.com.au）：邮政服务</li>
</ul>

<h2>实用建议</h2>
<ol>
<li><strong>认准 .gov / .gov.cn / .gc.ca 域名</strong>：这些是官方政府域名，避免进入仿冒网站</li>
<li><strong>启用网站收藏</strong>：将常用网站加入书签或添加到手机桌面</li>
<li><strong>关注官方通知</strong>：各国政府网站会发布政策更新和截止日期提醒</li>
<li><strong>准备必要材料</strong>：访问政府网站前，准备好护照、签证、住址证明等文件</li>
<li><strong>使用官方翻译工具</strong>：部分政府网站支持多语言，但重要文件建议仔细阅读原文</li>
</ol>

<h2>紧急联系方式</h2>
<ul>
<li><strong>外交部全球领事保护与服务应急热线</strong>：+86-10-12308</li>
<li><strong>当地紧急电话</strong>：美国/加拿大 911、英国 999、澳洲 000、欧洲 112</li>
<li><strong>中国驻当地使领馆</strong>：可通过外交部官网查询具体联系方式</li>
</ul>

<h2>使用建议</h2>
<p>访问政府网站时，建议将常用网站加入书签或浏览器收藏夹，以便快速访问。大部分政府网站都提供多语言版本，但核心业务页面通常只有官方语言版本，建议提前做好翻译准备。遇到在线表格填写时，注意保留截图和提交确认页面作为记录。如果遇到网站维护或无法访问的情况，可以直接拨打官方客服热线咨询。此外，建议定期关注使领馆微信公众号或邮件订阅，及时获取最新政策变动和领事通知。</p>

<div class="callout">
<p>💡 <strong>提示</strong>：本站仅提供信息参考，各国政府网站可能更新改版，请以官方网站实际内容为准。本站不提供任何政府服务或法律咨询服务。</p>
</div>`,
    category: "海外生活",
    tags: ["政府网站", "海外华人", "领事服务", "税务", "签证"],
    seoTitle: "海外华人常用政府网站导航 - 各国官方网站入口汇总",
    seoDescription: "汇总中国、美国、加拿大、英国、澳洲等国家的常用政府网站，涵盖税务、移民、领事、社保等服务入口。",
    relatedTools: ["postal-code", "tracking"],
    author: "海外百宝箱",
    status: "published",
  },
  {
    title: "如何整理一份标准的跨境寄送资料",
    slug: "standard-cross-border-shipping-documentation-guide",
    excerpt: "跨境寄送需要准备多份文件，教你系统地整理和归档寄送资料，让每次寄件都有条不紊。",
    content: `<h2>为什么需要整理寄送资料？</h2>
<p>跨境寄送涉及的文件比国内快递复杂得多。从商业发票、装箱单到 HS 编码、运单号，每份文件都在清关和派送中扮演不同角色。整理好这些资料不仅能加快清关速度，还能在出现问题时快速追溯和解决。</p>

<h2>跨境寄送必备文件清单</h2>

<h3>1. 商业发票（Commercial Invoice）</h3>
<p>清关核心文件，说明货物的价值和交易信息。</p>
<ul>
<li>发货人和收货人的完整信息（名称、地址、电话）</li>
<li>货物的详细描述（英文）</li>
<li>每种货物的数量、单价和总价</li>
<li>HS 编码（至少前6位）</li>
<li>原产国</li>
<li>交易条款（如 FOB、CIF、DDP 等）</li>
<li>货币单位和金额</li>
</ul>

<h3>2. 装箱单（Packing List）</h3>
<p>说明货物的物理包装信息，与商业发票配合使用。</p>
<ul>
<li>每个箱子的编号和内含品项</li>
<li>每箱的毛重和净重</li>
<li>每箱的尺寸（长×宽×高）</li>
<li>总箱数、总重量和总体积（CBM）</li>
</ul>

<h3>3. 运单/面单（Waybill / Shipping Label）</h3>
<p>承运商提供的运输凭证，贴在包裹外部。</p>
<ul>
<li>运单号（追踪号）</li>
<li>收发件人地址</li>
<li>承运商条码</li>
<li>如有特殊要求，贴相应标签（如"易碎""此面向上"等）</li>
</ul>

<h3>4. 其他可能需要的文件</h3>
<ul>
<li><strong>原产地证</strong>（Certificate of Origin）：证明货物原产地，可能享受关税优惠</li>
<li><strong>熏蒸证书</strong>：含木质包装的货物需要</li>
<li><strong>危险品申报单</strong>：含电池、化学品等特殊货物</li>
<li><strong>品牌授权书</strong>：寄送品牌商品可能需要</li>
<li><strong>检验证书</strong>：食品、化妆品等可能需要目的国要求的检验文件</li>
</ul>

<h2>如何系统地整理资料？</h2>

<h3>第一步：寄前准备清单</h3>
<p>每次寄件前，按照以下清单逐项准备：</p>
<ol>
<li>确认货物内容和数量</li>
<li>测量并记录每个包裹的重量和尺寸</li>
<li>查询每种货物的 HS 编码</li>
<li>填写商业发票（中英文）</li>
<li>填写装箱单</li>
<li>确认收件人地址和邮编格式正确</li>
<li>检查是否有特殊物品需要额外文件</li>
</ol>

<h3>第二步：文件归档</h3>
<p>建议为每票货物建立独立的文件夹，包含：</p>
<ul>
<li>📁 商业发票（PDF 或打印件）</li>
<li>📁 装箱单</li>
<li>📁 运单号截图</li>
<li>📁 付款凭证</li>
<li>📁 与承运商的沟通记录</li>
<li>📁 包裹照片（寄前拍摄）</li>
</ul>

<h3>第三步：追踪记录</h3>
<p>制作一份简单的追踪表格：</p>
<div class="code-block">
| 日期 | 运单号 | 承运商 | 目的地 | 状态 | 备注 |
|------|--------|--------|--------|------|------|
| 2024-03-01 | XXXXXX | DHL | 美国 | 清关中 | - |
</div>
<p>可以使用 Excel、Google Sheets 或 Notion 等工具维护。</p>

<h2>电子化管理建议</h2>
<ul>
<li><strong>命名规范</strong>：文件名包含日期、运单号和文件类型，如 "2024-03-01_DHL123456_CommercialInvoice.pdf"</li>
<li><strong>云端备份</strong>：所有文件上传到云端（Google Drive、OneDrive 等），防止丢失</li>
<li><strong>定期整理</strong>：每月整理一次，将已完成和未完成的订单分开归档</li>
<li><strong>保留期限</strong>：建议保留至少 2 年，以备可能的海关查验或纠纷</li>
</ul>

<h2>使用本站工具</h2>
<ul>
<li><strong>发票生成器</strong>：快速生成规范的商业发票和装箱单</li>
<li><strong>HS 编码查询</strong>：查询常见商品的 HS 编码参考</li>
<li><strong>运单号整理</strong>：批量格式化运单号并生成追踪链接</li>
<li><strong>邮编格式校验</strong>：验证目的国邮编格式</li>
<li><strong>敏感物品参考</strong>：查询特殊物品的寄送注意事项</li>
</ul>

<div class="callout">
<p>⚠️ <strong>声明</strong>：本站提供的工具和信息仅供参考，不构成法律或海关建议。各国海关对单证的具体要求可能不同，请以承运商和目的国海关的实际要求为准。本站不提供承运服务。</p>
</div>`,
    category: "跨境寄送",
    tags: ["资料整理", "商业发票", "装箱单", "报关", "文档管理"],
    seoTitle: "如何整理一份标准的跨境寄送资料 - 寄件文件清单指南",
    seoDescription: "系统整理跨境寄送所需的全部文件，包含商业发票、装箱单、运单等必备清单和电子化管理建议。",
    relatedTools: ["invoice", "hs-code", "tracking"],
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
      { name: "GOV.UK 政府服务", url: "https://www.gov.uk", desc: "英国政府官方综合服务平台，涵盖签证、税务、医疗、教育等所有公共服务入口。", tags: ["政府服务", "英国", "公共服务"], sourceType: "official", usage: "英国居民查询和使用各类政府服务" },
      { name: "Service Canada", url: "https://www.canada.ca/en/services.html", desc: "加拿大政府综合服务平台，提供社保、护照、就业、移民等一站式服务。", tags: ["政府服务", "加拿大", "公共服务"], sourceType: "official", usage: "加拿大居民办理社保、护照等政府事务" },
      { name: "NHS 英国国民医保", url: "https://www.nhs.uk", desc: "英国国家医疗服务体系官网，提供医疗信息查询、GP注册和急诊指南。", tags: ["医疗", "英国", "医保"], sourceType: "official", usage: "在英国注册和使用公共医疗服务" },
      { name: "Medicare 澳洲医保", url: "https://www.servicesaustralia.gov.au/medicare", desc: "澳大利亚政府医疗保险服务，覆盖公立医院和基础医疗服务。", tags: ["医疗", "澳洲", "医保"], sourceType: "official", usage: "在澳洲享受公共医疗保险服务" },
      { name: "RBC 皇家银行", url: "https://www.rbc.com", desc: "加拿大皇家银行（Royal Bank of Canada），北美最大银行之一，提供个人和企业银行服务。", tags: ["银行", "加拿大", "金融"], sourceType: "third-party", usage: "在加拿大开户和办理银行业务" },
      { name: "Chase 大通银行", url: "https://www.chase.com", desc: "美国最大银行之一，提供支票账户、储蓄账户、信用卡和贷款服务。", tags: ["银行", "美国", "金融"], sourceType: "third-party", usage: "在美国开户和办理银行业务" },
      { name: "Allstate 保险", url: "https://www.allstate.com", desc: "美国知名保险公司，提供车险、房屋险、人寿险等多种保险产品。", tags: ["保险", "美国", "金融"], sourceType: "third-party", usage: "在美国购买各类保险" },
      { name: "AT&T 电信服务", url: "https://www.att.com", desc: "美国主要电信运营商，提供手机套餐、家庭宽带和电视服务。", tags: ["电信", "美国", "通讯"], sourceType: "third-party", usage: "在美国办理手机和网络套餐" },
      { name: "StudyPortals 留学平台", url: "https://www.studyportals.com", desc: "全球留学信息聚合平台，涵盖课程搜索、学校对比和申请指南。", tags: ["学校", "留学", "教育"], sourceType: "third-party", usage: "搜索和比较海外留学课程和学校" },
      { name: "Meetup 社区活动", url: "https://www.meetup.com", desc: "全球线下社交活动平台，帮助海外华人找到本地兴趣社群和活动。", tags: ["社区", "社交", "第三方"], sourceType: "third-party", usage: "寻找本地华人社区和兴趣活动" },
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
      { name: "ShipBob 仓储 Fulfillment", url: "https://www.shipbob.com", desc: "跨境电商仓储和履约平台，提供全球仓库网络和订单处理服务。", tags: ["仓储", "履约", "第三方"], sourceType: "third-party", usage: "跨境电商订单仓储和代发" },
      { name: "Flexport 货运代理", url: "https://www.flexport.com", desc: "数字化国际货运代理平台，提供海运、空运和清关一站式服务。", tags: ["清关", "货代", "第三方"], sourceType: "third-party", usage: "国际货运和报关清关服务" },
      { name: "Pirate Ship 运费比价", url: "https://www.pirateship.com", desc: "免费 USPS 和 UPS 运费比价和打单平台，享受商业折扣价。", tags: ["比价", "打单", "第三方"], sourceType: "third-party", usage: "美国境内 USPS/UPS 折扣运费" },
      { name: "Easyship 跨境物流", url: "https://www.easyship.com", desc: "跨境物流聚合平台，对比250+承运商运费和时效，一键打单。", tags: ["比价", "跨境", "第三方"], sourceType: "third-party", usage: "对比国际快递价格和时效" },
      { name: "Shippo 物流平台", url: "https://goshippo.com", desc: "多承运商物流平台，支持 USPS、UPS、FedEx 等，API 集成方便。", tags: ["物流", "API", "第三方"], sourceType: "third-party", usage: "电商订单多承运商打单和管理" },
      { name: "Freightos 货运比价", url: "https://www.freightos.com", desc: "国际货运在线比价平台，覆盖海运、空运和快递，即时报价。", tags: ["比价", "货运", "第三方"], sourceType: "third-party", usage: "国际海运和空运在线比价" },
      { name: "ShipStation 订单管理", url: "https://www.shipstation.com", desc: "电商订单管理和打单平台，支持多平台订单聚合和批量处理。", tags: ["订单管理", "打单", "第三方"], sourceType: "third-party", usage: "多平台电商订单集中管理和打单" },
      { name: "Shipsurance 运输保险", url: "https://www.shipsurance.com", desc: "专业包裹运输保险服务，为国际和国内快递提供货物损失保障。", tags: ["保险", "运输", "第三方"], sourceType: "third-party", usage: "为高价值包裹购买运输保险" },
      { name: "MyUS 集运转运", url: "https://www.myus.com", desc: "美国地址转运服务，提供美国仓库地址和全球集运派送。", tags: ["集运", "转运", "第三方"], sourceType: "third-party", usage: "获取美国地址并转运到全球" },
      { name: "Stackry 集运仓储", url: "https://www.stackry.com", desc: "美国免税州仓储集运服务，提供免费仓储和全球派送。", tags: ["集运", "仓储", "第三方"], sourceType: "third-party", usage: "美国免税州地址集运" },
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
      { name: "Zendesk 客服系统", url: "https://www.zendesk.com", desc: "全球领先的客户服务平台，提供工单、在线聊天和帮助中心解决方案。", tags: ["客服", "SaaS", "第三方"], sourceType: "third-party", usage: "搭建跨境电商客服系统" },
      { name: "HubSpot CRM", url: "https://www.hubspot.com", desc: "免费 CRM 和营销自动化平台，覆盖销售、营销和客户服务。", tags: ["CRM", "营销", "第三方"], sourceType: "third-party", usage: "客户关系管理和营销自动化" },
      { name: "Mailchimp 邮件营销", url: "https://mailchimp.com", desc: "全球知名邮件营销平台，提供邮件设计、自动化和数据分析。", tags: ["营销", "邮件", "第三方"], sourceType: "third-party", usage: "跨境电商邮件营销和客户维护" },
      { name: "Namecheap 域名注册", url: "https://www.namecheap.com", desc: "知名域名注册商，提供域名注册、SSL 证书和主机服务。", tags: ["域名", "注册", "第三方"], sourceType: "third-party", usage: "注册和管理出海业务域名" },
      { name: "Cloudflare 域名与 CDN", url: "https://www.cloudflare.com", desc: "全球 CDN 和域名管理服务，提供 DNS、SSL 和网络安全防护。", tags: ["域名", "CDN", "第三方"], sourceType: "third-party", usage: "网站加速和域名 DNS 管理" },
      { name: "Avalara 税务合规", url: "https://www.avalara.com", desc: "自动化销售税和增值税合规平台，覆盖全球180+国家/地区。", tags: ["税务", "合规", "第三方"], sourceType: "third-party", usage: "跨境电商自动计算和申报销售税" },
      { name: "LegalZoom 法律服务", url: "https://www.legalzoom.com", desc: "美国在线法律服务平台，提供公司注册、合同审查和法律咨询。", tags: ["法务", "注册", "第三方"], sourceType: "third-party", usage: "在美国注册公司或处理法律事务" },
      { name: "Oracle NetSuite ERP", url: "https://www.netsuite.com", desc: "云端 ERP 系统，集成财务、订单、库存和电商管理。", tags: ["ERP", "管理", "第三方"], sourceType: "third-party", usage: "中大型企业一体化业务管理" },
      { name: "QuickBooks 财务软件", url: "https://quickbooks.intuit.com", desc: "Intuit 旗下中小型企业财务管理软件，支持 invoicing 和报税。", tags: ["财务", "税务", "第三方"], sourceType: "third-party", usage: "中小企业财务管理和税务申报" },
      { name: "GoDaddy 域名注册", url: "https://www.godaddy.com", desc: "全球最大域名注册商之一，提供域名注册、建站和邮箱服务。", tags: ["域名", "注册", "第三方"], sourceType: "third-party", usage: "注册出海业务域名和建站" },
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
      { name: "报关单模板（Customs Declaration）", url: "/tools/invoice", desc: "标准进出口报关单模板，包含商品明细、HS编码和申报价值字段。", tags: ["报关单", "模板", "海关"], sourceType: "internal", usage: "填写进出口报关单" },
      { name: "提单模板（Bill of Lading）", url: "/tools/invoice", desc: "海运提单和空运提单参考模板，说明各字段含义和填写规范。", tags: ["提单", "模板", "运单"], sourceType: "internal", usage: "理解和学习提单填写" },
      { name: "原产地证模板（Certificate of Origin）", url: "/tools/invoice", desc: "原产地证明书参考模板，用于证明货物制造地以享受关税优惠。", tags: ["原产地证", "模板", "关税"], sourceType: "internal", usage: "申请原产地证明以减免关税" },
      { name: "销售合同模板（Sales Contract）", url: "/tools/quote", desc: "国际贸易销售合同模板，涵盖价格条款、付款方式和违约责任。", tags: ["合同", "模板", "外贸"], sourceType: "internal", usage: "起草跨境销售合同" },
      { name: "采购订单模板（Purchase Order）", url: "/tools/quote", desc: "标准采购订单模板，适用于跨境电商和B2B采购场景。", tags: ["采购单", "模板", "B2B"], sourceType: "internal", usage: "向供应商下达采购订单" },
      { name: "航空运单模板（Air Waybill）", url: "/tools/invoice", desc: "国际航空运单参考模板，包含托运人、收货人和货物信息。", tags: ["运单", "模板", "空运"], sourceType: "internal", usage: "填写国际空运运单" },
      { name: "运输保险单模板（Insurance Certificate）", url: "/tools/invoice", desc: "国际货物运输保险凭证模板，用于CIF条款下的保险证明。", tags: ["保险单", "模板", "运输"], sourceType: "internal", usage: "办理货物运输保险凭证" },
      { name: "检验证书模板（Inspection Certificate）", url: "/tools/invoice", desc: "商品检验证书参考模板，用于证明货物质量和规格符合要求。", tags: ["检验证书", "模板", "质检"], sourceType: "internal", usage: "申请商品质量检验证明" },
      { name: "贷项通知单模板（Credit Note）", url: "/tools/quote", desc: "退货和退款场景下的贷项通知单模板，用于财务对账。", tags: ["退货单", "模板", "财务"], sourceType: "internal", usage: "处理退货退款和对账" },
      { name: "形式发票模板（Proforma Invoice）", url: "/tools/invoice", desc: "形式发票参考模板，用于报价和预付款阶段，非正式报关文件。", tags: ["形式发票", "模板", "报价"], sourceType: "internal", usage: "报价阶段提供给买方的形式发票" },
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
