"use client";
import { useState } from "react";
import { QrCode, Download, Copy, Link as LinkIcon } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FAQSection } from "@/components/faq-section";
import { Breadcrumb } from "@/components/breadcrumb";
import { buttonVariants, inputStyles, cardStyles, labelStyles } from "@/lib/ui-styles";

export default function QRCodePage() {
  const [url, setUrl] = useState("");
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [generated, setGenerated] = useState("");

  const generate = () => {
    if (!url.trim()) return;
    const encoded = encodeURIComponent(url.trim());
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${fgColor.replace("#", "")}&bgcolor=${bgColor.replace("#", "")}&margin=10`;
    setGenerated(qrUrl);
  };

  const downloadQR = async () => {
    if (!generated) return;
    const res = await fetch(generated);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcode.png";
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <QrCode className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">二维码生成器</h1>
          <p className="text-sm text-gray-500">为链接、文本生成二维码</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className={`${cardStyles.base} space-y-4`}>
          <div>
            <label className={labelStyles.field}>链接/文本</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="https://example.com"
              className={inputStyles}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelStyles.field}>尺寸 (px)</label>
              <input
                type="number"
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles.field}>前景色</label>
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className={labelStyles.field}>背景色</label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={generate}
            className={`${buttonVariants.primary} w-full`}
          >
            <QrCode className="w-4 h-4" />
            生成二维码
          </button>
        </div>

        {/* Preview */}
        <div className={`${cardStyles.base} flex flex-col items-center justify-center`}>
          {generated ? (
            <>
              <img
                src={generated}
                alt="QR Code"
                className="max-w-full rounded-lg shadow-lg mb-4"
                style={{ width: Math.min(size, 250) }}
              />
              <div className="flex gap-2">
                <button
                  onClick={downloadQR}
                  className={buttonVariants.secondary}
                >
                  <Download className="w-4 h-4" />
                  下载 PNG
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(url); }}
                  className={buttonVariants.secondary}
                >
                  <Copy className="w-4 h-4" />
                  复制链接
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400">
              <QrCode className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>输入链接后生成二维码</p>
            </div>
          )}
        </div>

        {/* Tool-specific ads */}
        <AdSlot placement="tool-bottom" className="mb-8" />

        {/* FAQ */}
        <FAQSection title="二维码生成常见问题" items={[
          { question: "二维码最多能存储多少内容？", answer: "标准二维码最多可存储约 3000 个字符（数字模式）。中文内容通常可存储约 500-800 个汉字。" },
          { question: "二维码和条形码有什么区别？", answer: "二维码（QR Code）是二维矩阵，可存储更多数据且支持中文；条形码是一维线条，主要用于商品编号。" },
          { question: "生成的二维码可以商用吗？", answer: "QR Code 是公开标准，可以自由使用。但请确保链接内容合法合规。" },
        ]} />
      </div>
    </div>
  );
}
