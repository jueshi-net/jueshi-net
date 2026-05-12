'use client';

import { useState } from 'react';
import { Package, ExternalLink, Copy, Check, Trash2, ClipboardList, AlertCircle } from 'lucide-react';
import { RelatedGuidesSection } from '@/components/related-guides-section';
import { FAQSection } from '@/components/faq-section';
import { AdSlot } from '@/components/ad-slot';
import { trackEvent } from '@/lib/analytics';

interface Carrier {
  id: string;
  name: string;
  trackingUrl: string;
 官网Url: string;
  category: '中国' | '国际' | '邮政';
}

const carriers: Carrier[] = [
  { id: 'sf', name: '顺丰速运', trackingUrl: 'https://www.sf-express.com/weChat/func/movePage?code=QUERY_EXPRESS', 官网Url: 'https://www.sf-express.com', category: '中国' },
  { id: 'yto', name: '圆通速递', trackingUrl: 'https://www.yto.net.cn/', 官网Url: 'https://www.yto.net.cn', category: '中国' },
  { id: 'sto', name: '申通快递', trackingUrl: 'https://www.sto.cn/', 官网Url: 'https://www.sto.cn', category: '中国' },
  { id: 'zto', name: '中通快递', trackingUrl: 'https://www.zto.com/', 官网Url: 'https://www.zto.com', category: '中国' },
  { id: 'yunda', name: '韵达快递', trackingUrl: 'https://www.yundaex.com/', 官网Url: 'https://www.yundaex.com', category: '中国' },
  { id: 'jt', name: '极兔速递', trackingUrl: 'https://www.jtexpress.cn/', 官网Url: 'https://www.jtexpress.cn', category: '中国' },
  { id: 'ems', name: 'EMS中国邮政', trackingUrl: 'https://www.ems.com.cn/', 官网Url: 'https://www.ems.com.cn', category: '邮政' },
  { id: 'jd', name: '京东物流', trackingUrl: 'https://www.jdl.cn/', 官网Url: 'https://www.jdl.cn', category: '中国' },
  { id: 'dhl', name: 'DHL', trackingUrl: 'https://www.dhl.com/cn-zh/home/tracking.html', 官网Url: 'https://www.dhl.com', category: '国际' },
  { id: 'fedex', name: 'FedEx', trackingUrl: 'https://www.fedex.com/zh-cn/tracking.html', 官网Url: 'https://www.fedex.com', category: '国际' },
  { id: 'ups', name: 'UPS', trackingUrl: 'https://www.ups.com/track', 官网Url: 'https://www.ups.com', category: '国际' },
  { id: 'tnt', name: 'TNT', trackingUrl: 'https://www.tnt.com/express/zh_cn/site/home.html', 官网Url: 'https://www.tnt.com', category: '国际' },
  { id: 'usps', name: 'USPS', trackingUrl: 'https://tools.usps.com/go/TrackConfirmAction', 官网Url: 'https://www.usps.com', category: '邮政' },
  { id: 'canadapost', name: 'Canada Post', trackingUrl: 'https://www.canadapost-postescanada.ca/track-reperage/en#/search', 官网Url: 'https://www.canadapost.ca', category: '邮政' },
  { id: 'auspost', name: 'Australia Post', trackingUrl: 'https://auspost.com.au/mypost/track/#/search', 官网Url: 'https://auspost.com.au', category: '邮政' },
];

const carrier17track = (trackingNo: string) =>
  `https://t.17track.net/en#tracknos=${encodeURIComponent(trackingNo)}`;

