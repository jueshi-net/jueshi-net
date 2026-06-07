export default function PartnerLogos() {
  const partners = [
    "集运巴巴", "海外手机卡", "Wise", "Payoneer", "Shopify", "TikTok Shop",
  ];

  return (
    <section className="w-full bg-[#f8fafc] border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">合作伙伴</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {partners.map((p) => (
            <div key={p} className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-colors cursor-pointer">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
