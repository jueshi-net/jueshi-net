"use client";

import { useState, useCallback } from "react";
import { Link2, Share2, Send, MessageCircle, QrCode, Copy, Check, X } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareData: { url: string; title: string; description: string } = {
    url,
    title,
    description,
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore
      }
      document.body.removeChild(textarea);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  }, [url, title, description]);

  const shareUrls = {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&margin=10`;

  // Check if native share is available (mobile)
  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="relative">
      {/* Main share button */}
      <div className="flex items-center gap-1.5">
        {/* Copy link button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="复制链接"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-600">已复制</span>
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">复制链接</span>
            </>
          )}
        </button>

        {/* Native share (mobile priority) */}
        {hasNativeShare && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="分享"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">分享</span>
          </button>
        )}

        {/* Social share dropdown toggle */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="更多分享方式"
          aria-expanded={showMenu}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">分享到</span>
        </button>
      </div>

      {/* Social share menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <div className="mb-2 flex items-center justify-between px-2 py-1">
              <span className="text-xs font-medium text-gray-500">分享到</span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭分享菜单"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {/* Telegram */}
              <a
                href={shareUrls.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-blue-50"
                aria-label="分享到 Telegram"
              >
                <Send className="h-5 w-5 text-[#0088cc]" />
                <span className="text-[10px] text-gray-600">Telegram</span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-green-50"
                aria-label="分享到 WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" />
                <span className="text-[10px] text-gray-600">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-blue-50"
                aria-label="分享到 Facebook"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-[10px] text-gray-600">Facebook</span>
              </a>

              {/* X (Twitter) */}
              <a
                href={shareUrls.x}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-gray-50"
                aria-label="分享到 X"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-[10px] text-gray-600">X</span>
              </a>
            </div>

            {/* QR Code toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border border-gray-100 p-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              aria-label="显示二维码"
              aria-expanded={showQR}
            >
              <QrCode className="h-4 w-4" />
              <span>二维码</span>
              {showQR && <Copy className="ml-auto h-3 w-3" />}
            </button>

            {/* QR Code display */}
            {showQR && (
              <div className="mt-2 flex flex-col items-center rounded-lg border border-gray-100 p-3">
                <img
                  src={qrCodeUrl}
                  alt="帖子二维码"
                  width={160}
                  height={160}
                  loading="lazy"
                  className="rounded-lg"
                />
                <p className="mt-2 text-center text-xs text-gray-400 break-all">
                  扫码访问
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
