import { auth } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">设置</h1>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {/* Profile */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">个人信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
              <input
                type="text"
                defaultValue={session?.user?.name || ""}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                defaultValue={session?.user?.email || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">二级域名</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
              defaultValue={""}
              placeholder="专属域名（即将上线）"
              disabled
                  className="w-48 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400 text-sm">.kjbxb.com</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              保存修改
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">工作台设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">工作台标题</label>
              <input
                type="text"
                defaultValue="我的工作台"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主题颜色</label>
              <div className="flex gap-3">
                {["blue", "green", "purple", "orange", "red"].map((c) => (
                  <button
                    key={c}
                    className={`w-8 h-8 rounded-full bg-${c}-500 hover:ring-2 hover:ring-offset-2 hover:ring-${c}-500 transition-all`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
