export default function BannerAd() {
  return (
    <div className="px-4 max-w-7xl mx-auto py-3">
      <div className="w-full bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-3 h-[80px] relative overflow-hidden transition hover:border-gray-300">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="text-center z-10 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">AD</span>
          <span className="text-xs text-gray-400">赞助合作请联系 <span className="font-medium text-gray-500">admin@jueshi.net</span></span>
          <span className="hidden font-mono text-[10px] text-gray-300 sm:inline">728 × 90</span>
        </div>
      </div>
    </div>
  );
}
