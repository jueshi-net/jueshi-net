'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, Star, Zap, Shield, Crown, Loader2 } from 'lucide-react';

const plans = [
  {
    id: 'free',
    priceId: 'price_free',
    name: '免费版',
    price: 0,
    period: '永久免费',
    icon: Star,
    color: 'gray',
    description: '适合个人用户',
    features: [
      { text: '每日签到赚积分', included: true },
      { text: 'AI 工具基础额度', included: true },
      { text: '实用工具箱全访问', included: true },
      { text: '工作台收藏网址', included: true },
      { text: '资源库与指南', included: true },
      { text: '会员专属权益', included: false },
      { text: '高额度 AI 调用', included: false },
      { text: '优先支持', included: false },
    ],
    cta: '免费注册',
  },
  {
    id: 'pro',
    priceId: 'price_pro_month',
    name: '会员版',
    price: 29,
    period: '月',
    yearlyPrice: 290,
    icon: Zap,
    color: 'blue',
    popular: true,
    description: '高频用户与专业需求',
    features: [
      { text: '更高 AI 每日额度', included: true },
      { text: '积分加成奖励', included: true },
      { text: '全部工具箱 + 高级功能', included: true },
      { text: '无限工作台收藏', included: true },
      { text: '优先邮件支持', included: true },
      { text: '会员专属工具', included: true },
      { text: '自定义域名', included: false },
      { text: '优先新功能体验', included: true },
    ],
    cta: '加入会员',
  },
  {
    id: 'enterprise',
    priceId: 'price_enterprise',
    name: '团队版',
    price: 99,
    period: '月',
    yearlyPrice: 990,
    icon: Crown,
    color: 'purple',
    description: '适合团队和企业用户',
    features: [
      { text: '无限 AI 调用额度', included: true },
      { text: '团队协作与共享', included: true },
      { text: '全部功能 + 最高优先级', included: true },
      { text: '自定义需求对接', included: true },
      { text: '7×24 专属支持', included: true },
      { text: 'API + Webhook', included: true },
      { text: '私有化部署方案', included: true },
      { text: 'SLA 保障', included: true },
    ],
    cta: '联系销售',
  },
];

const faqs = [
  { q: '免费版有什么限制？', a: '免费版可以使用所有基础工具箱、每日签到赚积分、AI 工具基础额度。适合日常使用。' },
  { q: '积分有什么用？', a: '积分可以兑换 AI 调用次数、会员体验时长和资源权益。每日签到、完成任务均可获得积分。' },
  { q: '会员版相比免费版有哪些额外权益？', a: '会员版拥有更高的 AI 每日额度、积分加成奖励、会员专属工具和优先新功能体验。' },
  { q: '可以随时升级或降级吗？', a: '是的，您可以随时升级或降级方案。升级后立即生效，降级将在当前计费周期结束后生效。' },
  { q: '团队版是否支持私有部署？', a: '是的，团队版支持私有化部署方案，请联系销售团队获取详细信息。' },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId: string) => {
    if (planId === 'free') {
      window.location.href = '/login';
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = '/feedback';
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-3">💎 定价方案</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            选择适合您的方案，从个人免费到企业定制，灵活应对不同需求
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? 'bg-white text-blue-600' : 'text-white/80'
              }`}
            >
              月付
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isYearly ? 'bg-white text-blue-600' : 'text-white/80'
              }`}
            >
              年付 <span className="text-green-300 ml-1">省 17%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            const displayPrice = isYearly && plan.yearlyPrice 
              ? Math.round(plan.yearlyPrice / 12) 
              : plan.price;

            return (
              <div
                key={i}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-6 flex flex-col ${
                  isPopular ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    最受欢迎
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-${plan.color}-100 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? '免费' : `¥${displayPrice}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500">
                        /{isYearly ? '月 (年付)' : '月'}
                      </span>
                    )}
                  </div>
                  {isYearly && plan.yearlyPrice && (
                    <p className="text-xs text-green-600 mt-1">
                      年付 ¥{plan.yearlyPrice}，立省 ¥{plan.price * 12 - plan.yearlyPrice}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id, plan.priceId)}
                  disabled={loading === plan.id}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">常见问题</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-white rounded-lg border border-gray-200 group">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{faq.q}</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
