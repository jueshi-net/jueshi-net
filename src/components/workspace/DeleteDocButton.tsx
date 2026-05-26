"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteDocButton({ docId }: { docId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("确定删除此单据记录？")) return;
    try {
      const res = await fetch(`/api/user/documents?id=${docId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "删除失败");
      }
    } catch (err) {
      alert("网络错误，请重试");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-gray-400 hover:text-red-600"
      title="删除"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  );
}
