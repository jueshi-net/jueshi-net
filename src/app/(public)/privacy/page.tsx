import { Metadata } from 'next';
import { buildTitle, buildCanonical } from '@/lib/seo';
import { Breadcrumb } from '@/components/breadcrumb';

export const metadata: Metadata = {
  title: buildTitle('隐私政策'),
  description: '了解海外百宝箱如何收集、使用和保护您的个人信息。',
  alternates: { canonical: buildCanonical('/privacy') },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Breadcrumb />
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">隐私政策</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">最后更新日期：2026 年 5 月 23 日</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. 信息收集</h2>
              <p>我们仅收集为提供和改进服务所必需的信息，包括：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>账号信息（邮箱地址，用于登录和通知）</li>
                <li>使用数据（工具使用记录、页面访问统计）</li>
                <li>Cookie 和类似技术（详见下文）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. Cookie 使用</h2>
              <p>我们使用 Cookie 用于以下目的：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>必要 Cookie：</strong>维持登录状态和会话安全</li>
                <li><strong>功能 Cookie：</strong>记住您的偏好设置（如国家选择）</li>
                <li><strong>分析 Cookie：</strong>了解用户如何使用我们的服务以持续改进</li>
              </ul>
              <p className="mt-2">您可以通过浏览器设置管理或拒绝 Cookie，但这可能影响部分功能。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. 信息使用</h2>
              <p>我们使用收集的信息来：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>提供、维护和改善我们的服务</li>
                <li>发送重要的服务通知</li>
                <li>分析使用趋势，优化用户体验</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">4. 信息共享</h2>
              <p>我们不会向第三方出售或出租您的个人信息。仅在以下情况下可能共享信息：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>获得您的明确同意</li>
                <li>为遵守法律法规要求</li>
                <li>与服务提供商合作（仅用于服务交付，且受保密协议约束）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">5. 数据安全</h2>
              <p>我们采取合理的技术和组织措施保护您的个人信息，包括使用 HTTPS 加密传输、安全服务器存储和定期安全审计。但请注意，没有任何互联网传输方式是完全安全的。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">6. GDPR 合规声明</h2>
              <p>如果您位于欧洲经济区（EEA），根据《通用数据保护条例》（GDPR），您享有以下权利：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>访问、更正或删除您的个人数据</li>
                <li>限制或反对我们处理您的个人数据</li>
                <li>数据可携带权（获取您提供的数据副本）</li>
                <li>随时撤回同意（不影响撤回前的处理合法性）</li>
              </ul>
              <p className="mt-2">如需行使上述权利，请联系 <a href="mailto:contact@jueshi.net" className="text-teal-600 hover:underline">contact@jueshi.net</a>。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">7. 数据保留</h2>
              <p>我们仅在实现本政策所述目的所需的时间内保留您的个人信息。账号注销后，我们将在合理期限内删除或匿名化您的数据。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">8. 政策更新</h2>
              <p>我们可能会不时更新本隐私政策。重大变更时，我们将通过网站公告或邮件通知您。继续使用我们的服务即表示您接受更新后的政策。</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">9. 联系我们</h2>
              <p>如对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</p>
              <p className="mt-2">📧 邮箱：<a href="mailto:contact@jueshi.net" className="text-teal-600 hover:underline">contact@jueshi.net</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
