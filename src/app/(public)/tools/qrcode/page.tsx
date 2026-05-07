"use client";
import { useState } from "react";
import { QrCode, Download, Copy, Link as LinkIcon } from "lucide-react";

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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">链接/文本</label>
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">尺寸 (px)</label>
              <input
                type="number"
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">前景色</label>
              <input
                type="color"
                value={fgColor}
                onChange={e => setFgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">背景色</label>
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
            className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            生成二维码
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col items-center justify-center">
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
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载 PNG
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(url); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex items-center gap-2"
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
      </div>
    </div>
  );
}
