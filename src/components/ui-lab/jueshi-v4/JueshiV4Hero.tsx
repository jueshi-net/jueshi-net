"use client";

import Image from "next/image";

export default function JueshiV4Hero() {
  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1b1d21]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1920&q=80')] bg-cover bg-center" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 px-6 lg:px-12">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-400 font-medium">热门工具更新</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            海外华人的
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              实用工具箱
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-6 max-w-2xl">
            集运物流、外贸单据、跨境电商、留学生活 — 一站式解决海外生活工作中的各种实用需求
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-gradient-to-r from-[#5c8fff] to-[#c14bff] rounded-lg font-medium text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
              浏览全部工具
            </button>
            <button className="px-6 py-3 bg-[#2a2d35] border border-[#3a3e45] rounded-lg font-medium text-white hover:bg-[#3a3e45] transition-colors">
              留学指南
            </button>
          </div>
        </div>
      </div>

      {/* Logo Watermark */}
      <div className="absolute top-6 right-6 opacity-20">
        <Image
          src="/images/brand/jueshi-logo-crab.jpg"
          alt="绝世百宝箱 Logo"
          width={120}
          height={60}
          className="object-contain"
        />
      </div>
    </section>
  );
}
