export default function MyLinksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">我的导航</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
          + 添加链接
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <p>还没有添加自定义链接，点击上方按钮开始添加吧！</p>
      </div>
    </div>
  );
}
