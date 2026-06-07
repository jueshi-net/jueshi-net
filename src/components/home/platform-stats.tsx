export default function PlatformStats({ stats }: { stats: { tools: number; users: number; docs: number; topics: number } }) {
  const items = [
    { label: "工具资源", value: `${stats.tools}+` },
    { label: "原创专题", value: `${stats.topics}+` },
    { label: "生成单据", value: `${stats.docs}+` },
    { label: "注册用户", value: `${stats.users}+` },
  ];

  return (
    <section className="w-full bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {items.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">{s.value}</div>
              <div className="mt-0.5 text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
