export default function AdBanner({ label = "赞助内容", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-[#f8fafc] py-6 px-4 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</span>
      <div className="w-full max-w-[728px] h-[90px] flex items-center justify-center bg-gray-100 rounded-xl text-sm text-gray-400">
        Google AdSense / 集运巴巴 / 合作推广
      </div>
    </div>
  );
}
