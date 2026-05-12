'use client';

import { useState } from 'react';
import { MapPin, Copy, CheckCircle, AlertCircle, Info, Check } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';

interface AddressForm {
  country: string;
  name: string;
  phone: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  postalCode: string;
}

const countryConfig: Record<string, {
  postalFormat: string;
  postalRegex: string;
  postalHint: string;
  stateOptions: string[];
  phoneFormat: string;
  phoneHint: string;
  template: string;
}> = {
  '加拿大': {
    postalFormat: 'ANA NAN',
    postalRegex: '^[A-Za-z]\\d[A-Za-z]\\s?\\d[A-Za-z]\\d$',
    postalHint: '如 M5V 2T6 或 K1A0B1（6位，字母数字交替，中间空格可选）',
    stateOptions: ['AB 阿尔伯塔', 'BC 不列颠哥伦比亚', 'MB 马尼托巴', 'NB 新不伦瑞克', 'NL 纽芬兰', 'NS 新斯科舍', 'NT 西北地区', 'NU 努纳武特', 'ON 安大略', 'PE 爱德华王子岛', 'QC 魁北克', 'SK 萨斯喀彻温', 'YT 育空'],
    phoneFormat: '+1 (xxx) xxx-xxxx',
    phoneHint: '加拿大国际区号 +1，共 10 位号码',
    template: '{name}\n{street}{apt}\n{city} {state} {postal}\nCANADA\nTel: {phone}',
  },
  '美国': {
    postalFormat: 'ZIP 或 ZIP+4',
    postalRegex: '^\\d{5}(-\\d{4})?$',
    postalHint: '如 10001 或 10001-1234（5位数字或9位ZIP+4）',
    stateOptions: ['AL 阿拉巴马', 'AK 阿拉斯加', 'AZ 亚利桑那', 'AR 阿肯色', 'CA 加利福尼亚', 'CO 科罗拉多', 'CT 康涅狄格', 'DE 特拉华', 'FL 佛罗里达', 'GA 佐治亚', 'HI 夏威夷', 'ID 爱达荷', 'IL 伊利诺伊', 'IN 印第安纳', 'IA 爱荷华', 'KS 堪萨斯', 'KY 肯塔基', 'LA 路易斯安那', 'ME 缅因', 'MD 马里兰', 'MA 马萨诸塞', 'MI 密歇根', 'MN 明尼苏达', 'MS 密西西比', 'MO 密苏里', 'MT 蒙大拿', 'NE 内布拉斯加', 'NV 内华达', 'NH 新罕布什尔', 'NJ 新泽西', 'NM 新墨西哥', 'NY 纽约', 'NC 北卡罗来纳', 'ND 北达科他', 'OH 俄亥俄', 'OK 俄克拉荷马', 'OR 俄勒冈', 'PA 宾夕法尼亚', 'RI 罗德岛', 'SC 南卡罗来纳', 'SD 南达科他', 'TN 田纳西', 'TX 得克萨斯', 'UT 犹他', 'VT 佛蒙特', 'VA 弗吉尼亚', 'WA 华盛顿', 'WV 西弗吉尼亚', 'WI 威斯康星', 'WY 怀俄明'],
    phoneFormat: '+1 (xxx) xxx-xxxx',
    phoneHint: '美国国际区号 +1，共 10 位号码',
    template: '{name}\n{street}{apt}\n{city}, {state} {postal}\nUNITED STATES\nTel: {phone}',
  },
  '英国': {
    postalFormat: '字母+数字组合',
    postalRegex: '^[A-Za-z]{1,2}\\d[A-Za-z\\d]?\\s?\\d[A-Za-z]{2}$',
    postalHint: '如 SW1A 1AA 或 M1 1AE（2-4字母+数字，中间空格必填）',
    stateOptions: ['England 英格兰', 'Scotland 苏格兰', 'Wales 威尔士', 'Northern Ireland 北爱尔兰'],
    phoneFormat: '+44 xxxx xxxxxx',
    phoneHint: '英国国际区号 +44，去掉前导0，如 020 → +44 20',
    template: '{name}\n{street}{apt}\n{city}\n{state}\n{postal}\nUNITED KINGDOM\nTel: {phone}',
  },
  '澳大利亚': {
    postalFormat: '4位数字',
    postalRegex: '^\\d{4}$',
    postalHint: '如 2000（悉尼）、3000（墨尔本）、4000（布里斯班）',
    stateOptions: ['NSW 新南威尔士', 'VIC 维多利亚', 'QLD 昆士兰', 'SA 南澳大利亚', 'WA 西澳大利亚', 'TAS 塔斯马尼亚', 'NT 北部领地', 'ACT 首都领地'],
    phoneFormat: '+61 x xxxx xxxx',
    phoneHint: '澳洲国际区号 +61，去掉前导0，如 02 → +61 2',
    template: '{name}\n{street}{apt}\n{city} {state} {postal}\nAUSTRALIA\nTel: {phone}',
  },
  '新西兰': {
    postalFormat: '4位数字',
    postalRegex: '^\\d{4}$',
    postalHint: '如 1010（奥克兰）、6011（惠灵顿）',
    stateOptions: ['Auckland 奥克兰', 'Wellington 惠灵顿', 'Canterbury 坎特伯雷', 'Waikato 怀卡托', 'Bay of Plenty 丰盛湾', 'Otago 奥塔哥', '其他'],
    phoneFormat: '+64 x xxx xxxx',
    phoneHint: '新西兰国际区号 +64，去掉前导0，如 09 → +64 9',
    template: '{name}\n{street}{apt}\n{city} {state} {postal}\nNEW ZEALAND\nTel: {phone}',
  },
};

