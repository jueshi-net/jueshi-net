import { Metadata } from 'next';
import { buildTitle, buildCanonical } from '@/lib/seo';
import { Breadcrumb } from '@/components/breadcrumb';

export const metadata: Metadata = {
  title: buildTitle('服务条款'),
  description: '了解使用海外百宝箱服务时需遵守的条款与条件。',
  alternates: { canonical: buildCanonical('/terms') },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Breadcrumb />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">服务条款</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">最后更新日期：2026 年 5 月 23 日</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. 服务说明</h2>
              <p>海外百宝箱（jueshi.net）为海外华人、留学生、出海商家提供在线工具、资源和信息服务。我们的服务包括但不限于：邮编查询、单据生成、汇率换算、HS 编码查询、AI 辅助工具、专题指南等。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. 免责声明</h2>
              <p>本站提供的所有工具、内容和建议仅供参考，不构成任何法律、财务、物流或专业建议。政策、平台规则、价格等信息以官方和服务商实际公布为准。我们对因使用本站信息而产生的任何直接或间接损失不承担责任。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. 用户责任</h2>
              <p>使用我们的服务时，您同意：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>不将服务用于任何非法或未经授权的目的</li>
                <li>不干扰或破坏服务及其相关服务器和网络</li>
                <li>不对工具生成的结果进行恶意使用</li>
                <li>对自己的账号安全负责</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. 知识产权</h2>
              <p>本站原创内容、设计、代码和工具的知识产权归海外百宝箱所有。未经明确授权，不得复制、分发或用于商业目的。用户通过工具生成的文档归用户所有。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">5. 推广内容</h2>
              <p>本站可能展示第三方推广内容（以"推广"/"赞助"/"推荐"标签标注）。这些内容不代表本站的认可或担保，用户应自行判断和承担风险。我们不对第三方服务的结果作出任何承诺。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. 服务变更与终止</h2>
              <p>我们保留随时修改、暂停或终止服务的权利，无需提前通知。服务终止后，您的账号数据将在合理期限内被删除。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">7. 会员与付费服务</h2>
              <p>如本站提供付费会员服务，付费用户享有额外功能或权益。费用一经支付不予退还，除非法律另有规定。我们保留调整价格和服务内容的权利。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">8. 适用法律</h2>
              <p>本服务条款受适用法律管辖。任何因本条款引起的争议，双方应首先尝试友好协商解决。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9. 联系我们</h2>
              <p>如对本服务条款有任何疑问，请联系：</p>
              <p className="mt-2">📧 邮箱：<a href="mailto:contact@jueshi.net" className="text-teal-600 hover:underline">contact@jueshi.net</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
