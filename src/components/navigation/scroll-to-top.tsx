"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 left-6 z-50 p-3 rounded-xl shadow-lg border transition-all duration-300",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-300 dark:hover:border-blue-600",
        "active:translate-y-0",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
      aria-label="返回顶部"
      title="返回顶部"
    >
      <ArrowUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
    </button>
  );
}