export default function AddressFormatterPage() {
  const [form, setForm] = useState<AddressForm>({
    country: '加拿大', name: '', phone: '', street: '', apt: '', city: '', state: '', postalCode: '',
  });
  const [result, setResult] = useState<{ english: string; chinese: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const update = (key: keyof AddressForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validate = (): string[] => {
    const errs: string[] = [];
    const config = countryConfig[form.country];
    if (!config) return errs;

    if (!form.name.trim()) errs.push('姓名不能为空');
    if (!form.street.trim()) errs.push('街道地址不能为空');
    if (!form.city.trim()) errs.push('城市不能为空');
    if (!form.state.trim()) errs.push('省/州不能为空，请使用两位缩写');
    if (!form.postalCode.trim()) errs.push('邮编不能为空');
    if (!form.phone.trim()) errs.push('电话号码不能为空');

    // Postal code format check
    if (form.postalCode && config.postalRegex) {
      const regex = new RegExp(config.postalRegex, 'i');
      if (!regex.test(form.postalCode.trim())) {
        errs.push(`邮编格式不正确，应为 ${config.postalFormat}（${config.postalHint}）`);
      }
    }

    // Phone check
    if (form.phone && form.country === '加拿大' || form.country === '美国') {
      const digits = form.phone.replace(/\D/g, '');
      if (form.phone.includes('+1') && digits.length !== 11) {
        errs.push('电话号码应为 +1 后跟10位数字');
      } else if (!form.phone.includes('+1') && digits.length !== 10) {
        errs.push('如未加区号，请输入10位数字');
      }
    }

    // Common mistakes
    if (form.apt && /\d/.test(form.apt) && !form.apt.match(/(apt|unit|suite|#)/i)) {
      errs.push('公寓号建议加上标识词，如 "Apt 4B" 或 "Unit 12"，不要只写数字');
    }
    if (form.state && form.state.length > 30) {
      errs.push('省/州名过长，建议使用两位缩写（如 ON、CA、NY）');
    }

    return errs;
  };

  const generate = () => {
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) return;

    const config = countryConfig[form.country];
    if (!config) return;

    const aptStr = form.apt ? `, ${form.apt}` : '';
    const english = config.template
      .replace('{name}', form.name)
      .replace('{street}', form.street)
      .replace('{apt}', aptStr)
      .replace('{city}', form.city)
      .replace('{state}', form.state)
      .replace('{postal}', form.postalCode.toUpperCase())
      .replace('{phone}', form.phone);

    const chineseLines = [
      `姓名：${form.name}`,
      `街道：${form.street}${form.apt ? '，公寓/单元号：' + form.apt : ''}`,
      `城市：${form.city}`,
      `省/州：${form.state}`,
      `邮编：${form.postalCode}`,
      `国家：${form.country}`,
      `电话：${form.phone}`,
    ];

    setResult({ english, chinese: chineseLines.join('\n') });
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.english).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const config = countryConfig[form.country];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">地址格式生成器</h1>
          <p className="text-lg text-indigo-100">输入地址信息，生成适合快递/集运填写的规范英文地址格式</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            <strong>地址格式仅供整理参考，最终以当地邮政/快递/服务商要求为准。</strong>
            不同承运商对地址格式可能有额外要求，请在寄送前向服务商确认。
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 md:p-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Form */}
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">输入地址信息</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">国家</label>
                <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={form.country} onChange={e => update('country', e.target.value)}>
                  {Object.keys(countryConfig).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名（拼音/英文）</label>
                  <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="如: Zhang San" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">电话</label>
                  <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={config.phoneFormat} value={form.phone} onChange={e => update('phone', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">{config.phoneHint}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">街道地址</label>
                <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="如: 123 Main Street" value={form.street} onChange={e => update('street', e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">公寓/单元号（可选）</label>
                <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="如: Apt 4B 或 Unit 12" value={form.apt} onChange={e => update('apt', e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">城市</label>
                  <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="如: Toronto" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">省/州</label>
                  {config.stateOptions.length > 0 ? (
                    <select className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={form.state} onChange={e => update('state', e.target.value)}>
                      <option value="">选择</option>
                      {config.stateOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="如: ON" value={form.state} onChange={e => update('state', e.target.value)} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">邮编</label>
                  <input className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={config.postalFormat} value={form.postalCode} onChange={e => update('postalCode', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">{config.postalHint}</p>
                </div>
              </div>

              <button onClick={generate}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
                <MapPin className="w-5 h-5" /> 生成地址格式
              </button>
            </div>

            {/* Output */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">生成结果</h2>

              {!result ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-500 mb-4" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">填写信息后点击生成...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* English format */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">英文标准格式（适合快递面单）</label>
                        <button onClick={copyResult}
                          className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                          {copied ? <><Check className="w-3 h-3" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制</>}
                        </button>
                      </div>
                      <pre className="bg-white dark:bg-gray-600 rounded p-4 border text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">{result.english}</pre>
                    </div>

                    {/* Chinese format */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2 block">中文说明格式（方便对照）</label>
                      <pre className="bg-white dark:bg-gray-600 rounded p-4 border text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{result.chinese}</pre>
                    </div>
                  </div>
                </>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> 请检查以下问题
                  </h3>
                  <ul className="space-y-1">
                    {errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-1">• {e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> 常见错误提醒
                </p>
                <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
                  <li>• <strong>邮编</strong>：不要填错格式，加拿大邮编字母数字交替，美国邮编只有数字，英国邮编包含字母</li>
                  <li>• <strong>省州</strong>：使用两位标准缩写（如 ON、CA、NY），不要写全称或中文</li>
                  <li>• <strong>公寓号</strong>：写清楚标识词 "Apt" / "Unit" / "Suite"，不要只写数字</li>
                  <li>• <strong>电话</strong>：必须包含国际区号，英/澳/新西兰需去掉国内前导 0</li>
                  <li>• <strong>姓名</strong>：用拼音或英文，不要用中文姓名</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* FAQ */}
        <FAQSection title="地址格式化常见问题" items={[
          { question: "为什么要格式化国际地址？", answer: "不同国家有不同的地址格式规范。格式错误的地址可能导致包裹延误、退回或无法投递。使用正确的格式可以提高投递成功率。" },
          { question: "中文地址需要翻译成英文吗？", answer: "国际包裹建议同时提供中文和英文地址。英文地址用于国际运输段，中文地址用于目的国末端派送。" },
          { question: "日本地址怎么写？", answer: "日本地址通常按从大到小顺序：邮编 → 都道府县 → 市区町村 → 町名 → 番地 → 建物名。建议同时提供日文和罗马字拼写。" },
        ]} />

        <RelatedGuidesSection slugs={["canada-postal-code-format", "what-is-consolidation-shipping"]} />
      </div>
    </div>
  );
}