export default function TrackingPage() {
  const [input, setInput] = useState('');
  const [numbers, setNumbers] = useState<string[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSingle, setCopiedSingle] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState('sf');

  // Parse input into clean tracking numbers
  const parseInput = () => {
    const raw = input
      .replace(/[，,、；;\s\n\r]+/g, '\n') // Replace common separators with newlines
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 3 && !s.match(/^[^\u4e00-\u9fa5a-zA-Z0-9]*$/)); // Remove empty / pure symbol lines

    const unique = [...new Set(raw)];
    setNumbers(unique);
  };

  const clearAll = () => { setInput(''); setNumbers([]); };

  const removeOne = (num: string) => setNumbers(prev => prev.filter(n => n !== num));

  const copyAll = () => {
    if (numbers.length === 0) return;
    navigator.clipboard.writeText(numbers.join('\n')).then(() => {
      setCopiedAll(true);
      trackEvent.trackingCopy();
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const copyOne = (num: string) => {
    navigator.clipboard.writeText(num).then(() => {
      setCopiedSingle(num);
      trackEvent.trackingCopy();
      setTimeout(() => setCopiedSingle(null), 1500);
    });
  };

  const jump17track = (num: string) => {
    trackEvent.trackingClick17track();
    window.open(carrier17track(num), '_blank');
  };

  const jumpCarrier = (carrierId: string, num?: string) => {
    const c = carriers.find(x => x.id === carrierId);
    if (!c) return;
    trackEvent.custom('tracking', 'jump_carrier');
    window.open(num ? c.trackingUrl : c.官网Url, '_blank');
  };

  const currentCarrier = carriers.find(c => c.id === selectedCarrier);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">物流追踪入口</h1>
          <p className="text-lg text-blue-100">批量单号整理 + 一键跳转承运商官网查询</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p>
              <strong>本站不保存物流轨迹，不提供承运服务。</strong>
              实际物流轨迹请以承运商官网或 17TRACK 等第三方平台为准。
              本工具仅用于整理单号和提供查询入口。
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Input & Parsed Numbers */}
          <div className="space-y-5">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                粘贴单号
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                支持粘贴多个单号，空格、逗号、分号、换行均会自动识别。
              </p>
              <textarea
                className="w-full h-36 px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                placeholder={"例：\nSF1234567890\nYT9876543210 ZTO123456\nJD0012345678"}
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="flex gap-3 mt-3">
                <button onClick={parseInput}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                  解析单号
                </button>
                <button onClick={clearAll}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-1">
                  <Trash2 className="w-4 h-4" /> 清空
                </button>
              </div>
            </div>

            {/* Parsed Numbers */}
            {numbers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    整理结果（{numbers.length} 个单号）
                  </h2>
                  <button onClick={copyAll}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                    {copiedAll ? <><Check className="w-3 h-3" /> 已复制全部</> : <><Copy className="w-3 h-3" /> 复制全部</>}
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {numbers.map((num, i) => (
                    <div key={`${num}-${i}`}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-gray-400 w-6 text-right shrink-0">{i + 1}</span>
                          <span className="font-mono text-sm text-gray-900 dark:text-white truncate">{num}</span>
                        </div>
                        <button onClick={() => removeOne(num)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0" title="移除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 pl-8">
                        <button onClick={() => copyOne(num)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded text-xs text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:text-blue-600 transition-colors">
                          {copiedSingle === num ? <><Check className="w-3 h-3 text-green-500" /> 已复制</> : <><Copy className="w-3 h-3" /> 复制单号</>}
                        </button>
                        <button onClick={() => jump17track(num)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                          <ExternalLink className="w-3 h-3" /> 在17TRACK查询
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Batch actions */}
                <div className="mt-4 pt-3 border-t dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">批量操作：</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => {
                      trackEvent.trackingClick17track();
                      const url = carrier17track(numbers.join(','));
                      window.open(url, '_blank');
                    }} className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900/50">
                      全部跳转 17TRACK
                    </button>
                    {currentCarrier && (
                      <button onClick={() => {
                        trackEvent.custom('tracking', 'jump_carrier');
                        window.open(currentCarrier.trackingUrl, '_blank');
                      }} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50">
                        前往 {currentCarrier.name} 官网
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Carrier Shortcuts */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-green-600" />
                承运商快捷入口
              </h2>

              {/* Carrier selector for quick jump */}
              <div className="mb-4">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">选择承运商</label>
                <div className="flex gap-2">
                  <select value={selectedCarrier} onChange={e => setSelectedCarrier(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
                    {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => jumpCarrier(selectedCarrier)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                    前往官网
                  </button>
                </div>
              </div>

              {/* Carrier list by category */}
              {(['中国', '国际', '邮政'] as const).map(cat => (
                <div key={cat} className="mb-4 last:mb-0">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{cat}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {carriers.filter(c => c.category === cat).map(c => (
                      <div key={c.id} className="flex gap-1">
                        <button onClick={() => { setSelectedCarrier(c.id); jumpCarrier(c.id); }}
                          className="flex-1 text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                          {c.name}
                        </button>
                        <button onClick={() => window.open(c.trackingUrl, '_blank')}
                          className="px-2 py-2 text-gray-400 hover:text-blue-600 transition-colors" title="查询">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick reference */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">💡 使用提示</h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <li>• 粘贴单号后点击"解析单号"，自动去空格、分行、去重复</li>
                <li>• 每个单号下方有"复制单号"和"在17TRACK查询"按钮，一键操作</li>
                <li>• 点击"复制全部"，可复制整理后的单号列表</li>
                <li>• 也可使用底部"全部跳转 17TRACK"批量打开查询</li>
                <li>• 17TRACK 支持全球 1500+ 承运商自动识别</li>
              </ul>
            </div>

            {/* About 17TRACK */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">📦 关于 17TRACK</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                17TRACK 是全球知名的物流追踪平台，支持自动识别 1500+ 承运商。
                如果您不确定单号属于哪家公司，可以直接在 17TRACK 查询。
              </p>
              <button onClick={() => { trackEvent.trackingClick17track(); window.open('https://t.17track.net/en', '_blank'); }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> 打开 17TRACK
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <FAQSection title="物流追踪常见问题" items={[
          {
            question: "为什么单号在官网查不到？",
            answer: "刚生成的单号可能需要 1-6 小时才能在承运商系统中查到。如果商家只是打印了面单但快递员还没揽收，也不会显示轨迹。建议拿到单号后等 24-48 小时再查。",
          },
          {
            question: "17TRACK 和承运商官网查的结果不一样？",
            answer: "17TRACK 是第三方聚合平台，数据来自各承运商 API 同步，可能有几小时延迟。最准确的轨迹请以承运商官网为准。如果 17TRACK 能查到而官网查不到，可能是单号已转为目的国本地邮政的新单号。",
          },
          {
            question: "邮政渠道的单号到国外后怎么查？",
            answer: "通过 EMS/e邮宝等邮政渠道寄出的包裹，到达目的国后通常会转为当地邮政的新单号（如中国 EMS 到美国后转为 USPS 单号）。建议使用 17TRACK 查询，它能自动关联新旧单号。",
          },
          {
            question: "什么是转运单号和末端派送单号？",
            answer: "使用集运/转运服务时会收到多个单号：国内段单号（商家→转运仓）、国际段单号（转运仓→目的国）、末端派送单号（目的国本地快递派送）。每个阶段单号不同，需要分别追踪。",
          },
          {
            question: "本站会保存我的物流信息吗？",
            answer: "不会。本站只提供单号整理和跳转查询入口，不保存任何物流轨迹或包裹信息。所有查询都在承运商官网或 17TRACK 进行。",
          },
        ]} />

        {/* Tool-specific ads */}
        <AdSlot placement="tool-tracking-after-results" className="mb-6" />
        <AdSlot placement="tool-tracking-bottom" className="mb-8" />
        <AdSlot placement="tool-bottom" className="mb-8" />

        <RelatedGuidesSection slugs={["package-tracking-sites-guide", "restricted-items-shipping-guide"]} />
      </div>
    </div>
  );
}
