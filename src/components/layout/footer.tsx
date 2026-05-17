import Link from "next/link";
import { Rss, FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">海外百宝箱</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              海外华人的常用工具与资源平台。查包裹、算运费、做单据、查邮编、找资源，一个站搞定。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">常用工具</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/tools/shipping-calculator" className="hover:text-blue-600 dark:hover:text-blue-400">运费估算</Link></li>
              <li><Link href="/tools/invoice" className="hover:text-blue-600 dark:hover:text-blue-400">发票生成</Link></li>
              <li><Link href="/tools/sensitive-goods" className="hover:text-blue-600 dark:hover:text-blue-400">敏感货参考</Link></li>
              <li><Link href="/tools/postal-code" className="hover:text-blue-600 dark:hover:text-blue-400">邮编查询</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">资源</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400">资源库</Link></li>
              <li><Link href="/guides" className="hover:text-blue-600 dark:hover:text-blue-400">指南教程</Link></li>
              <li><Link href="/nav" className="hover:text-blue-600 dark:hover:text-blue-400">网址导航</Link></li>
              <li><Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400">工具中心</Link></li>
              <li className="flex items-center gap-2">
                <Rss className="w-3 h-3" />
                <Link href="/rss.xml" className="hover:text-blue-600 dark:hover:text-blue-400">RSS 订阅</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">联系</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>深圳市海外百宝箱有限公司</li>
              <li>联系邮箱: contact@jueshi.net</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            海外百宝箱是独立工具与资源平台，不直接承运、不代收包裹、不代表任何物流服务商。
            相关价格、时效和规则请以实际服务商为准。
          </p>
          <p className="mt-2">
            部分链接可能为推广或赞助内容，海外百宝箱不对第三方服务结果作出承诺，请用户自行判断。
          </p>
        </div>
        <div className="mt-4 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} 海外百宝箱. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
