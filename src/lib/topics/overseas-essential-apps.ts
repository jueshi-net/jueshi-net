// 专题页：出海之后必装 APP 评级推荐
// 数据仅供个人学习参考，不代表任何商业背书

export type AppRating = "S" | "A" | "B" | "C" | "D";
export type AppCategory =
  | "social"
  | "search"
  | "video"
  | "work"
  | "privacy"
  | "creator"
  | "communication"
  | "other";

export interface AppEntry {
  name: string;
  alias: string;
  rating: AppRating;
  category: AppCategory;
  domain: string;
  iconUrl?: string;
  analogy: string;
  description: string;
  suitableFor: string;
  warning: string;
  beginnerRecommended: boolean;
}

export const apps: AppEntry[] = [
  {
    name: "Gmail",
    alias: "Google 邮箱",
    rating: "S",
    category: "communication",
    domain: "https://mail.google.com/",
    analogy: "国内类比：QQ 邮箱 + 163 邮箱，但更正式",
    description:
      "海外几乎所有服务的注册、登录、通知都离不开 Gmail。它不仅是邮箱，更是你的海外数字身份。找工作、申请学校、绑定银行、注册各类 App，一个 Gmail 账号全搞定。",
    suitableFor: "所有人，出海第一步就是注册 Gmail",
    warning: "务必开启两步验证（2FA），否则账号被盗后几乎无法找回。不要在公共电脑上保持登录状态。",
    beginnerRecommended: true,
  },
  {
    name: "WhatsApp",
    alias: "海外微信",
    rating: "S",
    category: "communication",
    domain: "https://www.whatsapp.com/",
    analogy: "国内类比：微信（但不支持公众号/朋友圈/支付）",
    description:
      "全球 20+ 亿人使用的即时通讯工具，是海外日常沟通、社群交流、商家客服的主流渠道。没有 WhatsApp，在海外几乎寸步难行。",
    suitableFor: "所有人，尤其是需要和当地朋友、同事、商家沟通的人",
    warning: "聊天记录默认端到端加密，但换手机时务必备份到 Google Drive 或 iCloud，否则记录会丢失。谨防冒充熟人的诈骗信息。",
    beginnerRecommended: true,
  },
  {
    name: "YouTube",
    alias: "油管",
    rating: "S",
    category: "video",
    domain: "https://www.youtube.com/",
    analogy: "国内类比：B 站 + 优酷，但内容更丰富",
    description:
      "全球最大的视频平台。学外语、看教程、了解当地生活、学做菜修电脑、甚至看新闻，YouTube 几乎覆盖了所有学习场景。海外生活必备的信息来源。",
    suitableFor: "所有人，尤其适合想自学新技能的人",
    warning: "评论区广告和诈骗链接非常多，不要点击任何要求你登录外部链接的评论。不要相信「免费领取」类骗局。",
    beginnerRecommended: true,
  },
  {
    name: "X（Twitter）",
    alias: "推特",
    rating: "A",
    category: "social",
    domain: "https://x.com/",
    analogy: "国内类比：微博，但更侧重即时新闻和观点讨论",
    description:
      "全球最活跃的实时信息流平台之一。关注科技、创业、AI、时政、体育赛事，X 上的信息更新速度远超传统媒体。也是海外华人资讯交流的重要阵地。",
    suitableFor: "想获取实时资讯、关注行业动态、参与话题讨论的人",
    warning: "信息真假参半，不要轻信单一来源。冒充名人的诈骗账号非常多，注意蓝 V 认证。不要随意点击私信中的链接。",
    beginnerRecommended: true,
  },
  {
    name: "Instagram",
    alias: "IG / 照片墙",
    rating: "A",
    category: "social",
    domain: "https://www.instagram.com/",
    analogy: "国内类比：小红书（但更偏图片/短视频，少文字攻略）",
    description:
      "全球最大的图片社交平台。海外品牌、餐厅、景点、穿搭、美食，几乎所有消费决策都可以在 IG 上找到参考。也是海外华人分享生活的重要平台。",
    suitableFor: "想了解当地生活、发现好物、分享日常的人",
    warning: "私信中经常有冒充品牌的诈骗消息（如「你被选中为品牌大使」），一律忽略。不要在 IG 上暴露过多个人信息如家庭住址。",
    beginnerRecommended: true,
  },
  {
    name: "Reddit",
    alias: "红迪",
    rating: "A",
    category: "social",
    domain: "https://www.reddit.com/",
    analogy: "国内类比：贴吧 + 知乎，但更匿名、社区自治更强",
    description:
      "被称为「互联网的首页」，拥有超过 10 万个活跃社区（Subreddit）。无论是留学、移民、买房、技术讨论、还是本地生活，都能找到专门的社区讨论。",
    suitableFor: "想深入了解某个话题、寻求真实用户经验的人",
    warning: "Reddit 以匿名为主，部分社区信息质量参差不齐。不要轻信投资建议（如加密货币帖子）。每个社区有自己的版规，发帖前先阅读。",
    beginnerRecommended: true,
  },
  {
    name: "Spotify",
    alias: "声破天",
    rating: "A",
    category: "creator",
    domain: "https://www.spotify.com/",
    analogy: "国内类比：QQ 音乐 + 网易云音乐",
    description:
      "全球最大的音乐流媒体平台。曲库远超本地音乐 App，支持播客、有声书，算法推荐非常精准。海外几乎人人都在用，免费版有广告但不影响核心体验。",
    suitableFor: "喜欢听音乐、听播客的人",
    warning: "免费用户在移动端只能随机播放，不能指定歌曲（桌面端无此限制）。不同地区的曲库内容有差异，搬家后可能发现某些歌不可用。",
    beginnerRecommended: true,
  },
  {
    name: "Telegram",
    alias: "电报 / 纸飞机",
    rating: "A",
    category: "communication",
    domain: "https://telegram.org/",
    analogy: "国内类比：微信 + QQ 群，但更侧重隐私和大型社群",
    description:
      "以隐私保护著称的通讯工具。支持高达 20 万人的群组、频道广播、机器人、文件共享（最大 2GB）。海外华人社区、技术社区、加密货币社区广泛使用。",
    suitableFor: "需要加入海外社群、技术交流、关注频道的用户",
    warning: "⚠️ 诈骗风险高：TG 上冒充官方客服、假冒交易、虚假投资群非常普遍。永远不要相信「先转账后发货」。不要点击陌生人发来的链接。涉及金钱交易务必走正规渠道。",
    beginnerRecommended: true,
  },
  {
    name: "Discord",
    alias: "语音社群平台",
    rating: "B",
    category: "social",
    domain: "https://discord.com/",
    analogy: "国内类比：YY 语音 + QQ 群频道",
    description:
      "以语音频道和文字频道为核心的社群平台。游戏社区、AI 工具社区、开源项目、学习小组、Web3 项目都使用 Discord 进行实时协作和交流。",
    suitableFor: "游戏玩家、AI 用户、开源爱好者、想加入语音社群的人",
    warning: "部分社群有年龄限制（18+）。不要加入不明来源的私人服务器。谨防「Nitro 免费领取」钓鱼链接，这最常见的 Discord 诈骗方式。",
    beginnerRecommended: false,
  },
  {
    name: "Wikipedia",
    alias: "维基百科",
    rating: "S",
    category: "search",
    domain: "https://www.wikipedia.org/",
    analogy: "国内类比：百度百科，但参考价值和引用规范更高",
    description:
      "全球最大的免费在线百科全书。学术论文引用、了解陌生概念、查找历史事件背景，Wikipedia 的参考价值远超大多数中文百科。条目底部的大量参考文献是额外宝藏。",
    suitableFor: "学生、研究者、对任何领域想深入了解的人",
    warning: "维基百科是开放编辑的，任何人可以修改条目（虽然有审核机制）。学术写作中不建议直接引用维基百科，应使用其底部的原始参考文献。",
    beginnerRecommended: true,
  },
  {
    name: "Facebook",
    alias: "脸书 / FB",
    rating: "B",
    category: "social",
    domain: "https://www.facebook.com/",
    analogy: "国内类比：人人网（但规模大得多），+ 各种功能混合体",
    description:
      "全球最大的社交平台，月活超过 30 亿。海外很多社区活动、本地信息、二手交易（Facebook Marketplace）、群组讨论仍然依赖 Facebook。",
    suitableFor: "想加入本地社区群组、使用 Marketplace 买卖二手的人",
    warning: "隐私设置非常复杂，默认设置可能暴露过多信息。务必检查「谁可以看到你的帖子」「谁能搜索到你」。Marketplace 交易诈骗也很常见，面交优先。",
    beginnerRecommended: false,
  },
  {
    name: "LinkedIn",
    alias: "领英",
    rating: "B",
    category: "work",
    domain: "https://www.linkedin.com/",
    analogy: "国内类比：脉脉 + BOSS 直聘（但更正式和国际化）",
    description:
      "全球最大的职业社交平台。找工作、建立行业人脉、展示职业履历、了解行业动态，LinkedIn 是海外职场人的「第二张名片」。很多公司招聘首选渠道就是 LinkedIn。",
    suitableFor: "求职者、职场人、自由职业者、创业者",
    warning: "个人资料就是你的简历，请认真填写并保持专业形象。LinkedIn 上常有 fake recruiter（虚假招聘）发钓鱼消息，注意核实公司真实性。",
    beginnerRecommended: false,
  },
  {
    name: "Google Voice",
    alias: "GV 虚拟号码",
    rating: "B",
    category: "communication",
    domain: "https://voice.google.com/",
    analogy: "国内类比：类似阿里小号，但免费且功能更强",
    description:
      "Google 提供的免费虚拟电话号码服务。可以用来注册需要美国号码的服务、收短信验证码、打电话。对于刚到海外还没有本地手机号的人非常实用。",
    suitableFor: "刚到海外需要临时号码注册服务的人",
    warning: "不同地区的可用性差异很大，很多服务已不再支持新注册 Google Voice。长期不使用的号码可能被回收。不要依赖 GV 作为唯一的联系方式，部分银行和重要服务不接受 GV 号码。",
    beginnerRecommended: false,
  },
  {
    name: "TikTok",
    alias: "抖音国际版",
    rating: "B",
    category: "creator",
    domain: "https://www.tiktok.com/",
    analogy: "国内类比：抖音",
    description:
      "全球最受欢迎的短视频平台之一。娱乐消遣之外，TikTok 也是了解海外流行趋势、发现新品、学习短教程（烹饪、穿搭、DIY）的高效渠道。内容算法推荐非常精准。",
    suitableFor: "喜欢刷短视频、想了解海外流行文化的人",
    warning: "TikTok 的数据隐私问题在一些国家受到审查。不要在 App 中分享过多个人位置信息。评论区有引导到外部诈骗网站的链接，切勿点击。",
    beginnerRecommended: false,
  },
  {
    name: "Pinterest",
    alias: "拼趣",
    rating: "C",
    category: "creator",
    domain: "https://www.pinterest.com/",
    analogy: "国内类比：花瓣网 + 小红书图片版",
    description:
      "全球最大的图片灵感收藏平台。室内设计、穿搭灵感、婚礼策划、手工 DIY、菜谱，Pinterest 是视觉灵感的首选。适合喜欢整理和收藏图片的人。",
    suitableFor: "做设计、装修、手工、穿搭灵感的人",
    warning: "Pinterest 上的链接可能指向过时或已失效的网页。部分图片带水印或版权保护，不要直接商用。",
    beginnerRecommended: false,
  },
  {
    name: "GitHub",
    alias: "代码托管平台",
    rating: "A",
    category: "work",
    domain: "https://github.com/",
    analogy: "国内类比：Gitee（码云），但全球生态远更大",
    description:
      "全球最大的代码托管和开源社区。不只是程序员用——很多免费工具、AI 模型、数据集、自动化脚本都可以在 GitHub 上找到。也是学习编程的最佳实践参考。",
    suitableFor: "开发者、想学编程的人、需要找开源工具的人",
    warning: "不要运行来源不明的脚本或可执行文件，即使它在 GitHub 上。检查项目的 Star 数量、Issues 和最后一次更新时间来评估可靠性。永远从官方仓库下载，不要从第三方镜像。",
    beginnerRecommended: false,
  },
  {
    name: "Quora",
    alias: "海外知乎",
    rating: "C",
    category: "search",
    domain: "https://www.quora.com/",
    analogy: "国内类比：知乎（但用户群体和讨论风格不同）",
    description:
      "问答社区平台，可以提问和回答各种问题。留学申请、签证经验、海外生活建议，Quora 上有很多真实用户的长篇经验分享。英文写作质量普遍高于中文平台。",
    suitableFor: "想查找特定问题答案、了解海外经验的人",
    warning: "Quora 上的回答质量参差不齐，部分回答是 SEO 营销内容。不要将其作为医疗、法律、财务等专业问题的唯一信息来源。",
    beginnerRecommended: false,
  },
  {
    name: "Tor Browser",
    alias: "洋葱浏览器",
    rating: "D",
    category: "privacy",
    domain: "https://www.torproject.org/",
    analogy: "没有直接的国内类比",
    description:
      "专注于隐私和匿名的浏览器。通过多层加密和中继节点路由你的网络流量，让你的浏览活动更难被追踪。适合注重隐私保护、需要匿名访问网络的用户。",
    suitableFor: "对隐私保护有极高要求的专业用户",
    warning: "⚠️ 重要提醒：必须从官网（torproject.org）下载，不要从任何第三方渠道。速度非常慢（因为经过多层中继），不适合日常使用。Tor 有合法的隐私保护用途，但也可能被用于非法活动。请遵守当地法律法规，不要访问非法内容。普通用户一般不需要 Tor。",
    beginnerRecommended: false,
  },
];

export const categories: { id: AppCategory; label: string; emoji: string }[] = [
  { id: "communication", label: "通讯", emoji: "💬" },
  { id: "social", label: "社交", emoji: "👥" },
  { id: "search", label: "搜索", emoji: "🔍" },
  { id: "video", label: "视频", emoji: "🎬" },
  { id: "work", label: "工作", emoji: "💼" },
  { id: "creator", label: "创作", emoji: "🎨" },
  { id: "privacy", label: "隐私", emoji: "🔒" },
];

export const ratingInfo: Record<AppRating, { label: string; color: string; bg: string; desc: string }> = {
  S: { label: "S", color: "text-amber-700", bg: "bg-amber-100", desc: "必装，没有替代" },
  A: { label: "A", color: "text-green-700", bg: "bg-green-100", desc: "强烈推荐" },
  B: { label: "B", color: "text-blue-700", bg: "bg-blue-100", desc: "按需安装" },
  C: { label: "C", color: "text-gray-600", bg: "bg-gray-100", desc: "特定需求" },
  D: { label: "D", color: "text-red-700", bg: "bg-red-100", desc: "谨慎使用" },
};
