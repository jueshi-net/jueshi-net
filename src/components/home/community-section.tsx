import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function CommunitySection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200 rounded-[20px] p-8 sm:p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">社区论坛</h2>
            <p className="text-base text-gray-600 mb-6">
              提交反馈、交流使用经验、分享跨境实战心得
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bbs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-all shadow-sm"
              >
                进入论坛 <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/bbs/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-50 transition-all border border-teal-200"
              >
                发布帖子
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              新帖需审核后展示 · 请勿发布广告、灰产、引战内容
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
